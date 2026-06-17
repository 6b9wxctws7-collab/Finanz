import { useId } from "react";
import { cn } from "@/lib/cn";

/** Reine Bildmarke (das Diagramm-Icon im abgerundeten Rahmen). */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  // Eindeutige Gradient-IDs, damit mehrere Instanzen im selben Dokument nicht kollidieren.
  const uid = useId().replace(/:/g, "");
  const frame = `mtFrame-${uid}`;
  const bar = `mtBar-${uid}`;
  const line = `mtLine-${uid}`;
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      className={className}
      role="img"
      aria-label="MoneyTimeline Studio Logo"
    >
      <defs>
        <linearGradient id={frame} x1="56" y1="8" x2="8" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22b8cb" />
          <stop offset="1" stopColor="#2f7df0" />
        </linearGradient>
        <linearGradient id={bar} x1="32" y1="24" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3b86f6" />
          <stop offset="1" stopColor="#2f6cf0" />
        </linearGradient>
        <linearGradient id={line} x1="14" y1="44" x2="46" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2f7df0" />
          <stop offset="1" stopColor="#22b8cb" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="48" height="48" rx="13" stroke={`url(#${frame})`} strokeWidth="3.5" />
      <rect x="19" y="38" width="6" height="9" rx="1.5" fill={`url(#${bar})`} />
      <rect x="29" y="32" width="6" height="15" rx="1.5" fill={`url(#${bar})`} />
      <rect x="39" y="26" width="6" height="21" rx="1.5" fill={`url(#${bar})`} />
      <polyline
        points="16,42 25,35 33,31 44,22"
        stroke={`url(#${line})`}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="42" r="3" fill="#2f7df0" />
      <circle cx="25" cy="35" r="3" fill="#2f7df0" />
      <circle cx="33" cy="31" r="3" fill="#2aa0d8" />
      <circle cx="44" cy="22" r="3.4" fill="#22b8cb" />
    </svg>
  );
}

/** Vollständiges Logo: Bildmarke + Wortmarke. */
export function Logo({
  size = 40,
  className,
  showWordmark = true,
}: {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className="leading-none">
          <span className="block text-lg font-bold tracking-tight">
            <span className="text-ink-900">Money</span>
            <span className="text-[#1aa6bb]">Timeline</span>
          </span>
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-400">
            Studio
          </span>
        </span>
      )}
    </span>
  );
}
