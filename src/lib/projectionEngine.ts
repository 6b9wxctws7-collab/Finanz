// ---------------------------------------------------------------------------
// projectionEngine.ts
//
// Monatsgenaue Vermögenssimulation. Die Engine ist bewusst frei von
// React/DOM, damit sie isoliert testbar bleibt.
// ---------------------------------------------------------------------------

import { totalBudgetExpenses } from "./budget";
import {
  LifeEvent,
  ProjectionResult,
  ProjectionYear,
  Scenario,
} from "./types";

/** Jährliche Rendite in monatliche Rendite umrechnen. */
export function toMonthlyRate(annual: number): number {
  return Math.pow(1 + annual, 1 / 12) - 1;
}

/** Monat (0-basiert), in dem ein Ereignis bezogen auf das Startalter beginnt. */
function eventStartMonth(event: LifeEvent, currentAge: number): number {
  return Math.round((event.age - currentAge) * 12);
}

/** Letzter aktiver Monat eines (wiederkehrenden) Ereignisses, inklusive. */
function eventEndMonth(event: LifeEvent, currentAge: number, totalMonths: number): number {
  const start = eventStartMonth(event, currentAge);
  if (event.durationYears && event.durationYears > 0) {
    return start + Math.round(event.durationYears * 12) - 1;
  }
  return totalMonths - 1;
}

/** Prüft, ob ein wiederkehrendes Ereignis in einem gegebenen Monat „feuert". */
function firesThisMonth(event: LifeEvent, monthIndex: number, currentAge: number, totalMonths: number): boolean {
  const start = eventStartMonth(event, currentAge);
  const end = eventEndMonth(event, currentAge, totalMonths);
  if (monthIndex < start || monthIndex > end) return false;
  if (event.recurrence === "monthly") return true;
  if (event.recurrence === "yearly") return (monthIndex - start) % 12 === 0;
  return monthIndex === start; // "once"
}

/**
 * Hauptfunktion: simuliert das Vermögen Monat für Monat vom aktuellen Alter
 * bis zum Zielalter und aggregiert die Ergebnisse auf Jahresebene.
 */
