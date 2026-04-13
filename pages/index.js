import { useState } from "react";
import Head from "next/head";
import { CATEGORIES } from "../lib/sources";


// ─── Spinner ───────────────────────────────────────────────────────────────
function Spinner({ accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 20px" }}>
      <div style={{
        width: 36, height: 36,
        border: "3px solid rgba(255,255,255,0.06)",
        borderTop: `3px solid ${accent}`,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "monospace", letterSpacing: "0.05em" }}>
        RSS-Feeds laden & KI analysiert…
      </p>
    </div>
  );
}

// ─── Perspective Block ──────────────────────────────────────────────────────
function Perspective({ label, color, text, icon }) {
  return (
    <div style={{
      background: `${color}0f`,
      border: `1px solid ${color}30`,
      borderRadius: 8,
      padding: "10px 14px",
      marginTop: 8,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color,
        letterSpacing: "0.1em", textTransform: "uppercase",
        fontFamily: "monospace", marginBottom: 5,
        display: "flex", alignItems: "center", gap: 6
      }}>
        <span>{icon}</span> {label}
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
        {text}
      </p>
    </div>
  );
}

// ─── News Card ──────────────────────────────────────────────────────────────
function NewsCard({ item, index, accent, delay }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="animate-fadeUp"
      style={{
        animationDelay: `${delay}ms`,
        opacity: 0,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderLeft: `3px solid ${accent}`,
        borderRadius: 12,
        padding: "18px 20px",
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", gap: 14 }}>
        {/* Number badge */}
        <div style={{
          minWidth: 30, height: 30,
          background: `${accent}18`,
          border: `1px solid ${accent}30`,
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, color: accent,
          fontFamily: "monospace", flexShrink: 0,
        }}>
          {index + 1}
        </div>

        <div style={{ flex: 1 }}>
          {/* Headline */}
          <h3 style={{
            margin: "0 0 8px", fontSize: 16, fontWeight: 700,
            color: "#fff", lineHeight: 1.4,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            {item.headline}
          </h3>

          {/* Summary */}
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>
            {item.summary}
          </p>

          {/* Relevance tag */}
          {item.relevance && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6, padding: "3px 10px",
              fontSize: 11, color: "rgba(255,255,255,0.45)",
            }}>
              💼 {item.relevance}
            </div>
          )}

          {/* Sources */}
          {item.sources?.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
              {item.sources.map((s, i) => (
                <span key={i} style={{
                  fontSize: 10, color: "rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 4, padding: "2px 6px",
                }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Toggle button */}
          <button
            onClick={() => setOpen(!open)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              marginTop: 12, background: "none", border: "none",
              color: accent, fontSize: 12, fontWeight: 700,
              cursor: "pointer", padding: 0, opacity: 0.85,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.85}
          >
            {open ? "▲ Perspektiven ausblenden" : "▼ Politische Perspektiven anzeigen"}
          </button>

          {/* Perspectives */}
          {open && (
            <div style={{ marginTop: 4 }}>
              <Perspective
                label="Links / Liberal"
                icon="◀"
                color="#6ab0ff"
                text={item.left_perspective || "Keine klare Positionierung in den vorliegenden Quellen."}
              />
              <Perspective
                label="Konservativ / Rechts"
                icon="▶"
                color="#ffb347"
                text={item.right_perspective || "Keine klare Positionierung in den vorliegenden Quellen."}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Category Panel ─────────────────────────────────────────────────────────
function CategoryPanel({ cat }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
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
    <div style={{
      background: `linear-gradient(135deg, ${cat.bgColor} 0%, #06060e 100%)`,
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{
            fontSize: 10, color: cat.accentColor, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            fontFamily: "monospace", marginBottom: 4,
          }}>
            {cat.label}
          </div>
          <h2 style={{
            fontSize: 22, fontWeight: 800, color: "#fff",
            fontFamily: "'Playfair Display', Georgia, serif",
            display: "flex", alignItems: "center", gap: 10
          }}>
            <span>{cat.icon}</span> {cat.sub}
          </h2>
        </div>

        <button
          onClick={load}
          disabled={state === "loading"}
          style={{
            background: state === "loading" ? "rgba(255,255,255,0.04)" : `${cat.accentColor}18`,
            border: `1px solid ${state === "loading" ? "rgba(255,255,255,0.08)" : cat.accentColor + "40"}`,
            color: state === "loading" ? "rgba(255,255,255,0.25)" : cat.accentColor,
            borderRadius: 10, padding: "10px 20px",
            fontSize: 13, fontWeight: 700,
            cursor: state === "loading" ? "not-allowed" : "pointer",
            transition: "all 0.2s", whiteSpace: "nowrap",
          }}
        >
          {state === "loading" ? "Analysiere…" : state === "done" ? "↻ Aktualisieren" : "▶ Briefing laden"}
        </button>
      </div>

      {/* States */}
      {state === "loading" && <Spinner accent={cat.accentColor} />}

      {state === "error" && (
        <div style={{
          background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,60,60,0.2)",
          borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#ff8080",
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {state === "done" && data && (
        <div>
          <div style={{
            fontSize: 11, color: "rgba(255,255,255,0.25)",
            fontFamily: "monospace", marginBottom: 16,
          }}>
            Stand: {new Date(data.generated_at).toLocaleString("de-DE")} · Top 3 Nachrichten aus Live-Feeds
          </div>
          {data.news.map((item, i) => (
            <NewsCard key={i} item={item} index={i} accent={cat.accentColor} delay={i * 100} />
          ))}
        </div>
      )}

      {state === "idle" && (
        <div style={{ textAlign: "center", padding: "28px 0", color: "rgba(255,255,255,0.18)", fontSize: 13 }}>
          Klicke auf „Briefing laden" um aktuelle Nachrichten zu analysieren
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Home() {
  const today = new Date().toLocaleDateString("de-DE", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  const [loadingAll, setLoadingAll] = useState(false);
  const [triggerAll, setTriggerAll] = useState(0);

  return (
    <>
      <Head>
        <title>Daily Intelligence – Objektives News-Briefing</title>
        <meta name="description" content="KI-gestütztes tägliches Nachrichten-Briefing für Führungskräfte" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📰</text></svg>" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#06060e" }}>
        {/* ── Hero Header ── */}
        <header style={{
          position: "relative", overflow: "hidden",
          background: "linear-gradient(180deg, #0c0c1e 0%, #06060e 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "48px 24px 40px",
          textAlign: "center",
        }}>
          {/* Glow */}
          <div style={{
            position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
            width: 700, height: 300, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(74,158,237,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Eyebrow */}
          <div style={{
            fontSize: 10, color: "#4a9eed", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            fontFamily: "monospace", marginBottom: 16,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span style={{ width: 24, height: 1, background: "#4a9eed", display: "inline-block" }} />
            KI-GESTÜTZTES NACHRICHTEN-BRIEFING
            <span style={{ width: 24, height: 1, background: "#4a9eed", display: "inline-block" }} />
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "clamp(36px, 7vw, 64px)",
            fontWeight: 900, color: "#fff", margin: "0 0 8px",
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "-0.02em", lineHeight: 1.1,
          }}>
            Daily Intelligence
          </h1>

          {/* Date */}
          <p style={{
            color: "rgba(255,255,255,0.35)", fontSize: 13,
            fontFamily: "monospace", letterSpacing: "0.05em",
            margin: "0 0 24px",
          }}>
            {today}
          </p>

          {/* Subtitle */}
          <p style={{
            color: "rgba(255,255,255,0.45)", fontSize: 14,
            maxWidth: 500, margin: "0 auto 32px",
            lineHeight: 1.7,
          }}>
            Echte Nachrichten aus 10+ Quellen · Objektive Fakten · Links & Konservativ im Vergleich
          </p>

          {/* CTA */}
          <button
            onClick={() => setTriggerAll(t => t + 1)}
            style={{
              background: "linear-gradient(135deg, #4a9eed, #2563b0)",
              border: "none", borderRadius: 12,
              padding: "14px 36px", color: "#fff",
              fontSize: 14, fontWeight: 700,
              boxShadow: "0 4px 32px rgba(74,158,237,0.25)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(74,158,237,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 32px rgba(74,158,237,0.25)"; }}
          >
            ⚡ Vollständiges Briefing generieren
          </button>
        </header>

        {/* ── Content ── */}
        <main style={{ maxWidth: 820, margin: "0 auto", padding: "40px 16px 80px" }}>

          {/* Section: Politik & Wirtschaft */}
          <SectionLabel text="Politik & Wirtschaft" />
          {CATEGORIES.slice(0, 2).map(cat => (
            <CategoryPanel key={cat.id} cat={cat} triggerAll={triggerAll} />
          ))}

          {/* Section: Börsennachrichten */}
          <SectionLabel text="Börsennachrichten" style={{ marginTop: 8 }} />
          {CATEGORIES.slice(2).map(cat => (
            <CategoryPanel key={cat.id} cat={cat} triggerAll={triggerAll} />
          ))}

          {/* Footer note */}
          <div style={{
            marginTop: 48, padding: "20px 24px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 12, fontSize: 12,
            color: "rgba(255,255,255,0.25)", lineHeight: 1.8,
          }}>
            <strong style={{ color: "rgba(255,255,255,0.4)" }}>Quellen:</strong>{" "}
            Spiegel Online, Süddeutsche Zeitung, taz, FAZ, Die Welt, Focus, Reuters, BBC, Handelsblatt, NZZ, Guardian, Bloomberg · 
            Alle Perspektiven basieren auf tatsächlichen Artikeln der jeweiligen Quellen. 
            Die KI fasst zusammen — sie erfindet keine Meinungen.
          </div>
        </main>
      </div>
    </>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{
      fontSize: 10, color: "rgba(255,255,255,0.2)",
      fontWeight: 700, letterSpacing: "0.15em",
      textTransform: "uppercase", fontFamily: "monospace",
      marginBottom: 14, paddingLeft: 4,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
      {text}
      <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}
