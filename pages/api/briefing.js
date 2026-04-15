import Anthropic from "@anthropic-ai/sdk";
import { fetchAllFeeds, filterByCategory, clusterAndRankTopics } from "../../lib/rss";
import { RSS_SOURCES, CATEGORIES } from "../../lib/sources";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── AGENT 1: THEMEN-SELEKTOR ─────────────────────────────────────────────
const AGENT1_PROMPT = `Du bist ein präziser Themen-Analysator für ein tägliches Nachrichten-Briefing.

DEINE EINZIGE AUFGABE:
Analysiere die gegebenen Artikel-Titel und identifiziere die 3 Themen, über die die meisten verschiedenen Medienquellen berichten.

REGELN:
1. Zähle wie viele VERSCHIEDENE Quellen über dasselbe Thema berichten.
2. Gruppiere Artikel die dasselbe Ereignis beschreiben (auch wenn Titel leicht verschieden).
3. Wähle die 3 Themen mit den meisten verschiedenen berichtenden Quellen.
4. Gib NUR JSON zurück — kein Text davor oder danach, kein Markdown.
5. Falls weniger als 3 Themen vorhanden: gib nur die vorhandenen zurück.

AUSGABE-FORMAT (strikt JSON):
{
  "category": "Name der Kategorie",
  "top_topics": [
    {
      "rank": 1,
      "topic": "Kurze Themenbeschreibung (max. 8 Wörter)",
      "source_count": 7,
      "sources": ["Spiegel", "FAZ", "Reuters"],
      "representative_title": "Der repräsentativste Artikel-Titel",
      "lean_breakdown": { "left": 3, "right": 2, "neutral": 2 }
    }
  ]
}`;

// ─── AGENT 2: FAKTEN-EXTRAKTOR ────────────────────────────────────────────
const AGENT2_PROMPT = `Du bist ein streng objektiver Fakten-Extraktor für ein Executive Briefing.

DEINE EINZIGE AUFGABE:
Erstelle eine präzise, neutrale Faktenzusammenfassung — ausschliesslich basierend auf den gegebenen Artikeln.

ABSOLUTE REGELN:
1. NUR Fakten die in mindestens einem der gegebenen Artikel belegt sind.
2. KEINE Meinungen, KEINE Wertungen, KEINE Interpretationen.
3. KEINE Spekulationen über Folgen oder Absichten.
4. Wenn ein Fakt nur in einer Quelle erwähnt wird: kennzeichne mit [1 Quelle].
5. Zahlen und Namen nur wenn sie in den Artikeln explizit genannt werden.

VERBOTENE FORMULIERUNGEN IN DER SUMMARY:
aggressiv, Missbrauch, drohend, Wirtschaftsnationalismus, gefährlich,
verheerend, eskalierend, unverhältnismässig, ungerechtfertigt.
Stattdessen: neutral beschreiben WER macht WAS ab WANN mit welchem Effekt.

PFLICHTSTRUKTUR DER FAKTEN:
- Fakt 1: WER hat WAS entschieden/angekündigt?
- Fakt 2: WELCHE konkreten Massnahmen / Zahlen / betroffene Bereiche?
- Fakt 3: AB WANN gilt die Massnahme? (falls bekannt)
- Fakt 4: WELCHE offiziellen Reaktionen gibt es?
- Fakt 5: WELCHE Prognosen werden genannt? (als Prognose kennzeichnen, optional)

AUSGABE-FORMAT (strikt JSON):
{
  "headline": "Prägnante Schlagzeile, max. 10 Wörter, keine Wertung",
  "facts": ["Fakt 1", "Fakt 2", "Fakt 3", "Fakt 4", "Fakt 5"],
  "summary": "Alle Fakten neutral verbunden, 3-5 Sätze, KEINE Wertungen",
  "confidence": "high/medium/low",
  "confidence_reason": "Warum dieser Konfidenzwert?"
}`;

