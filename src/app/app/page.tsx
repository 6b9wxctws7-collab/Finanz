"use client";

import Link from "next/link";
import { useState } from "react";
import { usePlan } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Dashboard } from "@/components/Dashboard";
import { StartDataForm } from "@/components/StartDataForm";
import { BudgetPlanner } from "@/components/BudgetPlanner";
import { Timeline } from "@/components/Timeline";
import { EventsManager } from "@/components/EventsManager";
import { ScenarioCompare } from "@/components/ScenarioCompare";
import { AdvisorMode } from "@/components/AdvisorMode";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { Button } from "@/components/ui/primitives";
import { LogoMark } from "@/components/ui/Logo";

type TabKey = "dashboard" | "start" | "budget" | "timeline" | "events" | "compare" | "advisor";

const tabs: { key: TabKey; label: string; emoji: string }[] = [
  { key: "dashboard", label: "Dashboard", emoji: "📊" },
  { key: "start", label: "Startdaten", emoji: "⚙️" },
  { key: "budget", label: "Budget", emoji: "🧾" },
  { key: "timeline", label: "Timeline", emoji: "📈" },
  { key: "events", label: "Lebensereignisse", emoji: "🎯" },
  { key: "compare", label: "Vergleich", emoji: "🔀" },
  { key: "advisor", label: "Beratermodus", emoji: "👔" },
];

export default function StudioPage() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const { plan, activeScenario, setActiveScenarioId, addScenario, loadDemo, resetAll, isReady } =
    usePlan();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6">
      {/* Kopfzeile */}
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark size={42} />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-ink-900">MoneyTimeline Studio</h1>
            <p className="text-xs text-ink-500">Finanz-Zukunftsplaner · Simulation, keine Anlageberatung</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={plan.activeScenarioId}
            onChange={(e) => setActiveScenarioId(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            {plan.scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.id === plan.baselineScenarioId ? " (Basis)" : ""}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={() => addScenario()}>
            + Szenario
          </Button>
          <Button variant="ghost" onClick={loadDemo} title="Beispieldaten laden">
            Demo
          </Button>
          <Button variant="ghost" onClick={() => confirm("Alle Daten zurücksetzen?") && resetAll()}>
            Reset
          </Button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-ink-100 bg-white p-1.5 shadow-card">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
              tab === t.key ? "bg-brand-600 text-white shadow-sm" : "text-ink-600 hover:bg-ink-100",
            )}
          >
            <span>{t.emoji}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Inhalt */}
      <main className="animate-fade-in" key={tab + (isReady ? "" : "loading") + activeScenario.id}>
        {tab === "dashboard" && <Dashboard />}
        {tab === "start" && <StartDataForm />}
        {tab === "budget" && <BudgetPlanner />}
        {tab === "timeline" && <Timeline />}
        {tab === "events" && <EventsManager />}
        {tab === "compare" && <ScenarioCompare />}
        {tab === "advisor" && <AdvisorMode />}
      </main>

      {/* Feedback zur Validierung */}
      <div className="mt-8">
        <FeedbackWidget />
      </div>
    </div>
  );
}
