"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import { EtfGame } from "@/components/EtfGame";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { Button } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/Logo";
import {
  CalendarClock,
  ChevronsUpDown,
  Gamepad2,
  GitCompare,
  LayoutDashboard,
  LineChart,
  LucideIcon,
  Plus,
  Presentation,
  RotateCcw,
  Settings,
  Sparkles,
  Wallet,
} from "lucide-react";

type TabKey = "dashboard" | "start" | "budget" | "timeline" | "events" | "compare" | "advisor" | "game";

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
  { key: "game", label: "ETF Catcher", icon: Gamepad2, activeBg: "bg-fuchsia-600", iconColor: "text-fuchsia-600", hover: "hover:bg-fuchsia-50" },
];

export default function StudioPage() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const { plan, activeScenario, setActiveScenarioId, addScenario, loadDemo, resetAll, isReady } =
    usePlan();

  // Scroll-Hinweis: nur zeigen, wenn die Tab-Leiste überläuft und noch nicht
  // gescrollt wurde – dann „zuckt“ sie ab und an nach links.
  const navRef = useRef<HTMLElement>(null);
  const [hintScroll, setHintScroll] = useState(false);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const check = () => setHintScroll(el.scrollWidth > el.clientWidth + 4);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {/* Szenario-Auswahl mit eigenem Chevron */}
          <div className="relative w-full sm:w-56">
            <select
              value={plan.activeScenarioId}
              onChange={(e) => setActiveScenarioId(e.target.value)}
              aria-label="Szenario auswählen"
              className="w-full appearance-none rounded-xl border border-ink-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-ink-800 outline-none transition-colors hover:border-ink-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {plan.scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.id === plan.baselineScenarioId ? " (Basis)" : ""}
                </option>
              ))}
            </select>
            <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          </div>

          {/* Aktionen: mobil drei gleich breite Spalten, ab sm inline */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
            <Button variant="secondary" onClick={() => addScenario()}>
              <Plus className="h-4 w-4" /> Szenario
            </Button>
            <Button variant="secondary" onClick={loadDemo} title="Beispieldaten laden">
              <Sparkles className="h-4 w-4" /> Demo
            </Button>
            <Button
              variant="secondary"
              onClick={() => confirm("Alle Daten zurücksetzen?") && resetAll()}
              className="text-ink-500 hover:text-red-600"
              title="Alles zurücksetzen"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation – zentrale, farblich kodierte Bereiche */}
      <nav
        ref={navRef}
        onScroll={() => hintScroll && setHintScroll(false)}
        className="mb-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white p-2 shadow-card-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className={cn("flex gap-1.5", hintScroll && "animate-scroll-hint")}>
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
        </div>
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
        {tab === "game" && <EtfGame />}
      </main>

      {/* Feedback zur Validierung */}
      <div className="mt-8">
        <FeedbackWidget />
      </div>
    </div>
  );
}
