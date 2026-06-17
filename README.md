# 💹 MoneyTimeline Studio

Interaktiver Finanz-Zukunftsplaner für **Deutschland und die Schweiz**. Simuliere,
wie sich Budget, Inflation, Rendite, Sparrate und Lebensereignisse (Auto, Gehaltserhöhung,
Wohnungskauf, Teilzeit, Sabbatical …) langfristig auf dein Vermögen auswirken.

> **Hinweis:** Dies ist ausschließlich ein Simulationstool und **keine Finanz- oder
> Anlageberatung**. Renditen sind Annahmen und nicht garantiert. Es werden keine
> konkreten Produkte empfohlen.

## Features

- **Dashboard** mit großen Kennzahlenkarten (Endvermögen, Kaufkraft, Meilensteine 100k/500k/1 Mio.)
- **Startdaten**: Land/Währung, Alter, Zielalter, Startvermögen, editierbare Rendite & Inflation
- **Budgetplaner**: Fixkosten / variable Ausgaben / Rücklagen → automatische Sparrate (oder feste Sparrate)
- **Timeline**: Jahrestabelle + visuelle Lebenslinie, nominal und inflationsbereinigt
- **Lebensereignisse** mit Vorlagen (Auto, Gehalt, Wohnung, Teilzeit, Sabbatical, Kind, Crash …)
  inkl. **Opportunitätskosten** je Ereignis
- **Szenariovergleich** mit Differenz zum Basisszenario
- **Beratermodus** mit Präsentationsansicht, JSON-Export/Import und Druck-/PDF-Ansicht
- **Lokale Speicherung** (localStorage), **Demo-Daten** auf Knopfdruck

## Tech Stack

Next.js 14 (App Router) · TypeScript · React 18 · Tailwind CSS · Recharts · Vitest

## Routen

- **`/`** – Landingpage (Hero, Zielgruppen für Privatnutzer & Berater, CTAs „Kostenlos starten" / „Beta-Zugang anfragen")
- **`/app`** – die eigentliche Studio-App; am Ende ein **Feedback-Widget** (Zahlungsbereitschaft)

## Onboarding

Beim ersten Öffnen von `/app` (Flag `plan.onboarded` noch nicht gesetzt) erscheint ein
mehrstufiger **Einführungs-Assistent** (`src/components/onboarding/Onboarding.tsx`): er
erklärt die Vorteile und fragt die wichtigsten Startdaten ab (Land, Alter, Zielalter,
Vermögen, Einkommen, Sparrate, Rendite/Inflation). Zum Abschluss wird daraus eine eigene
Planung erzeugt. „Überspringen" bzw. „Demo ansehen" überspringt den Assistenten.

## Validierungsdaten (Beta-Leads & Feedback)

Beta-Anfragen und Produkt-Feedback werden in `src/lib/feedback.ts` typisiert erfasst und
lokal in `localStorage` gespeichert (`moneytimeline.leads.v1`, `moneytimeline.feedback.v1`).

Die Struktur ist **Supabase-fähig**: Sind die Umgebungsvariablen
`NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` gesetzt, werden neue
Datensätze zusätzlich per REST in die Tabellen `beta_leads` bzw. `product_feedback`
geschrieben (das passende SQL-Schema steht als Kommentar in `feedback.ts`). Ohne
Konfiguration bleibt alles rein lokal. `exportValidationData()` liefert alle Daten als JSON.

## Schnellstart

```bash
npm install
npm run dev        # http://localhost:3000
```

Weitere Befehle:

```bash
npm run build      # Produktions-Build
npm run start      # Produktionsserver
npm test           # Tests der Berechnungslogik
```

Beim ersten Start werden **Demo-Daten** geladen. Über den Button **„Demo"** in der
Kopfzeile lassen sie sich jederzeit neu laden, **„Reset"** leert alles.

## Projektstruktur

```
src/
├─ app/
│  ├─ layout.tsx          # Root-Layout + PlanProvider
│  ├─ page.tsx            # Tab-Navigation / App-Shell
│  └─ globals.css
├─ components/
│  ├─ Dashboard.tsx       # Kennzahlen, Insights, Chart
│  ├─ StartDataForm.tsx   # Startdaten
│  ├─ BudgetPlanner.tsx   # Budget → Sparrate
│  ├─ Timeline.tsx        # Tabelle + Lebenslinie
│  ├─ EventsManager.tsx   # Ereignisse + Vorlagen + Opportunitätskosten
│  ├─ ScenarioCompare.tsx # Szenariovergleich
│  ├─ AdvisorMode.tsx     # Beratermodus, JSON, Druck
│  ├─ WealthChart.tsx     # Recharts-Vermögenskurve
│  ├─ KpiCard.tsx
│  └─ ui/                 # Wiederverwendbare UI-Primitive
└─ lib/
   ├─ projectionEngine.ts # ⭐ Monatsgenaue Simulation (testbar, framework-frei)
   ├─ budget.ts           # Budget-Aggregation
   ├─ types.ts            # Datenmodell
   ├─ templates.ts        # Ereignis-Vorlagen
   ├─ seed.ts             # Demo- & Default-Daten
   ├─ insights.ts         # Hinweise / nächstes Ereignis
   ├─ format.ts           # Währungs-/Prozentformatierung
   └─ store.tsx           # localStorage-State (React Context)
```

## Berechnungslogik

Die Engine (`src/lib/projectionEngine.ts`) rechnet **monatlich**:

```
monthlyReturn    = (1 + annualReturn)    ^ (1/12) − 1
monthlyInflation = (1 + annualInflation) ^ (1/12) − 1
realValue        = nominalValue / (1 + annualInflation) ^ yearsElapsed
```

Pro Monat: Einkommen → Ausgaben/Sparrate → Ereignisse → Crash → Cashflows → Rendite.
Negative Sparraten sind möglich, werden aber als Warnung angezeigt.

Getestet mit `npm test` (Vitest, 16 Tests).
