/** Mini-Klassennamen-Helfer (vermeidet eine zusätzliche Abhängigkeit). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
