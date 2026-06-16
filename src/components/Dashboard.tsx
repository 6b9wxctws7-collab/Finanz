"use client";

import { useMemo } from "react";
import { runProjection } from "@/lib/projectionEngine";
import { usePlan } from "@/lib/store";
import { formatAge, formatCurrency } from "@/lib/format";
import { assumptionWarnings, nextEvent } from "@/lib/insights";
import { KpiCard } from "./KpiCard";
import { WealthChart } from "./WealthChart";
import { Card, CardHeader } from "./ui/primitives";
import { Disclaimer } from "./Disclaimer";

export function Dashboard() {
  const { activeScenario } = usePlan();
  const result = useMemo(() => runProjection(activeScenario), [activeScenario]);
  const cur = activeScenario.start.currency;
  const next = nextEvent(activeScenario);
  const warnings = assumptionWarnings(activeScenario, result);

  const returnShare =
    result.finalWealth > 0 ? result.totalReturns / result.finalWealth : 0;

  return (
    <div className="space-y-5">
      {/* Kennzahlenkarten */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        <KpiCard label="Aktuelles Alter" value={`${activeScenario.start.currentAge} J.`} emoji="🎂" />
        <KpiCard
          label="Aktuelles Vermögen"
          value={formatCurrency(activeScenario.start.startWealth, cur)}
          emoji="🏦"
        />
        <KpiCard
          label="Monatliche Sparrate"
          value={formatCurrency(result.initialMonthlySavings, cur)}
          sub={result.initialMonthlySavings < 0 ? "⚠️ negativ" : "investiert pro Monat"}
          emoji="💸"
          tone={result.initialMonthlySavings < 0 ? "amber" : "default"}
        />
        <KpiCard
          label={`Endvermögen mit ${activeScenario.start.targetAge}`}
          value={formatCurrency(result.finalWealth, cur)}
          sub="nominal"
          tone="brand"
          emoji="🎯"
        />
        <KpiCard
          label="Inflationsbereinigt"
          value={formatCurrency(result.finalRealWealth, cur)}
          sub="heutige Kaufkraft"
          tone="green"
          hint="Endvermögen abgezinst mit der angenommenen Inflation – was es in heutigem Geld wert wäre."
          emoji="🛒"
        />
        <KpiCard
          label="100.000 erreicht mit"
          value={formatAge(result.ageAt100k)}
          emoji="💯"
        />
        <KpiCard label="500.000 erreicht mit" value={formatAge(result.ageAt500k)} emoji="🚀" />
        <KpiCard label="1 Mio. erreicht mit" value={formatAge(result.ageAt1m)} emoji="🏆" />
      </div>

      {/* Nächstes Ereignis + Warnungen */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Nächstes Lebensereignis" />
          <div className="px-5 py-4">
            {next ? (
              <div>
                <div className="text-lg font-semibold text-ink-900">{next.name}</div>
                <div className="mt-1 text-sm text-ink-500">mit {next.age} Jahren</div>
              </div>
            ) : (
              <div className="text-sm text-ink-400">Keine Ereignisse geplant.</div>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Insights" subtitle="Automatisch aus deiner Planung abgeleitet" />
          <div className="space-y-2 px-5 py-4 text-sm text-ink-700">
            <Insight>
              Du erreichst 1&nbsp;Mio. voraussichtlich{" "}
              <strong>{result.ageAt1m ? `mit ${Math.round(result.ageAt1m)}` : "nicht bis zum Zielalter"}</strong>.
            </Insight>
            <Insight>
              Deine aktuelle Sparrate ergibt bis {activeScenario.start.targetAge} voraussichtlich{" "}
              <strong>{formatCurrency(result.finalWealth, cur)}</strong>.
            </Insight>
            <Insight>
              Inflationsbereinigt entspricht das{" "}
              <strong>{formatCurrency(result.finalRealWealth, cur)}</strong> heutiger Kaufkraft.
            </Insight>
            <Insight>
              Davon sind <strong>{formatCurrency(result.totalReturns, cur)}</strong> reine Rendite
              (ca. {Math.round(returnShare * 100)} % des Endvermögens).
            </Insight>
          </div>
        </Card>
      </div>

      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800"
            >
              <span>⚠️</span>
              <span>{w.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Vermögenskurve */}
      <Card>
        <CardHeader
          title="Vermögensentwicklung"
          subtitle="Nominal, inflationsbereinigt und eingezahltes Kapital"
          action={
            <div className="hidden items-center gap-3 text-xs text-ink-500 sm:flex">
              <Legend color="#3479f6" label="nominal" />
              <Legend color="#10b981" label="real" />
              <Legend color="#94a3b8" label="eingezahlt" />
            </div>
          }
        />
        <div className="px-2 py-4 sm:px-4">
          <WealthChart result={result} currency={cur} />
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-ink-100 bg-ink-100 sm:grid-cols-2">
          <SplitStat
            label="Eingezahltes Kapital"
            value={formatCurrency(result.totalContributions, cur)}
          />
          <SplitStat label="Erwirtschaftete Rendite" value={formatCurrency(result.totalReturns, cur)} />
        </div>
      </Card>

      <Disclaimer />
    </div>
  );
}

function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-brand-500">›</span>
      <span>{children}</span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function SplitStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-5 py-3">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="mt-0.5 text-base font-semibold text-ink-900">{value}</div>
    </div>
  );
}
