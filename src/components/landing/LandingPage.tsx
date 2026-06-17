"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePlan } from "@/lib/store";
import { Button } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/Logo";
import { BetaRequestModal } from "@/components/BetaRequestModal";
import { Briefcase, Check, Rocket, UserRound } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { UserRole } from "@/lib/feedback";

export function LandingPage() {
  const router = useRouter();
  const { loadDemo } = usePlan();
  const [betaOpen, setBetaOpen] = useState(false);
  const [betaRole, setBetaRole] = useState<UserRole>("private");

  // Eigene Planung: ohne Demo-Daten in die App -> Onboarding-Assistent startet.
  function startOnboarding() {
    router.push("/app");
  }

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
        <Logo size={36} />
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => openBeta("private")}>
            Beta sichern
          </Button>
          <Button variant="primary" onClick={startOnboarding}>
            Jetzt maxxen
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="animate-float pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-200/50 to-emerald-100/40 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-10 text-center sm:px-6 sm:pt-16">
          <span className="animate-fade-in-up inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <Rocket className="h-3.5 w-3.5" /> Zinseszins-pilled · DE &amp; CH · Beta
          </span>
          <RotatingHeadline />
          <p
            className="animate-fade-in-up mx-auto mt-5 max-w-2xl text-base text-ink-500 sm:text-lg"
            style={{ animationDelay: "0.16s" }}
          >
            Sieh in 5 Minuten, wie Auto, Wohnung, Teilzeit oder Gehaltserhöhung dein Vermögen
            entweder <span className="font-semibold text-emerald-600">to the moon</span> schicken
            oder gnadenlos grillen. Kein Excel, kein Copium – nur deine Zukunft in Zahlen.
          </p>
          <div
            className="animate-fade-in-up mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "0.24s" }}
          >
            <Button variant="primary" onClick={startOnboarding} className="group px-6 py-3 text-base">
              <Rocket className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-12" />{" "}
              Jetzt ETF-maxxen
            </Button>
            <Button variant="secondary" onClick={() => openBeta("private")} className="px-6 py-3 text-base">
              Beta-Zugang sichern
            </Button>
          </div>
          <p
            className="animate-fade-in-up mt-3 text-xs text-ink-400"
            style={{ animationDelay: "0.32s" }}
          >
            In 2 Min. startklar · keine Anmeldung · Daten bleiben lokal ·{" "}
            <button onClick={startDemo} className="font-medium text-brand-600 underline-offset-2 hover:underline">
              oder einfach Demo gönnen
            </button>
          </p>
        </div>
      </section>

      {/* So funktioniert's */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="stagger-children grid gap-3 sm:grid-cols-3">
          <Step n="1" title="Budget flexen" text="Einkommen eintragen, Ausgaben beichten – deine Sparrate rechnet sich von selbst." />
          <Step n="2" title="Life happens" text="Auto, Wohnung, Kind, Sabbatical: wirf rein, was das Leben so droppt." />
          <Step n="3" title="Zukunft entlocken" text="Vermögenskurve, Meilensteine und der brutale Realitätscheck nach Inflation." />
        </div>
      </section>

      {/* Zielgruppen */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="mb-1 text-center text-2xl font-semibold tracking-tight text-ink-900">
          Für wen ist dieser Vibe?
        </h2>
        <p className="mb-6 text-center text-sm text-ink-500">
          Ob Solo-Maxxer oder Berater mit Klientel – passt.
        </p>
        <div className="stagger-children grid gap-4 md:grid-cols-2">
          <AudienceCard
            icon={UserRound}
            title="Für dich"
            tagline="Glow-up fürs Depot"
            points={[
              "Sieh, wann du 100k, 500k & die erste Mio. knackst",
              "Vergleiche „Auto mit 32“ vs. „erst mit 36“ (spoiler: tut weh)",
              "Nominal vs. nach Inflation – Zahlen ohne Copium",
            ]}
            primaryLabel="Jetzt ETF-maxxen"
            onPrimary={startOnboarding}
            secondaryLabel="Beta sichern"
            onSecondary={() => openBeta("private")}
          />
          <AudienceCard
            icon={Briefcase}
            title="Für Berater & Coaches"
            tagline="Zahlen, die deine Kund:innen feiern"
            highlight
            points={[
              "Kundenfall benennen & als Präsentation flexen",
              "Szenarien live durchspielen statt PDF-Friedhof",
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
            Bereit, finanziell aufzusteigen?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/80">
            Leg in 2 Minuten los – future you sagt jetzt schon danke.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={startOnboarding}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-medium text-brand-700 transition-transform hover:-translate-y-0.5 hover:bg-brand-50"
            >
              <Rocket className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-12" />{" "}
              Jetzt ETF-maxxen
            </button>
            <button
              onClick={() => openBeta("private")}
              className="rounded-xl border border-white/30 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
            >
              Beta-Zugang sichern
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
        <Disclaimer />
        <p className="mt-4 text-center text-xs text-ink-400">
          © {new Date().getFullYear()} ETFMaxxing · Simulationstool, keine Anlageberatung
        </p>
      </footer>

      <BetaRequestModal open={betaOpen} onClose={() => setBetaOpen(false)} defaultRole={betaRole} />
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-transform duration-300 hover:-translate-y-1 hover:shadow-card-lg">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
        {n}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">{text}</p>
    </div>
  );
}

const HEADLINES: { lead: string; accent: string }[] = [
  { lead: "Hör auf zu broke sein.", accent: "Fang an zu ETF-maxxen." },
  { lead: "Zinseszins ist", accent: "literally ein Cheatcode." },
  { lead: "Spar heute,", accent: "flex morgen." },
  { lead: "Dein Geld arbeitet,", accent: "während du chillst." },
  { lead: "Future you", accent: "sagt schon mal danke." },
];

/** Hero-Headline, die alle paar Sekunden den Spruch wechselt. */
function RotatingHeadline() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % HEADLINES.length), 4500);
    return () => clearInterval(id);
  }, []);
  const { lead, accent } = HEADLINES[i];
  return (
    <h1 className="mt-5 flex min-h-[7.5rem] items-center justify-center text-4xl font-bold leading-[1.1] tracking-tight text-ink-900 sm:min-h-[8rem] sm:text-5xl">
      <span key={i} className="animate-fade-in-up block">
        {lead}{" "}
        <span className="animate-gradient bg-gradient-to-r from-brand-600 via-emerald-500 to-brand-600 bg-clip-text text-transparent">
          {accent}
        </span>
      </span>
    </h1>
  );
}

function AudienceCard({
  icon: Icon,
  title,
  tagline,
  points,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  highlight,
}: {
  icon: LucideIcon;
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
        "group flex flex-col rounded-2xl border bg-white p-6 shadow-card transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-card-lg " +
        (highlight ? "border-brand-300 ring-1 ring-brand-200" : "border-ink-100")
      }
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Icon className="h-6 w-6" strokeWidth={2} />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
          <p className="text-sm text-ink-500">{tagline}</p>
        </div>
      </div>
      <ul className="mt-4 flex-1 space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
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
