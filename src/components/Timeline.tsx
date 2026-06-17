"use client";

import { useMemo } from "react";
import { runProjection } from "@/lib/projectionEngine";
import { usePlan } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { Card, CardHeader, Badge } from "./ui/primitives";

export function Timeline() {
  const { activeScenario } = usePlan();
  const cur = activeScenario.start.currency;
  const result = useMemo(() => runProjection(activeScenario), [activeScenario]);
  const maxWealth = Math.max(1, ...result.years.map((y) => y.endWealth));

  return (
    <div className="space-y-5">
      {/* Visuelle Lebenslinie */}
      <Card>
        <CardHeader title="Lebenslinie" subtitle="Vermögen pro Jahr – Ereignisse sind markiert" />
        <div className="overflow-x-auto px-5 py-6">
          <div className="flex min-w-[680px] items-end gap-[3px]" style={{ height: 180 }}>
            {result.years.map((y, i) => {
              const h = Math.max(2, (y.endWealth / maxWealth) * 160);
              const hasEvent = y.events.length > 0;
              return (
                <div key={y.age} className="group relative flex flex-1 flex-col items-center justify-end">
                  <div
                    className={
                      "animate-grow-up w-full rounded-t-sm transition-colors " +
                      (hasEvent ? "bg-brand-500" : "bg-brand-200 group-hover:bg-brand-300")
                    }
                    style={{ height: h, animationDelay: `${Math.min(i * 22, 1100)}ms` }}
                  />
                  {hasEvent && (
                    <span className="absolute -top-3 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
                  )}
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full z-10 mb-5 hidden w-44 -translate-x-0 rounded-lg bg-ink-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg group-hover:block">
                    <div className="font-semibold">Alter {y.age}</div>
                    <div>{formatCurrency(y.endWealth, cur)}</div>
                    <div className="text-white/70">real {formatCurrency(y.realEndWealth, cur)}</div>
                    {y.events.map((e, i) => (
                      <div key={i} className="text-brand-200">• {e}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-ink-400">
            <span>Alter {activeScenario.start.currentAge}</span>
            <span>Alter {activeScenario.start.targetAge}</span>
          </div>
        </div>
      </Card>

      {/* Tabelle */}
      <Card>
        <CardHeader title="Jahrestabelle" subtitle="Startvermögen, Einzahlungen, Rendite und Ereignisse" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs text-ink-500">
                <Th>Alter</Th>
                <Th className="text-right">Startvermögen</Th>
                <Th className="text-right">Einzahlungen</Th>
                <Th className="text-right">Rendite</Th>
                <Th>Ereignisse</Th>
                <Th className="text-right">Endvermögen</Th>
                <Th className="text-right">Real (heute)</Th>
              </tr>
            </thead>
            <tbody>
              {result.years.map((y) => (
                <tr key={y.age} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                  <Td className="font-medium text-ink-900">{y.age}</Td>
                  <Td className="text-right tabular-nums text-ink-600">{formatCurrency(y.startWealth, cur)}</Td>
                  <Td className="text-right tabular-nums text-ink-600">{formatCurrency(y.contributions, cur)}</Td>
                  <Td className={"text-right tabular-nums " + (y.returnAmount < 0 ? "text-red-600" : "text-emerald-600")}>
                    {formatCurrency(y.returnAmount, cur)}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {y.events.map((e, i) => (
                        <Badge key={i} tone="blue">
                          {e}
                        </Badge>
                      ))}
                    </div>
                  </Td>
                  <Td className="text-right font-semibold tabular-nums text-ink-900">{formatCurrency(y.endWealth, cur)}</Td>
                  <Td className="text-right tabular-nums text-ink-500">{formatCurrency(y.realEndWealth, cur)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={"px-4 py-2.5 font-medium " + (className ?? "")}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={"px-4 py-2.5 " + (className ?? "")}>{children}</td>;
}
