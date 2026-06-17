// ---------------------------------------------------------------------------
// Datenmodell für MoneyTimeline Studio
// ---------------------------------------------------------------------------

export type Country = "DE" | "CH";
export type Currency = "EUR" | "CHF";

/** Art der Sparrate, die in die Simulation einfließt. */
export type SavingsMode = "fixed" | "budget";

/** Grundtypen für Lebensereignisse. Templates bauen intern auf diesen auf. */
export type EventType =
  | "one_time_expense"
  | "one_time_income"
  | "recurring_expense"
  | "recurring_income"
  | "savings_rate_change"
  | "income_change"
  | "crash";

export type Recurrence = "once" | "monthly" | "yearly";

export interface LifeEvent {
  id: string;
  type: EventType;
  name: string;
  /** Alter, in dem das Ereignis startet. */
  age: number;
  /** Geldbetrag bzw. Prozentwert je nach Ereignistyp. */
  amount: number;
  recurrence: Recurrence;
  /** Optionale Dauer in Jahren für wiederkehrende Ereignisse. */
  durationYears?: number;
  category?: string;
  description?: string;
  /** Optionale Kennzeichnung des verwendeten Templates. */
  templateKey?: string;
  enabled: boolean;
}

// ---- Budget -----------------------------------------------------------------

export interface BudgetItem {
  id: string;
  label: string;
  amount: number;
}

export interface BudgetGroup {
  id: string;
  title: string;
  items: BudgetItem[];
}

export interface Budget {
  fixed: BudgetGroup;
  variable: BudgetGroup;
  reserves: BudgetGroup;
}

// ---- Startdaten -------------------------------------------------------------

export interface StartData {
  country: Country;
  currency: Currency;
  currentAge: number;
  targetAge: number;
  startWealth: number;
  /** Erwartete jährliche Rendite, z. B. 0.08 für 8 %. */
  annualReturn: number;
  /** Inflation pro Jahr, z. B. 0.02 für 2 %. */
  annualInflation: number;
  /** Optionale jährliche Gehaltssteigerung, z. B. 0.02. */
  annualSalaryGrowth: number;
  /** Anfangs-Nettoeinkommen pro Monat. */
  netIncome: number;
  /** Inflation auch auf das Einkommen anwenden? */
  inflateIncome: boolean;
}

// ---- Szenario & Plan --------------------------------------------------------

export interface Scenario {
  id: string;
  name: string;
  start: StartData;
  budget: Budget;
  savingsMode: SavingsMode;
  /** Feste Sparrate, falls savingsMode === "fixed". */
  fixedSavings: number;
  events: LifeEvent[];
  /** Markiert das Basisszenario für den Vergleich. */
  isBaseline?: boolean;
}

export interface Plan {
  scenarios: Scenario[];
  activeScenarioId: string;
  baselineScenarioId: string;
  advisor: AdvisorSettings;
  /** Wurde der Einführungs-Assistent bereits durchlaufen/übersprungen? */
  onboarded?: boolean;
}

export interface AdvisorSettings {
  enabled: boolean;
  clientName: string;
  caseName: string;
}

// ---- Projektionsergebnisse --------------------------------------------------

export interface ProjectionMonth {
  monthIndex: number;
  age: number;
  startWealth: number;
  contribution: number;
  returnAmount: number;
  endWealth: number;
}

export interface ProjectionYear {
  age: number;
  year: number;
  startWealth: number;
  contributions: number;
  returnAmount: number;
  /** Namen der in diesem Jahr aktiven Ereignisse. */
  events: string[];
  endWealth: number;
  realEndWealth: number;
  /** Summe der bis hierhin eingezahlten Eigenmittel (ohne Rendite). */
  cumulativeContributions: number;
}

export interface ProjectionResult {
  years: ProjectionYear[];
  finalWealth: number;
  finalRealWealth: number;
  totalContributions: number;
  totalReturns: number;
  /** Alter, in dem die jeweilige Schwelle erreicht wird (oder null). */
  ageAt100k: number | null;
  ageAt500k: number | null;
  ageAt1m: number | null;
  /** Monatliche Sparrate zu Beginn der Simulation. */
  initialMonthlySavings: number;
  /** Gibt es Monate mit negativer Sparrate? */
  hasNegativeSavings: boolean;
}
