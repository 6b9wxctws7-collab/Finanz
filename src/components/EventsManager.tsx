"use client";

import { useMemo } from "react";
import { runProjection } from "@/lib/projectionEngine";
import { usePlan } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { emptyEvent, eventTemplates, eventTypeLabels } from "@/lib/templates";
import { EventType, LifeEvent, Recurrence, Scenario } from "@/lib/types";
import { Button, Card, CardHeader, Field, Select, Badge } from "./ui/primitives";
import { NumberInput } from "./ui/NumberInput";
import { Inbox, Plus, Trash2 } from "lucide-react";

export function EventsManager() {
  const { activeScenario, updateActiveScenario } = usePlan();
  const cur = activeScenario.start.currency;

  function addEvents(events: LifeEvent[]) {
    updateActiveScenario((sc) => ({ ...sc, events: [...sc.events, ...events] }));
  }
  function updateEvent(id: string, patch: Partial<LifeEvent>) {
    updateActiveScenario((sc) => ({
      ...sc,
      events: sc.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }
  function removeEvent(id: string) {
    updateActiveScenario((sc) => ({ ...sc, events: sc.events.filter((e) => e.id !== id) }));
  }

  const sorted = [...activeScenario.events].sort((a, b) => a.age - b.age);

  // Basis-Endvermögen (mit allen aktiven Ereignissen) einmal berechnen und an
  // alle Zeilen weitergeben – statt es pro Zeile erneut zu projizieren.
  const baseFinalWealth = useMemo(
    () => runProjection(activeScenario).finalWealth,
    [activeScenario],
  );

  return (
    <div className="space-y-5">
      {/* Templates */}
      <Card>
        <CardHeader title="Vorlagen" subtitle="Mit einem Klick ein typisches Lebensereignis hinzufügen" />
        <div className="grid grid-cols-2 gap-2.5 px-5 py-4 sm:grid-cols-3 lg:grid-cols-5">
          {eventTemplates.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => addEvents(t.build(suggestAge(activeScenario)))}
                className="flex flex-col items-start gap-1 rounded-xl border border-ink-200 bg-white p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="text-sm font-medium text-ink-900">{t.label}</span>
                <span className="text-[11px] leading-snug text-ink-400">{t.description}</span>
              </button>
            );
          })}
        </div>
        <div className="border-t border-ink-100 px-5 py-3">
          <Button variant="ghost" onClick={() => addEvents([emptyEvent(suggestAge(activeScenario))])}>
            <Plus className="h-4 w-4" /> Eigenes Ereignis manuell anlegen
          </Button>
        </div>
      </Card>

      {/* Liste */}
      {sorted.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
            <Inbox className="h-8 w-8 text-ink-300" strokeWidth={1.5} />
            <p className="text-sm font-medium text-ink-700">Noch keine Lebensereignisse</p>
            <p className="max-w-sm text-xs text-ink-400">
              Füge oben eine Vorlage hinzu oder lege ein eigenes Ereignis an, um zu sehen,
              wie es deine Vermögenskurve verändert.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((ev) => (
            <EventRow
              key={ev.id}
              event={ev}
              scenario={activeScenario}
              baseFinalWealth={baseFinalWealth}
              currency={cur}
              onChange={(p) => updateEvent(ev.id, p)}
              onRemove={() => removeEvent(ev.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Schlägt ein sinnvolles Standardalter für ein neues Ereignis vor. */
function suggestAge(sc: Scenario): number {
  return Math.min(sc.start.targetAge - 1, sc.start.currentAge + 5);
}

function EventRow({
  event,
  scenario,
  baseFinalWealth,
  currency,
  onChange,
  onRemove,
}: {
  event: LifeEvent;
  scenario: Scenario;
  baseFinalWealth: number;
  currency: import("@/lib/types").Currency;
  onChange: (patch: Partial<LifeEvent>) => void;
  onRemove: () => void;
}) {
  // Opportunitätskosten: Endvermögen mit allen Ereignissen (vom Parent
  // einmalig berechnet) minus Endvermögen ohne genau dieses Ereignis.
  const impact = useMemo(() => {
    const without = runProjection({
      ...scenario,
      events: scenario.events.filter((e) => e.id !== event.id),
    }).finalWealth;
    return baseFinalWealth - without;
  }, [scenario, event.id, baseFinalWealth]);

  const isPercent = event.type === "income_change" || event.type === "crash";
  const amountSuffix = isPercent ? "%" : currency;

  return (
    <Card className={event.enabled ? "" : "opacity-60"}>
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Field label="Name">
            <input
              value={event.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </Field>
          <Field label="Typ">
            <Select
              value={event.type}
              onChange={(e) => onChange(applyTypeChange(e.target.value as EventType, event))}
            >
              {(Object.keys(eventTypeLabels) as EventType[]).map((t) => (
                <option key={t} value={t}>
                  {eventTypeLabels[t]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Alter">
            <NumberInput
              value={event.age}
              onChange={(v) => onChange({ age: v })}
              min={scenario.start.currentAge}
              max={scenario.start.targetAge}
              suffix="J."
            />
          </Field>
          <Field label={isPercent ? "Wert" : "Betrag"}>
            <NumberInput value={event.amount} onChange={(v) => onChange({ amount: v })} suffix={amountSuffix} />
          </Field>
          {isRecurringType(event.type) ? (
            <Field label="Dauer (Jahre, optional)" hint="Leer = bis zum Zielalter.">
              <NumberInput
                value={event.durationYears ?? 0}
                onChange={(v) => onChange({ durationYears: v > 0 ? v : undefined })}
                min={0}
                suffix="J."
              />
            </Field>
          ) : (
            <Field label="Wiederholung">
              <Select
                value={event.recurrence}
                onChange={(e) => onChange({ recurrence: e.target.value as Recurrence })}
                disabled={!canEditRecurrence(event.type)}
              >
                <option value="once">einmalig</option>
                <option value="monthly">monatlich</option>
                <option value="yearly">jährlich</option>
              </Select>
            </Field>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-[11px] text-ink-400">Effekt auf Endvermögen</div>
            <div className={"text-sm font-semibold tabular-nums " + (impact < 0 ? "text-red-600" : "text-emerald-600")}>
              {impact >= 0 ? "+" : ""}
              {formatCurrency(impact, currency)}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="flex items-center gap-1.5 text-xs text-ink-500">
              <input
                type="checkbox"
                checked={event.enabled}
                onChange={(e) => onChange({ enabled: e.target.checked })}
                className="h-4 w-4 rounded border-ink-300 text-brand-600"
              />
              aktiv
            </label>
            <Button variant="danger" onClick={onRemove} className="px-2.5 py-1.5">
              <Trash2 className="h-3.5 w-3.5" /> Löschen
            </Button>
          </div>
        </div>
      </div>

      {impact < 0 && event.enabled && (
        <div className="border-t border-ink-100 bg-ink-50/60 px-4 py-2 text-xs text-ink-600">
          „{event.name}" reduziert dein Endvermögen bis {scenario.start.targetAge} um ca.{" "}
          <strong className="text-red-600">{formatCurrency(Math.abs(impact), currency)}</strong>.
        </div>
      )}
    </Card>
  );
}

function isRecurringType(t: EventType): boolean {
  return t === "recurring_expense" || t === "recurring_income";
}

function canEditRecurrence(t: EventType): boolean {
  // Crash & Sparraten-/Einkommensänderung haben eine feste Logik.
  return t === "one_time_expense" || t === "one_time_income";
}

/** Beim Typwechsel sinnvolle Recurrence-Defaults setzen. */
function applyTypeChange(type: EventType, ev: LifeEvent): Partial<LifeEvent> {
  switch (type) {
    case "recurring_expense":
    case "recurring_income":
    case "income_change":
    case "savings_rate_change":
      return { type, recurrence: "monthly" };
    default:
      return { type, recurrence: "once" };
  }
}
