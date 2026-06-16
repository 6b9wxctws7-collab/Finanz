export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "text-[11px] leading-snug text-ink-400"
          : "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-snug text-amber-800"
      }
    >
      <strong>Hinweis:</strong> Dies ist eine Simulation und keine Finanz- oder
      Anlageberatung. Renditen sind Annahmen und nicht garantiert. Es werden keine
      konkreten Produkte empfohlen.
    </div>
  );
}
