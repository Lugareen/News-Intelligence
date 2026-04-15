import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; VeraxNews/1.0)",
  },
});

// Fetch a single RSS feed
async function fetchFeed(source) {
  try {
    const feed = await parser.parseURL(source.url);
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return feed.items
      .filter(item => {
        if (!item.pubDate) return true; // include if no date
        return new Date(item.pubDate).getTime() > oneDayAgo;
      })
      .slice(0, 10)
      .map((item) => ({
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

// Fetch all feeds
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

// Filter articles by category keywords
export function filterByCategory(articles, keywords) {
  return articles.filter((a) => {
    const text = `${a.title} ${a.summary}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw.toLowerCase()));
  });
}

// Extract key words from a title for topic matching
function extractKeywords(title) {
  const stopwords = new Set([
    "der", "die", "das", "ein", "eine", "und", "oder", "aber", "für", "mit",
    "von", "zu", "in", "an", "auf", "ist", "sind", "hat", "haben", "wird",
    "the", "a", "an", "and", "or", "for", "in", "on", "at", "is", "are",
    "has", "have", "will", "to", "of", "with", "as", "by"
  ]);
  return title.toLowerCase()
    .replace(/[^a-zäöüß\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w));
}

// Calculate similarity between two titles (0-1)
function titleSimilarity(title1, title2) {
  const words1 = new Set(extractKeywords(title1));
  const words2 = new Set(extractKeywords(title2));
  if (words1.size === 0 || words2.size === 0) return 0;
  const intersection = [...words1].filter(w => words2.has(w));
  return intersection.length / Math.max(words1.size, words2.size);
}

// Cluster articles by topic and rank by how many sources report on them
export function clusterAndRankTopics(articles) {
  const clusters = [];

  for (const article of articles) {
    let addedToCluster = false;

    for (const cluster of clusters) {
      const similarity = titleSimilarity(article.title, cluster.representative);
      if (similarity >= 0.25) {
        cluster.articles.push(article);
        cluster.sources.add(article.source);
        cluster.count = cluster.sources.size;
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push({
        representative: article.title,
        articles: [article],
        sources: new Set([article.source]),
        count: 1,
      });
    }
  }

  // Sort by number of unique sources reporting (most = most important)
  return clusters
    .sort((a, b) => b.count - a.count)
    .map(c => ({
      ...c,
      sources: [...c.sources],
    }));
}
