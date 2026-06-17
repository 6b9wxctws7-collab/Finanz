"use client";

import { useMemo } from "react";

const COLORS = ["#2f7df0", "#16b8cf", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

/**
 * Leichter Konfetti-Regen für Feier-Momente – rein CSS, keine Abhängigkeit.
 * Liegt als absolutes Overlay über dem Eltern-Container (pointer-events-none)
 * und spielt einmal ab. Bei prefers-reduced-motion wird nichts gezeigt.
 */
export function Confetti({ pieces = 70 }: { pieces?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.4,
        width: 6 + Math.random() * 6,
        height: 8 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        rounded: Math.random() > 0.5,
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
            top: -16,
            left: `${it.left}%`,
            width: it.width,
            height: it.height,
            backgroundColor: it.color,
            borderRadius: it.rounded ? "9999px" : "2px",
            animation: `confettiFall ${it.duration}s ${it.delay}s cubic-bezier(0.3,0.7,0.4,1) forwards`,
          }}
        />
      ))}
    </div>
  );
}
