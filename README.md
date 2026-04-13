# 📰 Daily Intelligence

KI-gestütztes tägliches Nachrichten-Briefing für Führungskräfte.

## Was die App macht

- Liest RSS-Feeds von 10+ Nachrichtenportalen (Spiegel, FAZ, Reuters, BBC, etc.)
- KI analysiert und fasst die Top 3 Nachrichten je Kategorie zusammen
- Zeigt Links- und Konservativ-Perspektiven getrennt an
- Kategorien: Politik & Wirtschaft (DE + International), Börsennachrichten (DE + International)

## Setup

1. Repository clonen oder als ZIP herunterladen
2. Dependencies installieren:
   ```
   npm install
   ```
3. `.env.local` Datei erstellen:
   ```
   cp .env.local.example .env.local
   ```
4. API Key eintragen in `.env.local`
5. Entwicklungsserver starten:
   ```
   npm run dev
   ```
6. App öffnen: http://localhost:3000

## Deployment auf Vercel

1. Repository auf GitHub hochladen
2. Auf vercel.com: "New Project" → GitHub Repository auswählen
3. Environment Variable hinzufügen: `ANTHROPIC_API_KEY`
4. Deploy klicken

## Quellen

**Links/Liberal:** Spiegel Online, Süddeutsche Zeitung, taz, The Guardian, Le Monde

**Konservativ:** FAZ, Die Welt, Focus Online, NZZ, Daily Telegraph

**Neutral:** Reuters, BBC News, dpa, Handelsblatt, Bloomberg
