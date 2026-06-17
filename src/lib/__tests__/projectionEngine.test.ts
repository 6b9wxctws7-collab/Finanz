import { describe, expect, it } from "vitest";
import { runProjection, toMonthlyRate } from "../projectionEngine";
import { defaultBudget, demoScenario, emptyScenario } from "../seed";
import { Scenario } from "../types";

/** Hilfsfunktion: Szenario ohne Budget-Ausgaben, feste Sparrate. */
function fixedScenario(overrides: Partial<Scenario["start"]> = {}, fixedSavings = 0): Scenario {
  const sc = emptyScenario("Test");
  sc.savingsMode = "fixed";
  sc.fixedSavings = fixedSavings;
  sc.budget = defaultBudget();
  sc.start = {
    ...sc.start,
    currentAge: 30,
    targetAge: 31,
    startWealth: 0,
    annualReturn: 0,
    annualInflation: 0,
    annualSalaryGrowth: 0,
    netIncome: 0,
    ...overrides,
  };
  return sc;
}

describe("toMonthlyRate", () => {
  it("rechnet 8 % jährlich korrekt in eine monatliche Rate um", () => {
    const m = toMonthlyRate(0.08);
    // 12-fache Aufzinsung muss wieder ~8 % ergeben
    expect(Math.pow(1 + m, 12) - 1).toBeCloseTo(0.08, 10);
  });
  it("gibt 0 für 0 % zurück", () => {
    expect(toMonthlyRate(0)).toBe(0);
  });
});

describe("runProjection – Grundlagen", () => {
  it("ohne Rendite und Sparrate bleibt das Startvermögen erhalten", () => {
    const sc = fixedScenario({ startWealth: 50000, targetAge: 40 }, 0);
    const r = runProjection(sc);
    expect(r.finalWealth).toBeCloseTo(50000, 2);
    expect(r.totalReturns).toBeCloseTo(0, 2);
  });

  it("zahlt eine feste Sparrate korrekt ein (ohne Rendite)", () => {
    // 12 Monate * 100 = 1200, ein Jahr
    const sc = fixedScenario({ startWealth: 0, targetAge: 31 }, 100);
    const r = runProjection(sc);
    expect(r.finalWealth).toBeCloseTo(1200, 2);
    expect(r.totalContributions).toBeCloseTo(1200, 2);
  });

  it("verzinst das Startvermögen über ein Jahr näherungsweise mit der Jahresrendite", () => {
    const sc = fixedScenario({ startWealth: 1000, annualReturn: 0.08, targetAge: 31 }, 0);
    const r = runProjection(sc);
    // Monatliche Aufzinsung ergibt wieder ~8 % aufs Jahr
    expect(r.finalWealth).toBeCloseTo(1080, 0);
  });

  it("erfasst die Jahre korrekt", () => {
    const sc = fixedScenario({ currentAge: 30, targetAge: 35 }, 0);
    const r = runProjection(sc);
    expect(r.years).toHaveLength(5);
    expect(r.years[0].age).toBe(31);
    expect(r.years[4].age).toBe(35);
  });
});

describe("runProjection – Inflation", () => {
  it("reales Endvermögen ist bei Inflation kleiner als das nominale", () => {
    const sc = fixedScenario({ startWealth: 100000, annualInflation: 0.02, targetAge: 50 }, 0);
    const r = runProjection(sc);
    expect(r.finalRealWealth).toBeLessThan(r.finalWealth);
    // 100k über 20 Jahre bei 2 % => ~67k Kaufkraft
    expect(r.finalRealWealth).toBeCloseTo(100000 / Math.pow(1.02, 20), 0);
  });
});