// ─── AGENT 3: PERSPEKTIVEN-ANALYST ───────────────────────────────────────
const AGENT3_PROMPT = `Du bist ein spezialisierter Medien-Perspektiven-Analyst für ein objektives Nachrichten-Briefing.

DEINE AUFGABE:
Analysiere wie linke/linksliberale und konservative Medien ein Thema einordnen.
Erstelle je 3 konkrete, inhaltlich verschiedene Absätze pro Perspektive.

QUELLEN-KLASSIFIKATION:
Links/Liberal:      Spiegel, taz, Süddeutsche Zeitung, The Guardian, Le Monde
Konservativ/Rechts: FAZ, Die Welt, Focus Online, NZZ, Daily Telegraph
Neutral/Agentur:    Reuters, BBC, dpa, Bloomberg, AP

ABSOLUTE REGELN:
1. Gib NUR wieder was tatsächlich in den gegebenen Artikeln steht.
2. Wenn eine Perspektive nicht in Artikeln vorkommt: nutze bekannte redaktionelle
   Linie des Mediums — kennzeichne mit basis_tag: "knowledge".
3. ERFINDE KEINE Zitate oder Positionen.
4. Prognosen als solche kennzeichnen: "laut [Quelle] könnten..." — NICHT als Fakt.

SYMMETRIE-REGEL (kritisch):
Beide Perspektiven müssen DASSELBE Ereignis kommentieren.
Die 3 Absätze folgen für BEIDE Seiten dieser Struktur:
- Absatz 1: Wie bewertet diese Seite die Entscheidung/das Ereignis selbst?
- Absatz 2: Welche konkreten Folgen und Aspekte betont diese Seite?
- Absatz 3: Welche konkrete Reaktion / Lösung fordert diese Seite?

AUSGABE-FORMAT (strikt JSON):
{
  "left_perspective": {
    "paragraphs": ["Absatz 1", "Absatz 2", "Absatz 3"],
    "sources_used": ["Spiegel", "Guardian"],
    "basis_tag": "article",
    "key_argument": "Kernargument in einem neutralen Satz"
  },
  "right_perspective": {
    "paragraphs": ["Absatz 1", "Absatz 2", "Absatz 3"],
    "sources_used": ["FAZ", "NZZ"],
    "basis_tag": "article",
    "key_argument": "Kernargument in einem neutralen Satz"
  },
  "divergence_score": 7,
  "divergence_note": "Worin unterscheiden sich die Perspektiven konkret?"
}`;

// ─── AGENT 4: QUALITÄTSPRÜFER ─────────────────────────────────────────────
const AGENT4_PROMPT = `Du bist ein realistischer Qualitätsprüfer für ein automatisch generiertes Nachrichten-Briefing.

SYSTEMBEDINGTE EINSCHRÄNKUNGEN — NIEMALS ALS FEHLER WERTEN:
- Keine URLs verfügbar (RSS-System)
- Keine Artikel-IDs (technisch nicht vorhanden)
- basis_tag ohne ID ist akzeptabel
- Quellennachweis = Medienname ist ausreichend
- Keine direkten Zitate (Urheberrecht)
- Asymmetrie zwischen Perspektiven ist NORMAL und ERWÜNSCHT

PRÜFKRITERIEN:
1. FAKTENTREUE: Werden Fakten erfunden? Zahlen konsistent?
2. NEUTRALE SPRACHE: Wertende Adjektive in der Summary? (aggressiv, Missbrauch, drohend etc.)
3. SYMMETRIE: Kommentieren beide Perspektiven dasselbe Ereignis?
4. MEINUNGSFREIHEIT: Schleicht sich eine eigene Wertung ein?
5. VOLLSTÄNDIGKEIT: Alle Felder vorhanden? Je 3 Absätze pro Perspektive?

APPROVED: false NUR wenn:
- Fakten eindeutig erfunden oder falsch
- Wertende Sprache in der Summary
- Eine Perspektive komplett fehlt
- Symmetrie-Problem: Seiten kommentieren verschiedene Themen

AUSGABE-FORMAT (strikt JSON):
{
  "approved": true,
  "quality_score": 8,
  "checks": {
    "faktentreue":      { "passed": true, "issues": [] },
    "neutrale_sprache": { "passed": true, "issues": [] },
    "symmetrie":        { "passed": true, "issues": [] },
    "meinungsfreiheit": { "passed": true, "issues": [] },
    "vollstaendigkeit": { "passed": true, "issues": [] }
  },
  "critical_issues": [],
  "warnings": [],
  "suggestions": [],
  "approved_for_publication": true
}`;

// ─── HELPER: JSON aus Claude-Response extrahieren ─────────────────────────
function extractJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── AGENT 1: Top-Themen identifizieren ──────────────────────────────────
async function runAgent1(articles, category) {
  const articleList = articles
    .slice(0, 60)
    .map((a, i) => `[${i + 1}] [${a.source}/${a.lean}] ${a.title}`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    system: AGENT1_PROMPT,
    messages: [{
      role: "user",
      content: `Kategorie: ${category.label} – ${category.sub}\n\nArtikel der letzten 24 Stunden:\n${articleList}`
    }]
  });

  return extractJSON(response.content[0].text);
}

