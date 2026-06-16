// ---------------------------------------------------------------------------
// feedback.ts
//
// Validierungs-Datenerfassung: Beta-Anfragen ("Leads") und Produkt-Feedback
// (Zahlungsbereitschaft). Wird lokal in localStorage gespeichert und ist so
// strukturiert, dass es sich später 1:1 an Supabase senden lässt.
//
// ---------------------------------------------------------------------------
// SUPABASE-VORLAGE (später):
//
//   create table beta_leads (
//     id           text primary key,
//     created_at   timestamptz not null default now(),
//     email        text not null,
//     name         text,
//     role         text,            -- 'private' | 'advisor'
//     message      text
//   );
//
//   create table product_feedback (
//     id            text primary key,
//     created_at    timestamptz not null default now(),
//     would_pay     text not null,  -- 'yes' | 'no' | 'maybe'
//     price_choice  text,           -- '19' | '29' | '49' | 'monthly' | null
//     missing       text,           -- "Was fehlt dir?"
//     role          text            -- 'private' | 'advisor' | null
//   );
//
// Senden später z. B. über:
//   await supabase.from("product_feedback").insert(payload);
// ---------------------------------------------------------------------------

import { uid } from "./id";

export type UserRole = "private" | "advisor";
export type WouldPay = "yes" | "no" | "maybe";
export type PriceChoice = "19" | "29" | "49" | "monthly";

export interface BetaLead {
  id: string;
  createdAt: string; // ISO
  email: string;
  name?: string;
  role?: UserRole;
  message?: string;
  synced: boolean; // wurde bereits an ein Backend übertragen?
}

export interface ProductFeedback {
  id: string;
  createdAt: string; // ISO
  wouldPay: WouldPay;
  priceChoice: PriceChoice | null;
  missing: string;
  role: UserRole | null;
  synced: boolean;
}

const LEADS_KEY = "moneytimeline.leads.v1";
const FEEDBACK_KEY = "moneytimeline.feedback.v1";

// ---- generische localStorage-Helfer ---------------------------------------

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Speicher nicht verfügbar – ignorieren
  }
}

// ---- Beta-Leads -------------------------------------------------------------

export function saveBetaLead(input: {
  email: string;
  name?: string;
  role?: UserRole;
  message?: string;
}): BetaLead {
  const lead: BetaLead = {
    id: uid("lead"),
    createdAt: new Date().toISOString(),
    email: input.email.trim(),
    name: input.name?.trim() || undefined,
    role: input.role,
    message: input.message?.trim() || undefined,
    synced: false,
  };
  writeList(LEADS_KEY, [...readList<BetaLead>(LEADS_KEY), lead]);
  void submitToBackend("beta_leads", lead);
  return lead;
}

export function getBetaLeads(): BetaLead[] {
  return readList<BetaLead>(LEADS_KEY);
}

// ---- Produkt-Feedback -------------------------------------------------------

export function saveFeedback(input: {
  wouldPay: WouldPay;
  priceChoice: PriceChoice | null;
  missing: string;
  role: UserRole | null;
}): ProductFeedback {
  const fb: ProductFeedback = {
    id: uid("fb"),
    createdAt: new Date().toISOString(),
    wouldPay: input.wouldPay,
    priceChoice: input.priceChoice,
    missing: input.missing.trim(),
    role: input.role,
    synced: false,
  };
  writeList(FEEDBACK_KEY, [...readList<ProductFeedback>(FEEDBACK_KEY), fb]);
  void submitToBackend("product_feedback", fb);
  return fb;
}

export function getFeedback(): ProductFeedback[] {
  return readList<ProductFeedback>(FEEDBACK_KEY);
}

/** Alle gesammelten Validierungsdaten als JSON exportieren (z. B. zur Analyse). */
export function exportValidationData(): string {
  return JSON.stringify(
    { leads: getBetaLeads(), feedback: getFeedback(), exportedAt: new Date().toISOString() },
    null,
    2,
  );
}

// ---- Optionale Backend-Anbindung (Supabase-ready) ---------------------------
//
// Wenn NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY gesetzt sind,
// wird der Datensatz per Supabase-REST-API eingefügt. Ohne Konfiguration
// passiert nichts (No-Op) – die Daten bleiben rein lokal.

async function submitToBackend(table: "beta_leads" | "product_feedback", payload: object): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return; // lokal-only Modus

  try {
    await fetch(`${url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Offline / Fehler: Datensatz bleibt lokal (synced=false) erhalten.
  }
}
