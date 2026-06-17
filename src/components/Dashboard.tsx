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
import {
  AlertTriangle,
  Cake,
  Flag,
  Landmark,
  PiggyBank,
  ShoppingCart,
  Target,
  Trophy,
} from "lucide-react";

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
        <KpiCard label="Aktuelles Alter" value={`${activeScenario.start.currentAge} J.`} icon={Cake} />
        <KpiCard
          label="Aktuelles Vermögen"
          value={formatCurrency(activeScenario.start.startWealth, cur)}
          icon={Landmark}
        />
        <KpiCard
          label="Monatliche Sparrate"
          value={formatCurrency(result.initialMonthlySavings, cur)}
          sub={
            result.initialMonthlySavings < 0 ? (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" /> negativ
              </span>
            ) : (
              "investiert pro Monat"
            )
          }
          icon={PiggyBank}
          tone={result.initialMonthlySavings < 0 ? "amber" : "default"}
        />
        {/* Endvermögen: nominal groß, inflationsbereinigte Kaufkraft direkt darunter */}
        <div className="rounded-2xl border border-brand-700 bg-gradient-to-br from-brand-600 to-brand-700 p-4 text-white shadow-card">
          <div className="flex items-center gap-1.5">
            <Target className="h-4 w-4 text-white/90" strokeWidth={2.25} />
            <span className="text-xs font-medium text-white/80">
              Endvermögen mit {activeScenario.start.targetAge}
            </span>
          </div>
          <div className="mt-1.5 text-2xl font-semibold tracking-tight">
            {formatCurrency(result.finalWealth, cur)}
          </div>
          <div className="text-xs text-white/70">nominal</div>

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 ring-1 ring-inset ring-white/15">
            <ShoppingCart className="h-4 w-4 shrink-0 text-white/90" strokeWidth={2} />
            <div className="min-w-0">
              <div className="text-base font-semibold leading-tight">
                {formatCurrency(result.finalRealWealth, cur)}
              </div>
              <div className="text-[11px] leading-tight text-white/75">heutige Kaufkraft</div>
            </div>
          </div>
        </div>

        <KpiCard label="100.000 erreicht mit" value={formatAge(result.ageAt100k)} icon={Flag} />
        <KpiCard label="1 Mio. erreicht mit" value={formatAge(result.ageAt1m)} icon={Trophy} />
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
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
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
