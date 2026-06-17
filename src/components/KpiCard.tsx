"use client";

import { cn } from "@/lib/cn";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { InfoTip } from "./ui/primitives";

export function KpiCard({
  label,
  value,
  sub,
  hint,
  tone = "default",
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  hint?: string;
  tone?: "default" | "brand" | "green" | "amber";
  icon?: LucideIcon;
}) {
  const tones = {
    default: "bg-white border-ink-100",
    brand: "bg-gradient-to-br from-brand-600 to-brand-700 border-brand-700 text-white",
    green: "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-600 text-white",
    amber: "bg-white border-amber-200",
  };
  const isDark = tone === "brand" || tone === "green";
  return (
    <div
      className={cn(
        "group rounded-2xl border p-4 shadow-card transition-transform duration-300 hover:-translate-y-1 hover:shadow-card-lg",
        tones[tone],
      )}
    >
      <div className="flex items-center gap-1.5">
        {Icon && (
          <Icon
            className={cn(
              "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
              isDark ? "text-white/90" : "text-brand-500",
            )}
            strokeWidth={2.25}
          />
        )}
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
