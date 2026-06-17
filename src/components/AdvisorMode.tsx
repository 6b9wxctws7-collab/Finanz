"use client";

import { useMemo, useRef } from "react";
import { runProjection } from "@/lib/projectionEngine";
import { usePlan } from "@/lib/store";
import { formatAge, formatCurrency } from "@/lib/format";
import { Plan } from "@/lib/types";
import { Button, Card, CardHeader, Field, TextInput } from "./ui/primitives";
import { WealthChart } from "./WealthChart";
import { Disclaimer } from "./Disclaimer";
import { Download, Printer, Upload } from "lucide-react";

export function AdvisorMode() {
  const { plan, activeScenario, setAdvisor, importPlan } = usePlan();
  const fileRef = useRef<HTMLInputElement>(null);
  const result = useMemo(() => runProjection(activeScenario), [activeScenario]);
  const cur = activeScenario.start.currency;

  function exportJson() {
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan.advisor.caseName || "etfmaxxing"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Plan;
        if (parsed?.scenarios?.length) importPlan(parsed);
        else alert("Ungültige Datei: keine Szenarien gefunden.");
      } catch {
        alert("Datei konnte nicht gelesen werden.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-5">
      {/* Steuerung (wird im Druck ausgeblendet) */}
      <div className="print:hidden">
        <Card>
          <CardHeader title="Beratermodus" subtitle="Kundenfall benennen, exportieren und präsentieren" />
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
            <Field label="Kundenname (optional)">
              <TextInput
                value={plan.advisor.clientName}
                placeholder="z. B. Familie Muster"
                onChange={(e) => setAdvisor((a) => ({ ...a, clientName: e.target.value }))}
              />
            </Field>
            <Field label="Bezeichnung des Kundenfalls">
              <TextInput
                value={plan.advisor.caseName}
                placeholder="z. B. Altersvorsorge 2026"
                onChange={(e) => setAdvisor((a) => ({ ...a, caseName: e.target.value }))}
              />
            </Field>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-ink-100 px-5 py-4">
            <Button variant="primary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Druckansicht / PDF
            </Button>
            <Button variant="secondary" onClick={exportJson}>
              <Download className="h-4 w-4" /> Export als JSON
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Import aus JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJson(f);
                e.target.value = "";
              }}
            />
            <span className="ml-auto self-center text-[11px] text-ink-400">
              PDF-Export erfolgt über den Druckdialog des Browsers.
            </span>
          </div>
        </Card>
      </div>

      {/* Präsentationsansicht */}
      <Card className="print:border-0 print:shadow-none">
        <div className="border-b border-ink-100 px-6 py-5">
          <div className="text-xs uppercase tracking-wide text-brand-600">Finanzplan-Simulation</div>
          <h2 className="mt-1 text-2xl font-semibold text-ink-900">
            {plan.advisor.caseName || "Kundenfall"}
          </h2>
          {plan.advisor.clientName && (
            <p className="mt-0.5 text-sm text-ink-500">für {plan.advisor.clientName}</p>
          )}
          <p className="mt-1 text-xs text-ink-400">
            Szenario: {activeScenario.name} · Stand {new Date().toLocaleDateString("de-DE")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px bg-ink-100 lg:grid-cols-4">
          <BigStat label={`Endvermögen mit ${activeScenario.start.targetAge}`} value={formatCurrency(result.finalWealth, cur)} />
          <BigStat label="Kaufkraft heute" value={formatCurrency(result.finalRealWealth, cur)} />
          <BigStat label="Monatliche Sparrate" value={formatCurrency(result.initialMonthlySavings, cur)} />
          <BigStat label="1 Mio. erreicht mit" value={formatAge(result.ageAt1m)} />
        </div>

        <div className="px-4 py-5">
          <WealthChart result={result} currency={cur} height={300} />
        </div>

        <div className="px-6 pb-6">
          <Disclaimer />
        </div>
      </Card>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-6 py-5">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="mt-1 text-xl font-semibold tracking-tight text-ink-900 lg:text-2xl">{value}</div>
    </div>
  );
}
