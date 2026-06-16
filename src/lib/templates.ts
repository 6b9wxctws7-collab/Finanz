import { uid } from "./id";
import { LifeEvent } from "./types";

export interface EventTemplate {
  key: string;
  label: string;
  emoji: string;
  description: string;
  /** Erzeugt eine oder mehrere konkrete Ereignisse aus dem Template. */
  build: (age: number) => LifeEvent[];
}

function base(partial: Omit<LifeEvent, "id" | "enabled">): LifeEvent {
  return { id: uid("ev"), enabled: true, ...partial };
}

/**
 * Vorgefertigte Templates. Sie basieren intern auf den einfachen Grundtypen
 * (one_time_expense, recurring_expense, income_change, crash, …).
 */
export const eventTemplates: EventTemplate[] = [
  {
    key: "car",
    label: "Auto kaufen",
    emoji: "🚗",
    description: "Einmaliger Kaufpreis plus laufende monatliche Kosten.",
    build: (age) => [
      base({
        type: "one_time_expense",
        name: "Autokauf",
        age,
        amount: 34000,
        recurrence: "once",
        category: "Mobilität",
        templateKey: "car",
      }),
      base({
        type: "recurring_expense",
        name: "Auto laufende Kosten",
        age,
        amount: 400,
        recurrence: "monthly",
        category: "Mobilität",
        templateKey: "car",
      }),
    ],
  },
  {
    key: "raise",
    label: "Gehaltserhöhung",
    emoji: "📈",
    description: "Dauerhaft höheres Einkommen pro Monat.",
    build: (age) => [
      base({
        type: "recurring_income",
        name: "Gehaltserhöhung",
        age,
        amount: 500,
        recurrence: "monthly",
        category: "Einkommen",
        templateKey: "raise",
      }),
    ],
  },
  {
    key: "home",
    label: "Wohnung kaufen",
    emoji: "🏠",
    description: "Eigenkapitalabfluss beim Immobilienkauf.",
    build: (age) => [
      base({
        type: "one_time_expense",
        name: "Wohnungskauf (Eigenkapital)",
        age,
        amount: 200000,
        recurrence: "once",
        category: "Wohnen",
        templateKey: "home",
      }),
    ],
  },
  {
    key: "parttime",
    label: "Teilzeit",
    emoji: "🌴",
    description: "Einkommensreduktion, z. B. auf 80 %.",
    build: (age) => [
      base({
        type: "income_change",
        name: "Teilzeit (-20 %)",
        age,
        amount: -20,
        recurrence: "monthly",
        category: "Einkommen",
        templateKey: "parttime",
      }),
    ],
  },
  {
    key: "sabbatical",
    label: "Sabbatical",
    emoji: "✈️",
    description: "Ein Jahr ohne Einkommen (-100 % für 12 Monate).",
    build: (age) => [
      base({
        type: "income_change",
        name: "Sabbatical",
        age,
        amount: -100,
        recurrence: "monthly",
        durationYears: 1,
        category: "Einkommen",
        templateKey: "sabbatical",
      }),
    ],
  },
  {
    key: "child",
    label: "Kind",
    emoji: "🍼",
    description: "Laufende Mehrkosten für 18 Jahre.",
    build: (age) => [
      base({
        type: "recurring_expense",
        name: "Kind (laufende Kosten)",
        age,
        amount: 700,
        recurrence: "monthly",
        durationYears: 18,
        category: "Familie",
        templateKey: "child",
      }),
    ],
  },
  {
    key: "education",
    label: "Weiterbildung",
    emoji: "🎓",
    description: "Einmalige Investition in Bildung.",
    build: (age) => [
      base({
        type: "one_time_expense",
        name: "Weiterbildung",
        age,
        amount: 12000,
        recurrence: "once",
        category: "Bildung",
        templateKey: "education",
      }),
    ],
  },
  {
    key: "lumpsum",
    label: "Einmalanlage",
    emoji: "💰",
    description: "Einmaliger Geldzufluss, z. B. Bonus oder Erbe.",
    build: (age) => [
      base({
        type: "one_time_income",
        name: "Einmalanlage",
        age,
        amount: 25000,
        recurrence: "once",
        category: "Vermögen",
        templateKey: "lumpsum",
      }),
    ],
  },
  {
    key: "crash",
    label: "Börsencrash",
    emoji: "📉",
    description: "Einmaliger Depotverlust, z. B. -30 %.",
    build: (age) => [
      base({
        type: "crash",
        name: "Börsencrash (-30 %)",
        age,
        amount: 30,
        recurrence: "once",
        category: "Markt",
        templateKey: "crash",
      }),
    ],
  },
];

/** Leeres Standard-Ereignis für die manuelle Eingabe. */
export function emptyEvent(age: number): LifeEvent {
  return base({
    type: "one_time_expense",
    name: "Neues Ereignis",
    age,
    amount: 0,
    recurrence: "once",
  });
}

export const eventTypeLabels: Record<LifeEvent["type"], string> = {
  one_time_expense: "Einmalige Ausgabe",
  one_time_income: "Einmalige Einnahme",
  recurring_expense: "Wiederkehrende Ausgabe",
  recurring_income: "Wiederkehrende Einnahme",
  savings_rate_change: "Sparrate ändern",
  income_change: "Teilzeit / Einkommen",
  crash: "Crash-Szenario",
};
