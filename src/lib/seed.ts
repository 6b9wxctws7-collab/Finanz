import { uid } from "./id";
import { Budget, Plan, Scenario, StartData } from "./types";

/** Standard-Startdaten für ein neues Szenario. */
export function defaultStartData(): StartData {
  return {
    country: "DE",
    currency: "EUR",
    currentAge: 30,
    targetAge: 65,
    startWealth: 10000,
    annualReturn: 0.08,
    annualInflation: 0.02,
    annualSalaryGrowth: 0.01,
    netIncome: 3200,
    inflateIncome: true,
  };
}

/** Leeres Budget-Gerüst mit allen Kategorien aus der Spezifikation. */
export function defaultBudget(): Budget {
  return {
    fixed: {
      id: "fixed",
      title: "Fixkosten",
      items: [
        { id: uid("b"), label: "Miete / Wohnen", amount: 0 },
        { id: uid("b"), label: "Krankenkasse", amount: 0 },
        { id: uid("b"), label: "Strom / Wärme", amount: 0 },
        { id: uid("b"), label: "Internet / Handy", amount: 0 },
        { id: uid("b"), label: "Versicherungen", amount: 0 },
        { id: uid("b"), label: "Mobilität", amount: 0 },
        { id: uid("b"), label: "Kredite", amount: 0 },
      ],
    },
    variable: {
      id: "variable",
      title: "Variable Ausgaben",
      items: [
        { id: uid("b"), label: "Lebensmittel", amount: 0 },
        { id: uid("b"), label: "Restaurants", amount: 0 },
        { id: uid("b"), label: "Freizeit", amount: 0 },
        { id: uid("b"), label: "Kleidung", amount: 0 },
        { id: uid("b"), label: "Reisen", amount: 0 },
        { id: uid("b"), label: "Haustier", amount: 0 },
        { id: uid("b"), label: "Sonstiges", amount: 0 },
      ],
    },
    reserves: {
      id: "reserves",
      title: "Rücklagen",
      items: [
        { id: uid("b"), label: "Urlaub", amount: 0 },
        { id: uid("b"), label: "Notgroschen", amount: 0 },
        { id: uid("b"), label: "Auto", amount: 0 },
        { id: uid("b"), label: "Zahnarzt / Gesundheit", amount: 0 },
        { id: uid("b"), label: "Möbel", amount: 0 },
        { id: uid("b"), label: "Weiterbildung", amount: 0 },
      ],
    },
  };
}

/** Frisches, leeres Szenario. */
export function emptyScenario(name = "Neues Szenario"): Scenario {
  return {
    id: uid("sc"),
    name,
    start: defaultStartData(),
    budget: defaultBudget(),
    savingsMode: "budget",
    fixedSavings: 500,
    events: [],
  };
}

/** Demo-Szenario gemäß Spezifikation (Schweiz, 26 Jahre). */
export function demoScenario(): Scenario {
  return {
    id: uid("sc"),
    name: "Demo: Lena, 26 (CH)",
    isBaseline: true,
    start: {
      country: "CH",
      currency: "CHF",
      currentAge: 26,
      targetAge: 65,
      startWealth: 42000,
      annualReturn: 0.08,
      annualInflation: 0.02,
      annualSalaryGrowth: 0.015,
      netIncome: 5450,
      inflateIncome: true,
    },
    savingsMode: "budget",
    fixedSavings: 1245,
    // Realistisches Budget für eine 26-Jährige in der Schweiz: hohe Lebens-
    // haltungskosten, Pflicht-Krankenkasse, ÖV statt Auto. Netto 5.450 minus
    // Ausgaben (4.205) ergibt eine plausible Sparrate von ~1.245 CHF/Monat.
    budget: {
      fixed: {
        id: "fixed",
        title: "Fixkosten",
        items: [
          { id: uid("b"), label: "Miete / Wohnen", amount: 1600 },
          { id: uid("b"), label: "Krankenkasse", amount: 350 },
          { id: uid("b"), label: "Strom / Wärme", amount: 70 },
          { id: uid("b"), label: "Internet / Handy", amount: 95 },
          { id: uid("b"), label: "Versicherungen", amount: 90 },
          { id: uid("b"), label: "Mobilität", amount: 180 },
          { id: uid("b"), label: "Kredite", amount: 0 },
        ],
      },
      variable: {
        id: "variable",
        title: "Variable Ausgaben",
        items: [
          { id: uid("b"), label: "Lebensmittel", amount: 550 },
          { id: uid("b"), label: "Restaurants", amount: 250 },
          { id: uid("b"), label: "Freizeit", amount: 180 },
          { id: uid("b"), label: "Kleidung", amount: 100 },
          { id: uid("b"), label: "Reisen", amount: 200 },
          { id: uid("b"), label: "Haustier", amount: 0 },
          { id: uid("b"), label: "Sonstiges", amount: 120 },
        ],
      },
      reserves: {
        id: "reserves",
        title: "Rücklagen",
        items: [
          { id: uid("b"), label: "Urlaub", amount: 100 },
          { id: uid("b"), label: "Notgroschen", amount: 150 },
          { id: uid("b"), label: "Auto", amount: 0 },
          { id: uid("b"), label: "Zahnarzt / Gesundheit", amount: 70 },
          { id: uid("b"), label: "Möbel", amount: 40 },
          { id: uid("b"), label: "Weiterbildung", amount: 60 },
        ],
      },
    },
    events: [
      {
        id: uid("ev"),
        type: "recurring_income",
        name: "Gehaltserhöhung",
        age: 30,
        amount: 600,
        recurrence: "monthly",
        category: "Einkommen",
        templateKey: "raise",
        enabled: true,
      },
      {
        id: uid("ev"),
        type: "one_time_expense",
        name: "Autokauf",
        age: 32,
        amount: 34000,
        recurrence: "once",
        category: "Mobilität",
        templateKey: "car",
        enabled: true,
      },
      {
        id: uid("ev"),
        type: "recurring_expense",
        name: "Auto laufende Kosten",
        age: 32,
        amount: 420,
        recurrence: "monthly",
        category: "Mobilität",
        templateKey: "car",
        enabled: true,
      },
      {
        id: uid("ev"),
        type: "one_time_expense",
        name: "Wohnungskauf (Eigenkapital)",
        age: 40,
        amount: 210000,
        recurrence: "once",
        category: "Wohnen",
        templateKey: "home",
        enabled: true,
      },
      {
        id: uid("ev"),
        type: "income_change",
        name: "Teilzeit (-20 %)",
        age: 45,
        amount: -20,
        recurrence: "monthly",
        category: "Einkommen",
        templateKey: "parttime",
        enabled: true,
      },
    ],
  };
}

/** Kompletter Demo-Plan mit Basisszenario. */
export function demoPlan(): Plan {
  const base = demoScenario();
  return {
    scenarios: [base],
    activeScenarioId: base.id,
    baselineScenarioId: base.id,
    advisor: { enabled: false, clientName: "", caseName: "Kundenfall 1" },
  };
}

/** Leerer Start-Plan für neue Nutzer. */
export function freshPlan(): Plan {
  const base = emptyScenario("Basisszenario");
  base.isBaseline = true;
  return {
    scenarios: [base],
    activeScenarioId: base.id,
    baselineScenarioId: base.id,
    advisor: { enabled: false, clientName: "", caseName: "Kundenfall 1" },
  };
}
