"use client";

import { cn } from "@/lib/cn";
import { ReactNode } from "react";
import { InfoTip } from "./ui/primitives";

export function KpiCard({
  label,
  value,
  sub,
  hint,
  tone = "default",
  emoji,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  hint?: string;
  tone?: "default" | "brand" | "green" | "amber";
  emoji?: string;
}) {
  const tones = {
    default: "bg-white border-ink-100",
    brand: "bg-gradient-to-br from-brand-600 to-brand-700 border-brand-700 text-white",
    green: "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-600 text-white",
    amber: "bg-white border-amber-200",
  };
  const isDark = tone === "brand" || tone === "green";
  return (
    <div className={cn("rounded-2xl border p-4 shadow-card", tones[tone])}>
      <div className="flex items-center gap-1.5">
        {emoji && <span className="text-sm">{emoji}</span>}
        <span className={cn("text-xs font-medium", isDark ? "text-white/80" : "text-ink-500")}>
          {label}
        </span>
        {hint && !isDark && <InfoTip text={hint} />}
      </div>
      <div className={cn("mt-1.5 text-2xl font-semibold tracking-tight", isDark ? "text-white" : "text-ink-900")}>
        {value}
      </div>
      {sub && (
        <div className={cn("mt-1 text-xs", isDark ? "text-white/75" : "text-ink-500")}>{sub}</div>
      )}
    </div>
  );
}
