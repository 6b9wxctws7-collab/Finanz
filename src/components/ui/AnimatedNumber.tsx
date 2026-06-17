"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Zählt einen Zahlenwert weich von seinem vorherigen Wert zum neuen hoch.
 * Das macht Änderungen am Vermögen spürbar – ein kleiner emotionaler Moment.
 *
 * Respektiert prefers-reduced-motion (springt dann direkt auf den Zielwert).
 */
export function AnimatedNumber({
  value,
  format,
  durationMs = 700,
  className,
}: {
  value: number;
  format: (n: number) => string;
  durationMs?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  // Spiegelt den aktuell angezeigten Wert, damit eine neue Animation flüssig
  // dort weitermacht, wo die vorherige (ggf. unterbrochen) stand.
  const displayRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const from = displayRef.current;
    const to = value;
    if (reduce || from === to) {
      displayRef.current = to;
      setDisplay(to);
      return;
    }

    const start = performance.now();
    // easeOutCubic – schneller Start, sanftes Ausklingen.
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const v = from + (to - from) * ease(t);
      displayRef.current = v;
      setDisplay(v);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return <span className={className}>{format(display)}</span>;
}