describe("runProjection – Ereignisse", () => {
  it("eine einmalige Ausgabe reduziert das Endvermögen entsprechend", () => {
    const sc = fixedScenario({ startWealth: 10000, targetAge: 40 }, 0);
    sc.events = [
      {
        id: "e1",
        type: "one_time_expense",
        name: "Auto",
        age: 31,
        amount: 5000,
        recurrence: "once",
        enabled: true,
      },
    ];
    const r = runProjection(sc);
    expect(r.finalWealth).toBeCloseTo(5000, 2);
  });

  it("ein Crash reduziert das Depot um den Prozentsatz", () => {
    const sc = fixedScenario({ startWealth: 10000, targetAge: 40 }, 0);
    sc.events = [
      { id: "c", type: "crash", name: "Crash", age: 31, amount: 30, recurrence: "once", enabled: true },
    ];
    const r = runProjection(sc);
    expect(r.finalWealth).toBeCloseTo(7000, 2);
  });

  it("ein Crash zählt als Renditeverlust, nicht als Kapitalabbau", () => {
    // Nur Startvermögen, keine Sparrate/Rendite: 10.000 → Crash -30 % → 7.000.
    const sc = fixedScenario({ startWealth: 10000, targetAge: 40 }, 0);
    sc.events = [
      { id: "c", type: "crash", name: "Crash", age: 31, amount: 30, recurrence: "once", enabled: true },
    ];
    const r = runProjection(sc);
    // Eingezahltes Kapital bleibt das Startkapital (kein Cashflow abgeflossen).
    expect(r.totalContributions).toBeCloseTo(10000, 2);
    // Der Verlust schlägt sich vollständig in der (negativen) Rendite nieder.
    expect(r.totalReturns).toBeCloseTo(-3000, 2);
    // Invariante: Endvermögen = Kapital + Rendite.
    expect(r.totalContributions + r.totalReturns).toBeCloseTo(r.finalWealth, 2);
  });

  it("ein deaktiviertes Ereignis wird ignoriert", () => {
    const sc = fixedScenario({ startWealth: 10000, targetAge: 40 }, 0);
    sc.events = [
      { id: "x", type: "one_time_expense", name: "X", age: 31, amount: 5000, recurrence: "once", enabled: false },
    ];
    expect(runProjection(sc).finalWealth).toBeCloseTo(10000, 2);
  });

  it("eine Sparraten-Änderung überschreibt die Basis-Sparrate", () => {
    const sc = fixedScenario({ startWealth: 0, targetAge: 32 }, 100);
    // ab Alter 31 (Monat 12) wird die Rate auf 200 gesetzt
    sc.events = [
      { id: "s", type: "savings_rate_change", name: "Mehr sparen", age: 31, amount: 200, recurrence: "monthly", enabled: true },
    ];
    const r = runProjection(sc);
    // Jahr 1: 12*100=1200, Jahr 2: 12*200=2400 => 3600
    expect(r.finalWealth).toBeCloseTo(3600, 2);
  });
});

describe("runProjection – Budget & negative Sparrate", () => {
  it("budgetbasierte Sparrate = Einkommen minus Ausgaben", () => {
    const sc = emptyScenario("Budget");
    sc.savingsMode = "budget";
    sc.start = {
      ...sc.start,
      currentAge: 30,
      targetAge: 31,
      startWealth: 0,
      netIncome: 3000,
      annualReturn: 0,
      annualInflation: 0,
      annualSalaryGrowth: 0,
    };
    sc.budget.fixed.items[0].amount = 2000; // Ausgaben 2000
    const r = runProjection(sc);
    expect(r.initialMonthlySavings).toBeCloseTo(1000, 2);
    expect(r.finalWealth).toBeCloseTo(12000, 2); // 12 * 1000
  });

  it("erkennt negative Sparrate als Warnsignal", () => {
    const sc = fixedScenario({ targetAge: 35 }, -100);
    const r = runProjection(sc);
    expect(r.hasNegativeSavings).toBe(true);
  });
});

describe("runProjection – Schwellenwerte", () => {
  it("findet das Alter, in dem 100k erreicht werden", () => {
    const sc = fixedScenario({ startWealth: 99000, targetAge: 45 }, 100);
    const r = runProjection(sc);
    expect(r.ageAt100k).not.toBeNull();
    expect(r.ageAt100k! - 30).toBeGreaterThan(0);
  });

  it("gibt null zurück, wenn eine Schwelle nie erreicht wird", () => {
    const sc = fixedScenario({ startWealth: 0, targetAge: 31 }, 0);
    expect(runProjection(sc).ageAt1m).toBeNull();
  });
});

describe("runProjection – Demo-Szenario", () => {
  it("liefert plausible Werte für das Demo-Szenario", () => {
    const r = runProjection(demoScenario());
    expect(r.years.length).toBe(65 - 26);
    expect(r.finalWealth).toBeGreaterThan(0);
    // Mit ~1250 Sparrate und 8 % über fast 40 Jahre sollte es trotz Wohnungskauf hoch sein
    expect(r.finalWealth).toBeGreaterThan(500000);
    expect(r.finalRealWealth).toBeLessThan(r.finalWealth);
  });
});
