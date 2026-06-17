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
        <linearGradient id={frame} x1="55" y1="9" x2="9" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#19b8cf" />
          <stop offset="1" stopColor="#2f7df0" />
        </linearGradient>
        <linearGradient id={bar} x1="32" y1="25" x2="32" y2="47" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#50a4f7" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={line} x1="15" y1="42" x2="46" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2f7df0" />
          <stop offset="1" stopColor="#16b8cf" />
        </linearGradient>
      </defs>
      {/* Rahmen mit offener Ecke oben rechts */}
      <path
        d="M46 9 H21 Q9 9 9 21 V43 Q9 55 21 55 H43 Q55 55 55 43 V22"
        stroke={`url(#${frame})`}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <rect x="18" y="40" width="6" height="7" rx="1.6" fill={`url(#${bar})`} />
      <rect x="27.5" y="34" width="6" height="13" rx="1.6" fill={`url(#${bar})`} />
      <rect x="37" y="27" width="6" height="20" rx="1.6" fill={`url(#${bar})`} />
      <polyline
        points="17,41 26,34 34,30 45,21"
        stroke={`url(#${line})`}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="41" r="3" fill="#2f7df0" />
      <circle cx="26" cy="34" r="3" fill="#2f7df0" />
      <circle cx="34" cy="30" r="3" fill="#2a9fd6" />
      <circle cx="45" cy="21" r="3.6" fill="#16b8cf" />
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
