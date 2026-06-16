import { ProjectionResult, Scenario } from "./types";

/** Nächstes anstehendes Lebensereignis relativ zum aktuellen Alter. */
export function nextEvent(scenario: Scenario): { name: string; age: number } | null {
  const upcoming = scenario.events
    .filter((e) => e.enabled && e.age >= scenario.start.currentAge)
    .sort((a, b) => a.age - b.age);
  if (!upcoming.length) return null;
  return { name: upcoming[0].name, age: upcoming[0].age };
}

export interface AssumptionWarning {
  level: "warn" | "info";
  text: string;
}

/** Hinweise bei unrealistischen Annahmen oder negativer Sparrate. */
export function assumptionWarnings(scenario: Scenario, result: ProjectionResult): AssumptionWarning[] {
  const w: AssumptionWarning[] = [];
  if (scenario.start.annualReturn > 0.1) {
    w.push({
      level: "warn",
      text: "Eine Rendite über 10 % ist langfristig sehr optimistisch und keinesfalls garantiert.",
    });
  }
  if (scenario.start.annualInflation > 0.05) {
    w.push({ level: "warn", text: "Eine Inflation über 5 % ist historisch ungewöhnlich hoch." });
  }
  if (result.hasNegativeSavings) {
    w.push({
      level: "warn",
      text: "Deine Sparrate ist zeitweise negativ – die Ausgaben übersteigen das Einkommen.",
    });
  }
  if (result.initialMonthlySavings < 0) {
    w.push({
      level: "warn",
      text: "Schon zu Beginn ist die Sparrate negativ. Prüfe dein Budget.",
    });
  }
  return w;
}
