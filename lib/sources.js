// Nachrichtenquellen nach politischer Ausrichtung

export const RSS_SOURCES = {
  left: [
    { name: "Spiegel Online", url: "https://www.spiegel.de/schlagzeilen/index.rss", country: "de" },
    { name: "Süddeutsche Zeitung", url: "https://rss.sueddeutsche.de/rss/Topthemen", country: "de" },
    { name: "taz", url: "https://taz.de/!p4608;rss/", country: "de" },
    { name: "The Guardian", url: "https://www.theguardian.com/world/rss", country: "int" },
    { name: "Le Monde", url: "https://www.lemonde.fr/rss/une.xml", country: "int" },
  ],
  right: [
    { name: "FAZ", url: "https://www.faz.net/rss/aktuell/", country: "de" },
    { name: "Die Welt", url: "https://www.welt.de/feeds/latest.rss", country: "de" },
    { name: "Focus Online", url: "https://rss.focus.de/fol/XML/rss_folnews.xml", country: "de" },
    { name: "NZZ", url: "https://www.nzz.ch/recent.rss", country: "int" },
    { name: "Daily Telegraph", url: "https://www.telegraph.co.uk/rss.xml", country: "int" },
  ],
  neutral: [
    { name: "Reuters", url: "https://feeds.reuters.com/reuters/topNews", country: "int" },
    { name: "BBC News", url: "http://feeds.bbci.co.uk/news/rss.xml", country: "int" },
    { name: "dpa", url: "https://www.dpa.com/de/feed/", country: "de" },
    { name: "Handelsblatt", url: "https://www.handelsblatt.com/contentexport/feed/schlagzeilen", country: "de" },
    { name: "Bloomberg", url: "https://feeds.bloomberg.com/markets/news.rss", country: "int" },
  ],
};

export const CATEGORIES = [
  {
    id: "politik-international",
    label: "Politik & Wirtschaft",
    sub: "International",
    icon: "🌍",
    keywords: ["international", "world", "global", "EU", "USA", "China", "Russland", "Ukraine", "NATO", "G7", "G20"],
    accentColor: "#4a9eed",
    bgColor: "#0a1628",
  },
  {
    id: "politik-deutschland",
    label: "Politik & Wirtschaft",
    sub: "Deutschland",
    icon: "🇩🇪",
    keywords: ["Deutschland", "Bundesregierung", "Bundestag", "Berlin", "SPD", "CDU", "Grüne", "FDP", "AfD", "Wirtschaft"],
    accentColor: "#e8c84a",
    bgColor: "#16140a",
  },
  {
    id: "boerse-international",
    label: "Börsennachrichten",
    sub: "International",
    icon: "📈",
    keywords: ["S&P", "Nasdaq", "Dow Jones", "Fed", "EZB", "Zinsen", "Aktien", "Märkte", "stocks", "market", "Fed", "ECB"],
    accentColor: "#3ecf8e",
    bgColor: "#071610",
  },
  {
    id: "boerse-deutschland",
    label: "Börsennachrichten",
    sub: "Deutschland",
    icon: "🏦",
    keywords: ["DAX", "MDAX", "Frankfurt", "Deutsche Bank", "SAP", "Siemens", "Volkswagen", "BMW", "Allianz", "Bayer"],
    accentColor: "#3ecf8e",
    bgColor: "#071610",
  },
];