// ─── AGENT 2: Fakten extrahieren ──────────────────────────────────────────
async function runAgent2(topic, articles) {
  const articleTexts = articles
    .slice(0, 8)
    .map(a => `[${a.source}/${a.lean}] ${a.title}\n${a.summary.slice(0, 400)}`)
    .join("\n\n---\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: AGENT2_PROMPT,
    messages: [{
      role: "user",
      content: `Thema: ${topic.topic}\n\nArtikel:\n${articleTexts}`
    }]
  });

  return extractJSON(response.content[0].text);
}

// ─── AGENT 3: Perspektiven analysieren ───────────────────────────────────
async function runAgent3(topic, facts, articles) {
  const leftArticles = articles
    .filter(a => a.lean === "left")
    .slice(0, 4)
    .map(a => `[${a.source}] ${a.title}\n${a.summary.slice(0, 400)}`)
    .join("\n\n");

  const rightArticles = articles
    .filter(a => a.lean === "right")
    .slice(0, 4)
    .map(a => `[${a.source}] ${a.title}\n${a.summary.slice(0, 400)}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: AGENT3_PROMPT,
    messages: [{
      role: "user",
      content: `Thema: ${topic.topic}

Faktenzusammenfassung (von Agent 2):
${facts.summary}

Artikel nach Ausrichtung:

LINKS/LIBERAL:
${leftArticles || "Keine linken Quellen für dieses Thema verfügbar."}

KONSERVATIV:
${rightArticles || "Keine konservativen Quellen für dieses Thema verfügbar."}`
    }]
  });

  return extractJSON(response.content[0].text);
}

// ─── AGENT 4: Qualität prüfen ─────────────────────────────────────────────
async function runAgent4(briefingItem) {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    system: AGENT4_PROMPT,
    messages: [{
      role: "user",
      content: JSON.stringify(briefingItem, null, 2)
    }]
  });

  return extractJSON(response.content[0].text);
}

// ─── HAUPT-PIPELINE ───────────────────────────────────────────────────────
async function runPipeline(category, allArticles) {
  // 1. Artikel nach Kategorie filtern
  const relevant = filterByCategory(allArticles, category.keywords);
  const articles = relevant.length >= 5 ? relevant : allArticles.slice(0, 40);

  // 2. Agent 1: Top 3 Themen identifizieren
  const topicsResult = await runAgent1(articles, category);
  const topics = topicsResult.top_topics || [];

  if (topics.length === 0) {
    throw new Error("Keine relevanten Themen gefunden");
  }

  // 3. Für jedes Top-Thema: Agent 2 + 3 parallel ausführen
  const newsItems = await Promise.all(
    topics.map(async (topic) => {
      // Artikel für dieses Thema finden
      const topicArticles = articles.filter(a =>
        topic.sources.includes(a.source)
      );
      const fallbackArticles = articles.slice(0, 10);
      const usedArticles = topicArticles.length >= 2 ? topicArticles : fallbackArticles;

      // Agent 2: Fakten
      const facts = await runAgent2(topic, usedArticles);

      // Agent 3: Perspektiven
      const perspectives = await runAgent3(topic, facts, usedArticles);

      // Briefing-Item zusammenbauen
      return {
        headline: facts.headline,
        summary: facts.summary,
        confidence: facts.confidence,
        source_count: topic.source_count,
        sources: topic.sources,
        left_perspective: perspectives.left_perspective,
        right_perspective: perspectives.right_perspective,
        divergence_score: perspectives.divergence_score,
        divergence_note: perspectives.divergence_note,
      };
    })
  );

  // 4. Agent 4: Qualität prüfen (parallel für alle Items)
  const qualityChecks = await Promise.all(
    newsItems.map(item => runAgent4(item))
  );

  // Items mit Qualitätsdaten anreichern
  const finalItems = newsItems.map((item, i) => ({
    ...item,
    quality: {
      approved: qualityChecks[i].approved_for_publication,
      score: qualityChecks[i].quality_score,
      warnings: qualityChecks[i].warnings || [],
    }
  }));

  // Nur approved Items zurückgeben (falls Agent 4 etwas ablehnt)
  const approvedItems = finalItems.filter(item => item.quality.approved);

  return {
    generated_at: new Date().toISOString(),
    category: `${category.label} – ${category.sub}`,
    pipeline: "4-agent-v2",
    news: approvedItems.length > 0 ? approvedItems : finalItems, // Fallback: alle
  };
}

// ─── API HANDLER ──────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { categoryId } = req.body;
  if (!categoryId) return res.status(400).json({ error: "categoryId required" });

  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return res.status(400).json({ error: "Unknown category" });

  try {
    // RSS-Feeds laden
    const allArticles = await fetchAllFeeds(RSS_SOURCES);

    // 4-Agenten-Pipeline ausführen
    const result = await runPipeline(category, allArticles);

    return res.status(200).json({ success: true, data: result, category });
  } catch (error) {
    console.error("Pipeline Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
