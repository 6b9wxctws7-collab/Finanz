"use client";

import { useState } from "react";
import { PriceChoice, saveFeedback, UserRole, WouldPay } from "@/lib/feedback";
import { cn } from "@/lib/cn";
import { Button, Card, CardHeader } from "./ui/primitives";
import {
  Briefcase,
  CheckCircle2,
  HelpCircle,
  LucideIcon,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from "lucide-react";

const priceOptions: { value: PriceChoice; label: string }[] = [
  { value: "19", label: "19 € einmalig" },
  { value: "29", label: "29 € einmalig" },
  { value: "49", label: "49 € einmalig" },
  { value: "monthly", label: "Monatlich" },
];

export function FeedbackWidget() {
  const [wouldPay, setWouldPay] = useState<WouldPay | null>(null);
  const [price, setPrice] = useState<PriceChoice | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [missing, setMissing] = useState("");
  const [done, setDone] = useState(false);

  function submit() {
    if (!wouldPay) return;
    saveFeedback({
      wouldPay,
      priceChoice: wouldPay === "yes" ? price : null,
      missing,
      role,
    });
    setDone(true);
  }

  if (done) {
    return (
      <Card className="border-emerald-200">
        <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
          <CheckCircle2 className="h-9 w-9 animate-pop-in text-emerald-500" strokeWidth={1.5} />
          <p className="text-sm font-medium text-ink-800">Danke für dein Feedback!</p>
          <p className="max-w-sm text-xs text-ink-400">
            Es hilft uns zu entscheiden, ob und wie wir ETFMaxxing weiterbauen.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Kurzes Feedback (30 Sek.)"
        subtitle="Hilf uns herauszufinden, ob sich das Produkt lohnt."
      />
      <div className="space-y-5 px-5 py-5">
        {/* Frage 1 */}
        <div>
          <p className="mb-2 text-sm font-medium text-ink-800">Würdest du für dieses Tool zahlen?</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { v: "yes", l: "Ja", icon: ThumbsUp },
                { v: "maybe", l: "Vielleicht", icon: HelpCircle },
                { v: "no", l: "Nein", icon: ThumbsDown },
              ] as { v: WouldPay; l: string; icon: LucideIcon }[]
            ).map((o) => {
              const Icon = o.icon;
              return (
                <Chip key={o.v} active={wouldPay === o.v} onClick={() => setWouldPay(o.v)}>
                  <Icon className="h-4 w-4" /> {o.l}
                </Chip>
              );
            })}
          </div>
        </div>

        {/* Frage 2 – nur bei "Ja" */}
        {wouldPay === "yes" && (
          <div className="animate-fade-in">
            <p className="mb-2 text-sm font-medium text-ink-800">Welcher Preis wäre fair?</p>
            <div className="flex flex-wrap gap-2">
              {priceOptions.map((o) => (
                <Chip key={o.value} active={price === o.value} onClick={() => setPrice(o.value)}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Rolle */}
        <div>
          <p className="mb-2 text-sm font-medium text-ink-800">Du nutzt das als …</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={role === "private"} onClick={() => setRole("private")}>
              <UserRound className="h-4 w-4" /> Privatperson
            </Chip>
            <Chip active={role === "advisor"} onClick={() => setRole("advisor")}>
              <Briefcase className="h-4 w-4" /> Berater:in / Coach
            </Chip>
          </div>
        </div>

        {/* Frage 3 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink-800">Was fehlt dir?</label>
          <textarea
            value={missing}
            onChange={(e) => setMissing(e.target.value)}
            rows={3}
            placeholder="z. B. mehrere Depots, Steuern, gemeinsame Planung als Paar …"
            className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-ink-400">Wird lokal gespeichert.</span>
          <Button variant="primary" onClick={submit} disabled={!wouldPay}>
            Feedback senden
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50",
      )}
    >
      {children}
    </button>
  );
}
