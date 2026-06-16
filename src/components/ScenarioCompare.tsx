"use client";

import { useMemo } from "react";
import { runProjection } from "@/lib/projectionEngine";
import { usePlan } from "@/lib/store";
import { formatAge, formatCurrency } from "@/lib/format";
import { Currency } from "@/lib/types";
import { Button, Card, CardHeader, Badge } from "./ui/primitives";

export function ScenarioCompare() {
  const { plan, duplicateScenario, deleteScenario, setBaseline, setActiveScenarioId } = usePlan();

  const rows = useMemo(
    () =>
      plan.scenarios.map((s) => ({ scenario: s, result: runProjection(s) })),
    [plan.scenarios],
  );

  const baseline = rows.find((r) => r.scenario.id === plan.baselineScenarioId) ?? rows[0];
  // Währung des Basisszenarios als Referenz für die Vergleichsanzeige.
  const cur = baseline.scenario.start.currency;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Szenarien vergleichen"
          subtitle="Dupliziere ein Szenario, ändere eine Annahme und sieh die Differenz."
          action={
            <Button variant="secondary" onClick={() => duplicateScenario(plan.activeScenarioId)}>
              + Aktives duplizieren
            </Button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs text-ink-500">
                <th className="px-4 py-2.5 font-medium">Szenario</th>
                <th className="px-4 py-2.5 text-right font-medium">Endvermögen</th>
                <th className="px-4 py-2.5 text-right font-medium">Real (heute)</th>
                <th className="px-4 py-2.5 text-right font-medium">100k</th>
                <th className="px-4 py-2.5 text-right font-medium">500k</th>
                <th className="px-4 py-2.5 text-right font-medium">1 Mio.</th>
                <th className="px-4 py-2.5 text-right font-medium">Δ zu Basis</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ scenario, result }) => {
                const diff = result.finalWealth - baseline.result.finalWealth;
                const isBase = scenario.id === plan.baselineScenarioId;
                const isActive = scenario.id === plan.activeScenarioId;
                return (
                  <tr key={scenario.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setActiveScenarioId(scenario.id)}
                        className="flex items-center gap-2 text-left"
                      >
                        <span className={"font-medium " + (isActive ? "text-brand-700" : "text-ink-900")}>
                          {scenario.name}
                        </span>
                        {isBase && <Badge tone="blue">Basis</Badge>}
                        {isActive && !isBase && <Badge tone="neutral">aktiv</Badge>}
                      </button>
                      <div className="mt-0.5 text-[11px] text-ink-400">
                        Alter {scenario.start.currentAge}–{scenario.start.targetAge} · {scenario.events.filter((e) => e.enabled).length} Ereignisse
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink-900">
                      {formatCurrency(result.finalWealth, scenario.start.currency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-500">
                      {formatCurrency(result.finalRealWealth, scenario.start.currency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-600">{formatAge(result.ageAt100k)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-600">{formatAge(result.ageAt500k)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-600">{formatAge(result.ageAt1m)}</td>
                    <td className={"px-4 py-3 text-right font-medium tabular-nums " + diffTone(diff, isBase)}>
                      {isBase ? "—" : `${diff >= 0 ? "+" : ""}${formatCurrency(diff, cur)}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => duplicateScenario(scenario.id)}>
                          Kopie
                        </Button>
                        {!isBase && (
                          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setBaseline(scenario.id)}>
                            als Basis
                          </Button>
                        )}
                        {plan.scenarios.length > 1 && (
                          <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => deleteScenario(scenario.id)}>
                            ✕
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Opportunitätskosten-Hervorhebung */}
      <div className="grid gap-3 md:grid-cols-2">
        {rows
          .filter((r) => r.scenario.id !== plan.baselineScenarioId)
          .map(({ scenario, result }) => (
            <OpportunityCard
              key={scenario.id}
              name={scenario.name}
              baselineName={baseline.scenario.name}
              diff={result.finalWealth - baseline.result.finalWealth}
              targetAge={scenario.start.targetAge}
              currency={cur}
            />
          ))}
      </div>
    </div>
  );
}

function diffTone(diff: number, isBase: boolean): string {
  if (isBase) return "text-ink-400";
  return diff < 0 ? "text-red-600" : "text-emerald-600";
}

function OpportunityCard({
  name,
  baselineName,
  diff,
  targetAge,
  currency,
}: {
  name: string;
  baselineName: string;
  diff: number;
  targetAge: number;
  currency: Currency;
}) {
  const negative = diff < 0;
  return (
    <Card className={negative ? "border-red-200" : "border-emerald-200"}>
      <div className="p-4">
        <div className="text-xs text-ink-500">
          „{name}" vs. „{baselineName}"
        </div>
        <div className={"mt-1 text-xl font-semibold " + (negative ? "text-red-600" : "text-emerald-600")}>
          {diff >= 0 ? "+" : ""}
          {formatCurrency(diff, currency)}
        </div>
        <p className="mt-1 text-sm text-ink-600">
          {negative
            ? `Dieses Szenario kostet dich langfristig ca. ${formatCurrency(Math.abs(diff), currency)} Endvermögen bis ${targetAge}.`
            : `Dieses Szenario bringt dir bis ${targetAge} ca. ${formatCurrency(diff, currency)} mehr Endvermögen.`}
        </p>
      </div>
    </Card>
  );
}
