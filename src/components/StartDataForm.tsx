"use client";

import { usePlan } from "@/lib/store";
import { Country, Currency } from "@/lib/types";
import { Card, CardHeader, Field, Select } from "./ui/primitives";
import { NumberInput } from "./ui/NumberInput";
import { Disclaimer } from "./Disclaimer";
import { AlertTriangle } from "lucide-react";

export function StartDataForm() {
  const { activeScenario, updateActiveScenario } = usePlan();
  const s = activeScenario.start;

  function patch<K extends keyof typeof s>(key: K, value: (typeof s)[K]) {
    updateActiveScenario((sc) => ({ ...sc, start: { ...sc.start, [key]: value } }));
  }

  const highReturn = s.annualReturn > 0.1;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Startdaten" subtitle="Grundlage deiner Vermögenssimulation" />
        <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Land">
            <Select
              value={s.country}
              onChange={(e) => {
                const country = e.target.value as Country;
                // Währung sinnvoll mit dem Land koppeln.
                patch("country", country);
                patch("currency", country === "CH" ? "CHF" : "EUR");
              }}
            >
              <option value="DE">Deutschland</option>
              <option value="CH">Schweiz</option>
            </Select>
          </Field>

          <Field label="Währung">
            <Select value={s.currency} onChange={(e) => patch("currency", e.target.value as Currency)}>
              <option value="EUR">EUR (€)</option>
              <option value="CHF">CHF</option>
            </Select>
          </Field>

          <Field label="Anfangs-Nettoeinkommen / Monat">
            <NumberInput value={s.netIncome} onChange={(v) => patch("netIncome", v)} min={0} suffix={s.currency} />
          </Field>

          <Field label="Aktuelles Alter">
            <NumberInput value={s.currentAge} onChange={(v) => patch("currentAge", v)} min={0} max={100} suffix="J." />
          </Field>

          <Field label="Zielalter" hint="Bis zu diesem Alter wird simuliert. Standard ist 65.">
            <NumberInput value={s.targetAge} onChange={(v) => patch("targetAge", v)} min={s.currentAge + 1} max={110} suffix="J." />
          </Field>

          <Field label="Aktuelles Startvermögen">
            <NumberInput value={s.startWealth} onChange={(v) => patch("startWealth", v)} min={0} suffix={s.currency} />
          </Field>

          <Field
            label="Erwartete Rendite p.a."
            hint="Annahme, keine Garantie. 8 % ist ein optimistischer langfristiger Aktienmarktwert."
          >
            <NumberInput
              value={Math.round(s.annualReturn * 1000) / 10}
              onChange={(v) => patch("annualReturn", v / 100)}
              min={0}
              max={30}
              step={0.1}
              suffix="%"
            />
          </Field>

          <Field label="Inflation p.a." hint="Reduziert die reale Kaufkraft deines Vermögens.">
            <NumberInput
              value={Math.round(s.annualInflation * 1000) / 10}
              onChange={(v) => patch("annualInflation", v / 100)}
              min={0}
              max={20}
              step={0.1}
              suffix="%"
            />
          </Field>

          <Field label="Jährliche Gehaltssteigerung" hint="Optional. Erhöht das Einkommen jedes Jahr.">
            <NumberInput
              value={Math.round(s.annualSalaryGrowth * 1000) / 10}
              onChange={(v) => patch("annualSalaryGrowth", v / 100)}
              min={0}
              max={20}
              step={0.1}
              suffix="%"
            />
          </Field>
        </div>
      </Card>

      {highReturn && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Eine Rendite über 10 % p.a. ist langfristig sehr optimistisch und keinesfalls garantiert.
          </span>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
