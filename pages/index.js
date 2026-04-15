import { useState } from "react";
import Head from "next/head";
import { CATEGORIES } from "../lib/sources";

function Spinner({ accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 20px" }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.06)", borderTop: `3px solid ${accent}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "monospace", letterSpacing: "0.05em" }}>RSS-Feeds laden & KI analysiert…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

function BasisTag({ type }) {
  const isArticle = type === "article";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase", padding: "2px 8px", borderRadius: 4,
      background: isArticle ? "rgba(59,91,219,0.1)" : "rgba(201,147,58,0.15)",
      color: isArticle ? "#3B5BDB" : "#8a5a1a", marginTop: 8,
    }}>
      {isArticle ? "📰 Basierend auf aktuellen Artikeln" : "🧠 Basierend auf redaktioneller Linie"}
    </span>
  );
}

function PerspectivePanel({ data, side }) {
  const isLeft = side === "left";
  return (
    <div style={{
      borderRadius: 10, padding: 20,
      background: isLeft ? "#EEF2FF" : "#FFF4E6",
      border: `1px solid ${isLeft ? "rgba(59,91,219,0.12)" : "rgba(201,147,58,0.18)"}`,
      display: "flex", flexDirection: "column", gap: 10, flex: 1,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: isLeft ? "#3B5BDB" : "#C9933A", flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: isLeft ? "#3B5BDB" : "#C9933A" }}>
          {isLeft ? "◀ Links / Liberal" : "Konservativ / Rechts ▶"}
        </span>
        {data.sources?.length > 0 && (
          <span style={{ fontSize: 10, color: "#B0B0C0", marginLeft: "auto" }}>
            {data.sources.join(" · ")}
          </span>
        )}
      </div>
      {/* Paragraphs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(data.paragraphs || [data.text]).map((p, i) => (
          <p key={i} style={{ fontSize: 13, lineHeight: 1.75, fontWeight: 300, margin: 0, color: isLeft ? "#2a3d8f" : "#7a4e1a" }}>{p}</p>
        ))}
      </div>
      <BasisTag type={data.basis_tag || "article"} />
    </div>
  );
}

function SourcesBlock({ sources }) {
  const [open, setOpen] = useState(false);
  if (!sources?.length) return null;
  const leanMap = { left: "Links / Liberal", right: "Konservativ", neutral: "Neutral / Agentur" };
  const colorMap = { left: "#3B5BDB", right: "#C9933A", neutral: "#B0B0C0" };
  const knownLean = {
    "Spiegel Online": "left", "Süddeutsche Zeitung": "left", "taz": "left",
    "The Guardian": "left", "Le Monde": "left",
    "FAZ": "right", "Die Welt": "right", "Focus Online": "right",
    "NZZ": "right", "Daily Telegraph": "right",
    "Reuters": "neutral", "BBC News": "neutral", "dpa": "neutral",
    "Handelsblatt": "neutral", "Bloomberg": "neutral",
  };
  return (
    <div style={{ borderTop: "1px solid rgba(13,27,62,0.09)", paddingTop: 12 }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "#B0B0C0", cursor: "pointer", background: "none", border: "none", padding: 0, letterSpacing: "0.06em", textTransform: "uppercase", transition: "color .2s" }}
        onMouseEnter={e => e.currentTarget.style.color = "#0D1B3E"}
        onMouseLeave={e => e.currentTarget.style.color = "#B0B0C0"}>
        <span>📎 Quellen {open ? "ausblenden" : "anzeigen"}</span>
        <span style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "none", fontSize: 9 }}>▼</span>
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }}>
          {sources.map((s, i) => {
            const lean = knownLean[s] || "neutral";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 7, background: "#FAFAF7" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: colorMap[lean], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0D1B3E" }}>{s}</div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: colorMap[lean], textTransform: "uppercase", letterSpacing: "0.06em" }}>{leanMap[lean]}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NewsCard({ item, index, accent }) {
  return (
    <div style={{ background: "#fff", padding: 40, display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.5s ease forwards", animationDelay: `${index * 120}ms`, opacity: 0 }}>
      {/* Top */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ minWidth: 32, height: 32, background: `${accent}18`, border: `1px solid ${accent}30`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: accent, fontFamily: "monospace", flexShrink: 0 }}>
          {index + 1}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9933A", marginBottom: 6 }}>
            Top Story {index + 1} {item.source_count ? `· ${item.source_count} Quellen` : ""}
          </div>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0D1B3E", lineHeight: 1.3, margin: 0 }}>{item.headline}</h3>
        </div>
      </div>

      {/* Summary */}
      <p style={{ fontSize: 14, color: "#6B6B80", lineHeight: 1.75, fontWeight: 300, margin: 0, paddingLeft: 48 }}>{item.summary}</p>

      {/* KI badge */}
      <div style={{ paddingLeft: 48 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#F0F4FF", border: "1px solid rgba(59,91,219,0.15)", borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 600, color: "#3B5BDB", letterSpacing: "0.05em" }}>
          🤖 KI-Analyse aus {item.sources?.length || "mehreren"} verifizierten Quellen
        </span>
      </div>

      {/* Perspectives side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {item.left_perspective && <PerspectivePanel data={item.left_perspective} side="left" />}
        {item.right_perspective && <PerspectivePanel data={item.right_perspective} side="right" />}
      </div>

      {/* Relevance */}
      {item.relevance && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(13,27,62,0.04)", border: "1px solid rgba(13,27,62,0.08)", borderRadius: 6, padding: "5px 12px", fontSize: 11, color: "#6B6B80" }}>
          💼 {item.relevance}
        </div>
      )}

      {/* Sources */}
      <SourcesBlock sources={item.sources} />

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#B0B0C0", borderTop: "1px solid rgba(13,27,62,0.06)", paddingTop: 10 }}>
        <span>{item.sources?.length || "mehrere"} Quellen · Heute 06:00</span>
        <span>5 Min. Lesezeit</span>
      </div>
    </div>
  );
}

function CategoryPanel({ cat }) {
  const [state, setState] = useState("idle");
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const load = async () => {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: cat.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Unbekannter Fehler");
      setData(json.data);
      setState("done");
    } catch (e) {
      setErrorMsg(e.message);
      setState("error");
    }
  };

  return (
    <div style={{ background: `linear-gradient(135deg, ${cat.bgColor} 0%, #06060e 100%)`, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 28px" }}>
        <div>
          <div style={{ fontSize: 10, color: cat.accentColor, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 4 }}>{cat.label}</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', Georgia, serif", display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
            <span>{cat.icon}</span> {cat.sub}
          </h2>
        </div>
        <button onClick={load} disabled={state === "loading"} style={{ background: state === "loading" ? "rgba(255,255,255,0.04)" : `${cat.accentColor}18`, border: `1px solid ${state === "loading" ? "rgba(255,255,255,0.08)" : cat.accentColor + "40"}`, color: state === "loading" ? "rgba(255,255,255,0.25)" : cat.accentColor, borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: state === "loading" ? "not-allowed" : "pointer", transition: "all 0.2s", whiteSpace: "nowrap", fontFamily: "inherit" }}>
          {state === "loading" ? "Analysiere…" : state === "done" ? "↻ Aktualisieren" : "▶ Briefing laden"}
        </button>
      </div>

      {state === "loading" && <div style={{ background: "#fff", padding: "0 0 8px" }}><Spinner accent={cat.accentColor} /></div>}

      {state === "error" && (
        <div style={{ background: "#fff", padding: "16px 28px" }}>
          <div style={{ background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,60,60,0.2)", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#cc3333" }}>⚠️ {errorMsg}</div>
        </div>
      )}

      {state === "done" && data && (
        <div>
          <div style={{ padding: "8px 28px 16px", fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
            Stand: {new Date(data.generated_at).toLocaleString("de-DE")} · Top 3 meistberichtete Themen der letzten 24h
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {data.news.map((item, i) => <NewsCard key={i} item={item} index={i} accent={cat.accentColor} />)}
          </div>
        </div>
      )}

      {state === "idle" && (
        <div style={{ background: "#fff", padding: "32px 28px", textAlign: "center", color: "#B0B0C0", fontSize: 13 }}>
          Klicke auf „Briefing laden" um die Top 3 Themen der letzten 24h zu analysieren
        </div>
      )}
    </div>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 14, paddingLeft: 4, display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
      {text}
      <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

export default function Home() {
  const today = new Date().toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const [triggerAll, setTriggerAll] = useState(0);

  return (
    <>
      <Head>
        <title>Verax News — Die Nachricht. Beide Seiten. Dein Urteil.</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: "#06060e", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { margin: 0; } @keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } } @media (max-width: 700px) { .perspectives-grid { grid-template-columns: 1fr !important; } }`}</style>

        {/* Header */}
        <header style={{ position: "relative", overflow: "hidden", background: "linear-gradient(180deg, #0c0c1e 0%, #06060e 100%)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "48px 24px 40px", textAlign: "center" }}>
          <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 700, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(201,147,58,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ fontSize: 10, color: "#C9933A", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ width: 24, height: 1, background: "#C9933A", display: "inline-block" }} />
            VERAX NEWS · TÄGLICHES BRIEFING
            <span style={{ width: 24, height: 1, background: "#C9933A", display: "inline-block" }} />
          </div>
          <h1 style={{ fontSize: "clamp(36px, 7vw, 60px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Die Nachricht. <em style={{ fontStyle: "italic", color: "#C9933A" }}>Beide Seiten.</em>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontFamily: "monospace", letterSpacing: "0.05em", margin: "0 0 8px" }}>{today}</p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7 }}>
            Top 3 meistberichtete Themen je Kategorie · Links & Konservativ im Vergleich · Quellen transparent
          </p>
          <button onClick={() => setTriggerAll(t => t + 1)} style={{ background: "linear-gradient(135deg, #C9933A, #a67520)", border: "none", borderRadius: 12, padding: "14px 36px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 32px rgba(201,147,58,0.25)", transition: "transform 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            ⚡ Vollständiges Briefing generieren
          </button>
        </header>

        {/* Content */}
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px 80px" }}>
          <SectionLabel text="Politik & Wirtschaft" />
          {CATEGORIES.slice(0, 2).map(cat => <CategoryPanel key={cat.id} cat={cat} triggerAll={triggerAll} />)}
          <div style={{ marginTop: 8 }}><SectionLabel text="Börsennachrichten" /></div>
          {CATEGORIES.slice(2).map(cat => <CategoryPanel key={cat.id} cat={cat} triggerAll={triggerAll} />)}

          <div style={{ marginTop: 48, padding: "20px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, fontSize: 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.8 }}>
            <strong style={{ color: "rgba(255,255,255,0.4)" }}>Methodik:</strong> Die Top 3 Themen je Kategorie werden täglich nach Medienhäufigkeit bestimmt — je mehr Quellen über ein Thema berichten, desto wichtiger. Quellen: Spiegel, SZ, taz, FAZ, Welt, Focus, Reuters, BBC, Handelsblatt, NZZ, Guardian, Bloomberg, Le Monde, Daily Telegraph.
          </div>
        </main>
      </div>
    </>
  );
}
