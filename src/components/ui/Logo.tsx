import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Reine Bildmarke (das Diagramm-Icon im abgerundeten Rahmen).
 *
 * Wird bewusst inline als SVG gerendert – nie über <img>. So kann der Browser
 * kein „kaputtes Bild“ (Fragezeichen) anzeigen und das Logo ist sofort da,
 * unabhängig vom Laden externer Dateien. Hält public/logo-mark.svg gespiegelt.
 */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  // Eindeutige Gradient-IDs, damit mehrere Instanzen nicht kollidieren.
  const uid = useId().replace(/:/g, "");
  const frame = `mtFrame-${uid}`;
  const barBlue = `mtBarBlue-${uid}`;
  const barTeal = `mtBarTeal-${uid}`;
  const line = `mtLine-${uid}`;
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      className={className}
      role="img"
      aria-label="ETFMaxxing Logo"
    >
      <defs>
        <linearGradient id={frame} x1="55" y1="9" x2="9" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#19b8cf" />
          <stop offset="1" stopColor="#2f7df0" />
        </linearGradient>
        <linearGradient id={barBlue} x1="32" y1="22" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4f9ff7" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={barTeal} x1="44" y1="20" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22c7d6" />
          <stop offset="1" stopColor="#1aa6c4" />
        </linearGradient>
        <linearGradient id={line} x1="15" y1="42" x2="46" y2="19" gradientUnits="userSpaceOnUse">
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
      {/* Balken: drei blau aufsteigend, rechts der höchste in teal */}
      <rect x="16.5" y="39" width="5.5" height="9" rx="1.5" fill={`url(#${barBlue})`} />
      <rect x="24.5" y="34" width="5.5" height="14" rx="1.5" fill={`url(#${barBlue})`} />
      <rect x="32.5" y="28" width="5.5" height="20" rx="1.5" fill={`url(#${barBlue})`} />
      <rect x="40.5" y="22" width="5.5" height="26" rx="1.5" fill={`url(#${barTeal})`} />
      {/* Linie mit Knoten */}
      <polyline
        points="16,41 24,35 32,30 44,20"
        stroke={`url(#${line})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="41" r="2.9" fill="#2f7df0" />
      <circle cx="24" cy="35" r="2.9" fill="#2f7df0" />
      <circle cx="32" cy="30" r="2.9" fill="#2a9fd6" />
      <circle cx="44" cy="20" r="3.4" fill="#16b8cf" />
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
        <span className="text-xl font-bold tracking-tight">
          <span className="text-ink-900">ETF</span>
          <span className="text-[#1aa6bb]">Maxxing</span>
        </span>
      )}
    </span>
  );
}
