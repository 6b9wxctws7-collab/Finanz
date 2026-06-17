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
import { Onboarding } from "@/components/onboarding/Onboarding";
import { Button } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/Logo";
import {
  CalendarClock,
  GitCompare,
  LayoutDashboard,
  LineChart,
  LucideIcon,
  Presentation,
  Settings,
  Wallet,
} from "lucide-react";

type TabKey = "dashboard" | "start" | "budget" | "timeline" | "events" | "compare" | "advisor";

interface Tab {
  key: TabKey;
  label: string;
  icon: LucideIcon;
  /** Vollständige Tailwind-Klassen (statisch, damit sie nicht weggepurged werden). */
  activeBg: string;
  iconColor: string;
  hover: string;
}

const tabs: Tab[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, activeBg: "bg-blue-600", iconColor: "text-blue-600", hover: "hover:bg-blue-50" },
  { key: "start", label: "Startdaten", icon: Settings, activeBg: "bg-violet-600", iconColor: "text-violet-600", hover: "hover:bg-violet-50" },
  { key: "budget", label: "Budget", icon: Wallet, activeBg: "bg-emerald-600", iconColor: "text-emerald-600", hover: "hover:bg-emerald-50" },
  { key: "timeline", label: "Timeline", icon: LineChart, activeBg: "bg-sky-600", iconColor: "text-sky-600", hover: "hover:bg-sky-50" },
  { key: "events", label: "Lebensereignisse", icon: CalendarClock, activeBg: "bg-amber-500", iconColor: "text-amber-600", hover: "hover:bg-amber-50" },
  { key: "compare", label: "Vergleich", icon: GitCompare, activeBg: "bg-purple-600", iconColor: "text-purple-600", hover: "hover:bg-purple-50" },
  { key: "advisor", label: "Beratermodus", icon: Presentation, activeBg: "bg-rose-600", iconColor: "text-rose-600", hover: "hover:bg-rose-50" },
];

export default function StudioPage() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const { plan, activeScenario, setActiveScenarioId, addScenario, loadDemo, resetAll, isReady } =
    usePlan();

  // Beim ersten Öffnen (noch kein Onboarding durchlaufen) den Assistenten zeigen.
  const showOnboarding = isReady && !plan.onboarded;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6">
      {showOnboarding && <Onboarding />}

      {/* Kopfzeile */}
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={40} />
          <span className="hidden text-xs text-ink-400 sm:inline">· Simulation, keine Anlageberatung</span>
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

      {/* Navigation – zentrale, farblich kodierte Bereiche */}
      <nav className="mb-6 flex gap-1.5 overflow-x-auto rounded-2xl border border-ink-100 bg-white p-2 shadow-card-lg">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                active ? cn(t.activeBg, "text-white shadow-sm") : cn("text-ink-700", t.hover),
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "text-white" : t.iconColor)} strokeWidth={2.25} />
              <span>{t.label}</span>
            </button>
          );
        })}
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
