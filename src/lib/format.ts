import { Currency } from "./types";

/** Währung sauber formatieren (de-CH / de-DE Locale je nach Währung). */
export function formatCurrency(value: number, currency: Currency, opts?: { maximumFractionDigits?: number }): string {
  const locale = currency === "CHF" ? "de-CH" : "de-DE";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: opts?.maximumFractionDigits ?? 0,
  }).format(Number.isFinite(value) ? value : 0);
}

/** Kompakte Darstellung großer Beträge, z. B. 1,2 Mio. */
export function formatCurrencyCompact(value: number, currency: Currency): string {
  const locale = currency === "CHF" ? "de-CH" : "de-DE";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0);
}

/** Prozentwert formatieren. value ist ein Anteil, z. B. 0.08 -> "8 %". */
export function formatPercent(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat("de-DE", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}

/** Alter formatieren, ggf. mit Nachkommastelle für Teiljahre. */
export function formatAge(age: number | null): string {
  if (age === null || !Number.isFinite(age)) return "—";
  return `${Math.round(age)} Jahre`;
}

/** Plain-Zahl mit Tausendertrennzeichen. */
export function formatNumber(value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits }).format(
    Number.isFinite(value) ? value : 0,
  );
}