export function runProjection(scenario: Scenario, calendarYear = new Date().getFullYear()): ProjectionResult {
  const { start } = scenario;
  const currentAge = Math.max(0, Math.floor(start.currentAge));
  const targetAge = Math.max(currentAge + 1, Math.floor(start.targetAge));
  const totalYears = targetAge - currentAge;
  const totalMonths = totalYears * 12;

  const monthlyReturn = toMonthlyRate(start.annualReturn);
  const monthlyInflation = toMonthlyRate(start.annualInflation);

  // Monatliche Basis-Sparrate aus Budget oder fixem Wert.
  const budgetExpenses = totalBudgetExpenses(scenario.budget);
  const baseContribution =
    scenario.savingsMode === "fixed"
      ? scenario.fixedSavings
      : start.netIncome - budgetExpenses;

  const enabledEvents = scenario.events.filter((e) => e.enabled);

  let wealth = start.startWealth;
  let cumulativeContributions = start.startWealth; // eingezahltes Eigenkapital
  let hasNegativeSavings = false;

  const years: ProjectionYear[] = [];

  // Laufende Jahresaggregation.
  let yearStartWealth = wealth;
  let yearContributions = 0;
  let yearReturns = 0;
  let yearEventNames = new Set<string>();

  let ageAt100k: number | null = null;
  let ageAt500k: number | null = null;
  let ageAt1m: number | null = null;
  const initialMonthlySavings = baseContribution;

  for (let m = 0; m < totalMonths; m++) {
    const yearElapsed = Math.floor(m / 12);

    // --- 1. Einkommen -------------------------------------------------------
    // Geplantes Einkommen: Gehaltssteigerung jährlich, optional Inflation.
    const salaryGrowthFactor = Math.pow(1 + start.annualSalaryGrowth, yearElapsed);
    const incomeInflationFactor = start.inflateIncome
      ? Math.pow(1 + monthlyInflation, m)
      : 1;
    const scheduledIncome = start.netIncome * salaryGrowthFactor * incomeInflationFactor;

    // --- 2. Ausgaben --------------------------------------------------------
    const expenseInflationFactor = Math.pow(1 + monthlyInflation, m);
    const scheduledExpenses =
      scenario.savingsMode === "fixed"
        ? scheduledIncome - scenario.fixedSavings
        : budgetExpenses * expenseInflationFactor;

    // --- 3. Sparrate (vor Ereignis-Cashflows) ------------------------------
    // Geplante Einkommens-/Ausgabenbasis inkl. Wachstum.
    let plannedBase =
      scenario.savingsMode === "fixed"
        ? scenario.fixedSavings * salaryGrowthFactor
        : scheduledIncome - scheduledExpenses;

    // --- 4. Ereignisse anwenden --------------------------------------------
    let incomeChangeMultiplier = 1;
    let recurringDelta = 0; // wiederkehrende Einnahmen (+) / Ausgaben (-)
    let lumpSum = 0; // einmalige Einnahmen (+) / Ausgaben (-)
    let savingsOverride: number | null = null;
    let crashFactor = 1;

    for (const ev of enabledEvents) {
      if (!firesThisMonth(ev, m, currentAge, totalMonths)) continue;
      switch (ev.type) {
        case "income_change":
          // amount als Prozent, z. B. -20 => 80 % Einkommen.
          incomeChangeMultiplier *= 1 + ev.amount / 100;
          yearEventNames.add(ev.name);
          break;
        case "savings_rate_change":
          savingsOverride = ev.amount;
          yearEventNames.add(ev.name);
          break;
        case "recurring_income":
          recurringDelta += ev.amount;
          yearEventNames.add(ev.name);
          break;
        case "recurring_expense":
          recurringDelta -= ev.amount;
          yearEventNames.add(ev.name);
          break;
        case "one_time_income":
          lumpSum += ev.amount;
          yearEventNames.add(ev.name);
          break;
        case "one_time_expense":
          lumpSum -= ev.amount;
          yearEventNames.add(ev.name);
          break;
        case "crash":
          // amount als Prozent Verlust, z. B. 30 => -30 %.
          crashFactor *= 1 - ev.amount / 100;
          yearEventNames.add(ev.name);
          break;
      }
    }

    // Einkommensänderung (Teilzeit) reduziert die geplante Sparrate um den
    // wegfallenden Einkommensanteil.
    if (incomeChangeMultiplier !== 1) {
      const incomeReduction = scheduledIncome * (1 - incomeChangeMultiplier);
      plannedBase -= incomeReduction;
    }

    // Sparraten-Override ersetzt die Basis vollständig.
    let contribution = (savingsOverride !== null ? savingsOverride : plannedBase) + recurringDelta;

    if (contribution < 0) hasNegativeSavings = true;

    // --- 5./6. Cashflows verbuchen und Rendite anwenden --------------------
    const startWealthMonth = wealth;
    wealth *= crashFactor; // Crash trifft das bestehende Depot.
    wealth += lumpSum; // einmalige Ein-/Auszahlungen
    wealth += contribution; // Sparrate investieren

    const returnAmount = wealth * monthlyReturn;
    wealth += returnAmount;

    // eingezahltes Kapital (ohne Rendite, inkl. Crash-Verlust als negativ).
    cumulativeContributions += contribution + lumpSum + startWealthMonth * (crashFactor - 1);

    // Jahresaggregation.
    yearContributions += contribution + lumpSum;
    yearReturns += returnAmount + startWealthMonth * (crashFactor - 1);

    // Schwellenwerte erfassen.
    const ageNow = currentAge + (m + 1) / 12;
    if (ageAt100k === null && wealth >= 100_000) ageAt100k = ageNow;
    if (ageAt500k === null && wealth >= 500_000) ageAt500k = ageNow;
    if (ageAt1m === null && wealth >= 1_000_000) ageAt1m = ageNow;

    // Jahresabschluss am Ende jedes 12-Monats-Blocks.
    if ((m + 1) % 12 === 0) {
      const yearNumber = yearElapsed + 1;
      const realFactor = Math.pow(1 + start.annualInflation, yearNumber);
      years.push({
        age: currentAge + yearNumber,
        year: calendarYear + yearNumber,
        startWealth: yearStartWealth,
        contributions: yearContributions,
        returnAmount: yearReturns,
        events: Array.from(yearEventNames),
        endWealth: wealth,
        realEndWealth: wealth / realFactor,
        cumulativeContributions,
      });
      // Reset für nächstes Jahr.
      yearStartWealth = wealth;
      yearContributions = 0;
      yearReturns = 0;
      yearEventNames = new Set<string>();
    }
  }

  const finalWealth = wealth;
  const finalRealWealth = finalWealth / Math.pow(1 + start.annualInflation, totalYears);
  const totalReturns = finalWealth - cumulativeContributions;

  return {
    years,
    finalWealth,
    finalRealWealth,
    totalContributions: cumulativeContributions,
    totalReturns,
    ageAt100k,
    ageAt500k,
    ageAt1m,
    initialMonthlySavings,
    hasNegativeSavings,
  };
}

/** Bequemer Helfer: nur das Endvermögen eines Szenarios. */
export function finalWealthOf(scenario: Scenario): number {
  return runProjection(scenario).finalWealth;
}
