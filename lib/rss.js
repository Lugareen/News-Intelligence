import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; DailyIntelligence/1.0)",
  },
});

// Fetch a single RSS feed, return simplified items
async function fetchFeed(source) {
  try {
    const feed = await parser.parseURL(source.url);
    return feed.items.slice(0, 8).map((item) => ({
      title: item.title || "",
      summary: item.contentSnippet || item.content || item.description || "",
      link: item.link || "",
      pubDate: item.pubDate || "",
      source: source.name,
      lean: source.lean,
      country: source.country,
    }));
  } catch (e) {
    console.error(`Failed to fetch ${source.name}:`, e.message);
    return [];
  }
}

// Fetch all feeds for a given lean (left/right/neutral)
export async function fetchAllFeeds(sources) {
  const tagged = [
    ...sources.left.map((s) => ({ ...s, lean: "left" })),
    ...sources.right.map((s) => ({ ...s, lean: "right" })),
    ...sources.neutral.map((s) => ({ ...s, lean: "neutral" })),
  ];

  const results = await Promise.allSettled(tagged.map((s) => fetchFeed(s)));

  const articles = [];
  results.forEach((r) => {
    if (r.status === "fulfilled") articles.push(...r.value);
  });

  return articles;
}

// Filter articles relevant to a category based on keywords
export function filterByCategory(articles, keywords) {
  return articles.filter((a) => {
    const text = `${a.title} ${a.summary}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw.toLowerCase()));
  });
}
