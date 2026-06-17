"use client";

import { useState } from "react";
import {
  CalendarClock,
  Check,
  LineChart,
  PartyPopper,
  PiggyBank,
  ShoppingCart,
  Sparkles,
  Target,
} from "lucide-react";
import { usePlan } from "@/lib/store";
import { defaultBudget } from "@/lib/seed";
import { uid } from "@/lib/id";
import { formatCurrency } from "@/lib/format";
import { Country, Scenario } from "@/lib/types";
import { Button, Field, Segmented } from "@/components/ui/primitives";
import { NumberInput } from "@/components/ui/NumberInput";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Logo } from "@/components/ui/Logo";
import { Disclaimer } from "@/components/Disclaimer";

const STEPS = ["Willkommen", "Über dich", "Finanzen", "Annahmen", "Fertig"];

export function Onboarding() {
  const { startPlan, skipOnboarding, loadDemo } = usePlan();

  const [step, setStep] = useState(0);
  const [country, setCountry] = useState<Country>("DE");
  const [currentAge, setCurrentAge] = useState(30);
  const [targetAge, setTargetAge] = useState(65);
  const [startWealth, setStartWealth] = useState(10000);
  const [netIncome, setNetIncome] = useState(3200);
  const [monthlySavings, setMonthlySavings] = useState(500);
  const [annualReturn, setAnnualReturn] = useState(0.08);
  const [annualInflation, setAnnualInflation] = useState(0.02);

  const currency = country === "CH" ? "CHF" : "EUR";
  const highReturn = annualReturn > 0.1;

  function finish() {
    const scenario: Scenario = {
      id: uid("sc"),
      name: "Meine Planung",
      start: {
        country,
        currency,
        currentAge,
        targetAge,
        startWealth,
        annualReturn,
        annualInflation,
        annualSalaryGrowth: 0.01,
        netIncome,
      },
      savingsMode: "fixed",
      fixedSavings: monthlySavings,
      budget: defaultBudget(),
      events: [],
    };
    startPlan(scenario);
  }

  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-gradient-to-b from-brand-50 to-white">
      {/* Kopf: Fortschritt + Überspringen */}
      <div className="flex items-center justify-between gap-4 border-b border-ink-100 bg-white px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={
                  "h-1.5 rounded-full transition-all duration-500 " +
                  (i === step
                    ? "w-7 animate-pulse bg-brand-600"
                    : i < step
                    ? "w-3 bg-brand-300"
                    : "w-3 bg-ink-200")
                }
              />
            ))}
          </div>
          <span className="hidden text-xs font-medium text-ink-400 sm:inline">
            Schritt {step + 1} von {STEPS.length}
          </span>
        </div>
        <button onClick={skipOnboarding} className="text-sm font-medium text-ink-400 hover:text-ink-600">
          Überspringen
        </button>
      </div>

      {/* Inhalt: füllt den Bildschirm, vertikal zentriert */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-6 py-10 sm:px-8">
          <div key={step} className="animate-fade-in-up">
          {step === 0 && <WelcomeStep />}

          {step === 1 && (
            <StepShell title="Erzähl uns von dir" subtitle="Damit wir deine Zeitachse aufspannen können.">
              <Field label="Land">
                <Segmented<Country>
                  value={country}
                  onChange={setCountry}
                  options={[
                    { value: "DE", label: "Deutschland" },
                    { value: "CH", label: "Schweiz" },
                  ]}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Dein aktuelles Alter">
                  <NumberInput value={currentAge} onChange={setCurrentAge} min={14} max={90} suffix="J." />
                </Field>
                <Field label="Zielalter" hint="Meist das Renteneintrittsalter, Standard 65.">
                  <NumberInput value={targetAge} onChange={setTargetAge} min={currentAge + 1} max={100} suffix="J." />
                </Field>
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell title="Deine Finanzen heute" subtitle="Grobe Werte reichen – du kannst alles später verfeinern.">
              <Field label="Aktuelles Vermögen / Erspartes">
                <NumberInput value={startWealth} onChange={setStartWealth} min={0} suffix={currency} />
              </Field>
              <Field label="Monatliches Nettoeinkommen">
                <NumberInput value={netIncome} onChange={setNetIncome} min={0} suffix={currency} />
              </Field>
              <Field
                label="Wie viel kannst du monatlich sparen?"
                hint="Schätzung genügt. Im Budgetplaner kannst du das später exakt aus deinen Ausgaben berechnen lassen."
              >
                <NumberInput value={monthlySavings} onChange={setMonthlySavings} suffix={currency} />
              </Field>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell title="Annahmen" subtitle="Diese Werte sind Annahmen – keine Garantie. Du kannst sie jederzeit ändern.">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Erwartete Rendite p.a." hint="Langfristiger Durchschnitt am Aktienmarkt, optimistisch ~8 %.">
                  <NumberInput
                    value={Math.round(annualReturn * 1000) / 10}
                    onChange={(v) => setAnnualReturn(v / 100)}
                    min={0}
                    max={30}
                    step={0.1}
                    suffix="%"
                  />
                </Field>
                <Field label="Inflation p.a." hint="Senkt die reale Kaufkraft, typisch ~2 %.">
                  <NumberInput
                    value={Math.round(annualInflation * 1000) / 10}
                    onChange={(v) => setAnnualInflation(v / 100)}
                    min={0}
                    max={20}
                    step={0.1}
                    suffix="%"
                  />
                </Field>
              </div>
              {highReturn && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Eine Rendite über 10 % p.a. ist sehr optimistisch und keinesfalls garantiert.
                </p>
              )}
              <Disclaimer compact />
            </StepShell>
          )}

          {step === 4 && (
            <div>
              <div className="flex justify-center">
                <span className="flex h-16 w-16 animate-pop-in items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <PartyPopper className="h-8 w-8 animate-float" strokeWidth={2} />
                </span>
              </div>
              <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                Let&apos;s gooo – dein Plan steht
              </h2>
              <p className="mt-2 text-center text-base text-ink-500">
                Das hast du eingegeben – jederzeit änderbar:
              </p>
              <div className="mt-6 animate-pop-in rounded-xl border border-ink-100 bg-ink-50/60 p-4 text-sm">
                <SummaryRow label="Alter" value={`${currentAge} → ${targetAge} Jahre`} />
                <SummaryRow
                  label="Startvermögen"
                  value={<AnimatedNumber value={startWealth} durationMs={900} format={(n) => formatCurrency(n, currency)} />}
                />
                <SummaryRow
                  label="Nettoeinkommen"
                  value={
                    <span>
                      <AnimatedNumber value={netIncome} durationMs={900} format={(n) => formatCurrency(n, currency)} /> / Monat
                    </span>
                  }
                />
                <SummaryRow
                  label="Sparrate"
                  value={
                    <span>
                      <AnimatedNumber value={monthlySavings} durationMs={900} format={(n) => formatCurrency(n, currency)} /> / Monat
                    </span>
                  }
                />
                <SummaryRow
                  label="Rendite / Inflation"
                  value={`${(annualReturn * 100).toFixed(1)} % / ${(annualInflation * 100).toFixed(1)} %`}
                />
              </div>
              <p className="mt-4 text-xs text-ink-500">
                Als Nächstes siehst du dein Dashboard. Über die farbigen Reiter feinst du dein
                <strong> Budget</strong> ab, fügst <strong>Lebensereignisse</strong> hinzu und
                <strong> vergleichst Szenarien</strong>.
              </p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-ink-100 bg-white px-6 py-4 sm:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          {step === 0 ? (
            <Button variant="ghost" onClick={loadDemo}>
              Lieber Demo ansehen
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Zurück
            </Button>
          )}
          {isLast ? (
            <Button variant="primary" onClick={finish} className="px-6 py-3 text-base">
              <Check className="h-4 w-4" /> Planung starten
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)} className="px-6 py-3 text-base">
              {step === 0 ? "Los geht's" : "Weiter"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  const benefits = [
    { icon: LineChart, text: "Deine Vermögenskurve bis zur Rente – Monat für Monat, kein Vibe-Guessing." },
    { icon: Target, text: "Sieh, wann du 100k, 500k und die erste Mio. knackst." },
    { icon: CalendarClock, text: "Spiele Auto, Wohnung, Teilzeit oder Sabbatical durch." },
    { icon: ShoppingCart, text: "Der echte Wert nach Inflation – ohne Copium." },
  ];
  return (
    <div className="text-center">
      <div className="mb-5 flex animate-pop-in justify-center">
        <Logo size={52} />
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
        <Sparkles className="h-3.5 w-3.5 animate-pulse" /> In 2 Minuten startklar · no cap
      </span>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
        Lass uns dein Depot maxxen
      </h2>
      <p className="mx-auto mt-3 max-w-md text-base text-ink-500">
        Ein paar schnelle Fragen – danach siehst du sofort, wie deine Entscheidungen
        dein Vermögen über die Jahre cooken (oder grillen).
      </p>
      <ul className="stagger-children mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-2">
        {benefits.map((b, i) => {
          const Icon = b.icon;
          return (
            <li
              key={i}
              className="group flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-card transition-transform duration-300 hover:-translate-y-1 hover:shadow-card-lg"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="text-sm text-ink-700">{b.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h2>
      <p className="mt-2 text-base text-ink-500">{subtitle}</p>
      <div className="mt-6 space-y-4">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-1.5 last:border-0">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}
