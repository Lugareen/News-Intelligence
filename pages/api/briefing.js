import Anthropic from "@anthropic-ai/sdk";
import { fetchAllFeeds, filterByCategory } from "../../lib/rss";
import { RSS_SOURCES, CATEGORIES } from "../../lib/sources";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Du bist ein streng objektiver Nachrichtenanalyst für ein tägliches Executive Briefing.

DEINE AUFGABE:
Analysiere die bereitgestellten Nachrichtenartikel und erstelle ein strukturiertes Briefing mit den Top 3 wichtigsten Nachrichten.

STRENGE REGELN:
1. NUR Fakten aus den bereitgestellten Artikeln. KEINE Spekulationen, KEINE Erfindungen.
2. Links-Perspektive: Nur wiedergeben was linke/linksliberale Quellen (Spiegel, taz, SZ, Guardian) tatsächlich betonen.
3. Rechts-Perspektive: Nur wiedergeben was konservative Quellen (FAZ, Welt, NZZ, Telegraph) tatsächlich betonen.
4. Wenn eine Perspektive in den Artikeln nicht vorkommt: "Keine klare Positionierung in den vorliegenden Quellen."
5. Zusammenfassungen: max. 3 Sätze, sachlich, keine Wertung.

AUSGABE: Nur JSON, kein Markdown, kein Text davor oder danach.

{
  "generated_at": "ISO datetime",
  "news": [
    {
      "headline": "Max. 10 Wörter",
      "summary": "Objektive Faktenzusammenfassung, 2-3 Sätze",
      "left_perspective": "Was betonen linke Medien? Max. 2 Sätze.",
      "right_perspective": "Was betonen konservative Medien? Max. 2 Sätze.",
      "relevance": "Warum relevant für Führungskräfte? 1 Satz.",
      "sources": ["Quellenname 1", "Quellenname 2"]
    }
  ]
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { categoryId } = req.body;
  if (!categoryId) return res.status(400).json({ error: "categoryId required" });

  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return res.status(400).json({ error: "Unknown category" });

  try {
    // 1. Fetch all RSS feeds
    const allArticles = await fetchAllFeeds(RSS_SOURCES);

    // 2. Filter by category keywords
    const relevant = filterByCategory(allArticles, category.keywords);

    // 3. If not enough articles, use all articles
    const articles = relevant.length >= 3 ? relevant : allArticles.slice(0, 20);

    // 4. Format articles for Claude
    const articleText = articles
      .slice(0, 25)
      .map(
        (a, i) =>
          `[${i + 1}] QUELLE: ${a.source} (${a.lean === "left" ? "Links/Liberal" : a.lean === "right" ? "Konservativ" : "Neutral"})
TITEL: ${a.title}
INHALT: ${a.summary.slice(0, 300)}
DATUM: ${a.pubDate}
---`
      )
      .join("\n");

    const userPrompt = `Analysiere diese Artikel für die Kategorie "${category.label} – ${category.sub}" und erstelle das Briefing:

${articleText}

Heute ist: ${new Date().toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;

    // 5. Call Claude API
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json({ success: true, data: parsed, category });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
