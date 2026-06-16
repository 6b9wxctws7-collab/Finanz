"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePlan } from "@/lib/store";
import { Button } from "@/components/ui/primitives";
import { BetaRequestModal } from "@/components/BetaRequestModal";
import { Disclaimer } from "@/components/Disclaimer";
import { UserRole } from "@/lib/feedback";

export function LandingPage() {
  const router = useRouter();
  const { loadDemo } = usePlan();
  const [betaOpen, setBetaOpen] = useState(false);
  const [betaRole, setBetaRole] = useState<UserRole>("private");

  function startDemo() {
    loadDemo();
    router.push("/app");
  }

  function openBeta(role: UserRole) {
    setBetaRole(role);
    setBetaOpen(true);
  }

  return (
    <div className="min-h-screen">
      {/* Top-Bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-base shadow-card">
            💹
          </div>
          <span className="font-semibold tracking-tight text-ink-900">MoneyTimeline Studio</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => openBeta("private")}>
            Beta anfragen
          </Button>
          <Button variant="primary" onClick={startDemo}>
            Demo starten
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-200/50 to-emerald-100/40 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-10 text-center sm:px-6 sm:pt-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            🇩🇪 🇨🇭 Für Deutschland & die Schweiz · Beta
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl">
            Zeige in 5 Minuten, wie Auto, Wohnung,{" "}
            <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">
              Teilzeit oder Gehaltserhöhung
            </span>{" "}
            deine finanzielle Zukunft verändern.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-ink-500 sm:text-lg">
            Plane Budget, Sparrate und Lebensereignisse – und sieh sofort, was eine Entscheidung
            dein Endvermögen kostet oder bringt. Interaktiv, visuell, ohne Excel.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="primary" onClick={startDemo} className="px-6 py-3 text-base">
              ▶ Demo starten
            </Button>
            <Button variant="secondary" onClick={() => openBeta("private")} className="px-6 py-3 text-base">
              Beta-Zugang anfragen
            </Button>
          </div>
          <p className="mt-3 text-xs text-ink-400">
            Kostenlos testen · Keine Anmeldung nötig · Daten bleiben lokal im Browser
          </p>
        </div>
      </section>

      {/* So funktioniert's */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Step n="1" title="Budget & Startdaten" text="Einkommen, Ausgaben und Annahmen eingeben – die Sparrate wird automatisch berechnet." />
          <Step n="2" title="Ereignisse hinzufügen" text="Auto, Wohnung, Teilzeit, Gehaltserhöhung – per Vorlage in Sekunden." />
          <Step n="3" title="Wirkung sehen" text="Vermögenskurve, Meilensteine und Opportunitätskosten in Echtzeit." />
        </div>
      </section>

      {/* Zielgruppen */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="mb-1 text-center text-2xl font-semibold tracking-tight text-ink-900">
          Für wen ist das?
        </h2>
        <p className="mb-6 text-center text-sm text-ink-500">
          Egal ob für dich selbst oder deine Kund:innen.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <AudienceCard
            emoji="🧑‍💻"
            title="Privatnutzer"
            tagline="Verstehe deine finanzielle Zukunft"
            points={[
              "Sieh, wann du 100.000, 500.000 oder 1 Mio. erreichst",
              "Vergleiche „Auto mit 32“ vs. „erst mit 36“",
              "Nominal und inflationsbereinigt – ehrliche Zahlen",
            ]}
            primaryLabel="Demo starten"
            onPrimary={startDemo}
            secondaryLabel="Beta anfragen"
            onSecondary={() => openBeta("private")}
          />
          <AudienceCard
            emoji="👔"
            title="Finanzberater & Coaches"
            tagline="Beratung, die deine Kunden verstehen"
            highlight
            points={[
              "Kundenfall benennen und als Präsentation zeigen",
              "Szenarien live durchspielen statt statischer PDFs",
              "Export/Import als JSON, Druckansicht für Termine",
            ]}
            primaryLabel="Beratermodus testen"
            onPrimary={startDemo}
            secondaryLabel="Beta für Berater"
            onSecondary={() => openBeta("advisor")}
          />
        </div>
      </section>

      {/* Abschluss-CTA */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-10 text-center text-white shadow-card-lg">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Bereit, deine Entscheidungen zu sehen?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/80">
            Starte mit dem Demo-Szenario oder sichere dir einen frühen Beta-Zugang.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={startDemo}
              className="rounded-xl bg-white px-6 py-3 text-base font-medium text-brand-700 transition-colors hover:bg-brand-50"
            >
              ▶ Demo starten
            </button>
            <button
              onClick={() => openBeta("private")}
              className="rounded-xl border border-white/30 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
            >
              Beta-Zugang anfragen
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
        <Disclaimer />
        <p className="mt-4 text-center text-xs text-ink-400">
          © {new Date().getFullYear()} MoneyTimeline Studio · Simulationstool, keine Anlageberatung
        </p>
      </footer>

      <BetaRequestModal open={betaOpen} onClose={() => setBetaOpen(false)} defaultRole={betaRole} />
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
        {n}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">{text}</p>
    </div>
  );
}

function AudienceCard({
  emoji,
  title,
  tagline,
  points,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  highlight,
}: {
  emoji: string;
  title: string;
  tagline: string;
  points: string[];
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "flex flex-col rounded-2xl border bg-white p-6 shadow-card " +
        (highlight ? "border-brand-300 ring-1 ring-brand-200" : "border-ink-100")
      }
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>
        <div>
          <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
          <p className="text-sm text-ink-500">{tagline}</p>
        </div>
      </div>
      <ul className="mt-4 flex-1 space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
            <span className="mt-0.5 text-emerald-500">✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button variant="primary" className="flex-1" onClick={onPrimary}>
          {primaryLabel}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={onSecondary}>
          {secondaryLabel}
        </Button>
      </div>
    </div>
  );
}
