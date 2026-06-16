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

  function parse(raw: string): number {
    const num = parseFloat(raw.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(num) ? num : 0;
  }

  function clamp(num: number): number {
    let v = num;
    if (typeof min === "number") v = Math.max(min, v);
    if (typeof max === "number") v = Math.min(max, v);
    return v;
  }

  return (
    <div className="relative">
      <TextInput
        inputMode="decimal"
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          // Während des Tippens nur den Rohwert melden – nicht klemmen,
          // damit z. B. ein zweistelliges Alter flüssig eingegeben werden kann.
          setText(e.target.value);
          onChange(parse(e.target.value));
        }}
        onBlur={() => {
          // Erst beim Verlassen des Feldes auf den gültigen Bereich klemmen.
          const clamped = clamp(parse(text));
          onChange(clamped);
          setText(formatForEdit(clamped));
        }}
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
