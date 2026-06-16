/** Kleine ID-Hilfe (kein crypto-Zwang, reicht für lokale Datensätze). */
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}
