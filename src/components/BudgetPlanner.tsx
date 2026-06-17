"use client";

import { useMemo } from "react";
import { sumGroup, totalBudgetExpenses } from "@/lib/budget";
import { runProjection } from "@/lib/projectionEngine";
import { usePlan } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { Budget, BudgetGroup, SavingsMode } from "@/lib/types";
import { Card, CardHeader, Field, Segmented } from "./ui/primitives";
import { NumberInput } from "./ui/NumberInput";
import { KpiCard } from "./KpiCard";
import { AlertTriangle, BadgeCheck, Briefcase, Calculator, Receipt } from "lucide-react";

export function BudgetPlanner() {
  const { activeScenario, updateActiveScenario } = usePlan();
  const cur = activeScenario.start.currency;
  const budget = activeScenario.budget;

  const expenses = totalBudgetExpenses(budget);
  const budgetRate = activeScenario.start.netIncome - expenses;
  const result = useMemo(() => runProjection(activeScenario), [activeScenario]);
  const effectiveRate = result.initialMonthlySavings;

  function updateItem(groupKey: keyof Budget, itemId: string, amount: number) {
    updateActiveScenario((sc) => ({
      ...sc,
      budget: {
        ...sc.budget,
        [groupKey]: {
          ...sc.budget[groupKey],
          items: sc.budget[groupKey].items.map((it) =>
            it.id === itemId ? { ...it, amount } : it,
          ),
        },
      },
    }));
  }

  return (
    <div className="space-y-5">
      {/* Steuerung + Ergebnis */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Sparrate" subtitle="Woraus wird investiert?" />
          <div className="space-y-4 px-5 py-4">
            <Segmented<SavingsMode>
              value={activeScenario.savingsMode}
              onChange={(v) => updateActiveScenario((sc) => ({ ...sc, savingsMode: v }))}
              options={[
                { value: "budget", label: "Budgetbasiert" },
                { value: "fixed", label: "Feste Sparrate" },
              ]}
            />
            {activeScenario.savingsMode === "fixed" ? (
              <Field label="Feste monatliche Sparrate">
                <NumberInput
                  value={activeScenario.fixedSavings}
                  onChange={(v) => updateActiveScenario((sc) => ({ ...sc, fixedSavings: v }))}
                  min={0}
                  suffix={cur}
                />
              </Field>
            ) : (
              <p className="text-xs leading-relaxed text-ink-500">
                Die Sparrate ergibt sich automatisch aus Nettoeinkommen minus deinen
                Ausgaben unten. Sie wird direkt in die Vermögenssimulation übernommen.
              </p>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 lg:col-span-2">
          <KpiCard label="Nettoeinkommen" value={formatCurrency(activeScenario.start.netIncome, cur)} icon={Briefcase} />
          <KpiCard label="Summe Ausgaben" value={formatCurrency(expenses, cur)} icon={Receipt} />
          <KpiCard
            label="Budgetbasierte Sparrate"
            value={formatCurrency(budgetRate, cur)}
            tone={budgetRate < 0 ? "amber" : "default"}
            sub={
              budgetRate < 0 ? (
                <span className="inline-flex items-center gap-1 text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" /> Ausgaben &gt; Einkommen
                </span>
              ) : undefined
            }
            icon={Calculator}
          />
          <KpiCard
            label="In Simulation aktiv"
            value={formatCurrency(effectiveRate, cur)}
            tone="brand"
            sub={activeScenario.savingsMode === "fixed" ? "feste Sparrate" : "budgetbasiert"}
            icon={BadgeCheck}
          />
        </div>
      </div>

      {budgetRate < 0 && activeScenario.savingsMode === "budget" && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Deine Ausgaben übersteigen dein Einkommen. Die Sparrate ist negativ – dein
            Vermögen würde langfristig schrumpfen.
          </span>
        </div>
      )}

      {/* Kategorien */}
      <div className="grid gap-3 lg:grid-cols-3">
        <BudgetColumn group={budget.fixed} currency={cur} onChange={(id, v) => updateItem("fixed", id, v)} />
        <BudgetColumn group={budget.variable} currency={cur} onChange={(id, v) => updateItem("variable", id, v)} />
        <BudgetColumn group={budget.reserves} currency={cur} onChange={(id, v) => updateItem("reserves", id, v)} />
      </div>
    </div>
  );
}

function BudgetColumn({
  group,
  currency,
  onChange,
}: {
  group: BudgetGroup;
  currency: import("@/lib/types").Currency;
  onChange: (itemId: string, amount: number) => void;
}) {
  return (
    <Card>
      <CardHeader title={group.title} subtitle={formatCurrency(sumGroup(group), currency) + " / Monat"} />
      <div className="space-y-2.5 px-5 py-4">
        {group.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <span className="flex-1 text-sm text-ink-600">{item.label}</span>
            <div className="w-32">
              <NumberInput value={item.amount} onChange={(v) => onChange(item.id, v)} min={0} suffix={currency} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
