"use client";

import { useMemo } from "react";

const NOTES = ["💶", "💸", "🤑", "💰", "🪙"];

/**
 * Geldregen für Feier-Momente – fallende Geld-Emojis, rein CSS.
 * Liegt als Overlay über dem Eltern-Container (pointer-events-none) und spielt
 * einmal ab. Bei prefers-reduced-motion wird nichts gezeigt.
 */
export function MoneyRain({ pieces = 36 }: { pieces?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.6,
        size: 18 + Math.random() * 20,
        note: NOTES[i % NOTES.length],
      })),
    [pieces],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden motion-reduce:hidden"
      aria-hidden="true"
    >
      {items.map((it, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: -32,
            left: `${it.left}%`,
            fontSize: it.size,
            lineHeight: 1,
            animation: `moneyFall ${it.duration}s ${it.delay}s ease-in forwards`,
          }}
        >
          {it.note}
        </span>
      ))}
    </div>
  );
}
