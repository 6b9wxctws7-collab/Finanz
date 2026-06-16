"use client";

import { useEffect, useState } from "react";
import { TextInput } from "./primitives";

/**
 * Numerisches Eingabefeld mit lokalem String-State, damit man frei tippen kann
 * (auch Komma) und der Wert erst beim Ändern als Zahl nach oben gegeben wird.
 */
export function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  placeholder,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  placeholder?: string;
}) {
  const [text, setText] = useState(String(value));

  // Externe Wertänderungen (z. B. Demo laden) übernehmen.
  useEffect(() => {
    setText(formatForEdit(value));
  }, [value]);

  function commit(raw: string) {
    const normalized = raw.replace(/\s/g, "").replace(",", ".");
    let num = parseFloat(normalized);
    if (!Number.isFinite(num)) num = 0;
    if (typeof min === "number") num = Math.max(min, num);
    if (typeof max === "number") num = Math.min(max, num);
    onChange(num);
  }

  return (
    <div className="relative">
      <TextInput
        inputMode="decimal"
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          commit(e.target.value);
        }}
        onBlur={() => setText(formatForEdit(value))}
        className={suffix ? "pr-10" : undefined}
        step={step}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400">
          {suffix}
        </span>
      )}
    </div>
  );
}

function formatForEdit(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return String(value);
}
