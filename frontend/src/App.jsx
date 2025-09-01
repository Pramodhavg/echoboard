import { useEffect, useMemo, useRef, useState } from "react";
import { API } from "./api";
import "./styles.css";

/* -------- utils -------- */
function formatTime(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
const LIMIT = { name: 50, message: 500 };

/* show only these in filters */
const SENTS = ["positive", "mixed", "negative"];

/* -------- tiny UI atoms -------- */
function Toast({ text, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">{text}</div>;
}
function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .map(s => (s[0] || "").toUpperCase())
    .slice(0, 2)
    .join("");
  return <div className="avatar">{initials || "?"}</div>;
}
function Dot({ kind }) { return <span className={`dot dot-${kind}`} aria-hidden />; }

/* Hide the chip entirely if sentiment is neutral */
function SentChip({ s }) {
  if (!s) return null;
  const k = s.toLowerCase();
  if (k === "neutral") return null; // <- hide neutral badge
  return <span className={`chip chip-${k}`}><Dot kind={k} />{s}</span>;
}

function Pill({ active, children, onClick }) {
  return (
    <button type="button" className={`pill ${active ? "active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}
function FeedbackCard({ f }) {
  return (
    <div className="card item">
      <div className="itemTop">
        <div className="topLeft">
          <Avatar name={f.name} />
          <div>
            <div className="name">{f.name}</div>
            <div className="time">{formatTime(f.created_at)}</div>
          </div>
        </div>
        <SentChip s={f.sentiment} />
      </div>
      <div className="msg">{f.message}</div>
      {f.summary && (
        <div className="summary">
          <span className="summaryKey">AI summary:</span> {f.summary}
        </div>
      )}
    </div>
  );
}

/* -------- main -------- */
export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const msgRef = useRef(null);

  async function refresh() {
    setLoading(true);
    try { setItems(await API.list()); }
    catch (e) { setError(e.message || "Failed to load"); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  // Ctrl/Cmd + Enter shortcut
  useEffect(() => {
    function onKey(e){ if((e.ctrlKey||e.metaKey) && e.key==="Enter"){ e.preventDefault(); handleSubmit(new Event("submit")); } }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [name, message, posting]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !message.trim()) return setError("Please fill in both fields.");
    if (name.length > LIMIT.name || message.length > LIMIT.message)
      return setError(`Name ≤ ${LIMIT.name}; Message ≤ ${LIMIT.message}.`);
    setPosting(true);
    try {
      const created = await API.create({ name: name.trim(), message: message.trim() });
      setName(""); setMessage("");
      setItems(prev => [created, ...prev]);
      setTimeout(refresh, 1500);
      setTimeout(refresh, 5000);
      setToast("Thanks! Feedback submitted.");
      msgRef.current?.focus();
    } catch (e) {
      setError(e.message || "Submit failed");
    } finally {
      setPosting(false);
    }
  }

  const filtered = useMemo(() => {
    let out = items;
    if (filter !== "all") {
      out = out.filter(f => (f.sentiment || "").toLowerCase() === filter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.message.toLowerCase().includes(q) ||
        (f.summary || "").toLowerCase().includes(q)
      );
    }
    return out;
  }, [items, filter, query]);

  return (
    <div className="page">
      {toast && <Toast text={toast} onDone={() => setToast("")} />}

      <div className="container">
        {/* Header */}
        <header className="hero">
        <h1 className="title">EchoBoard</h1>
        </header>


        {/* Form */}
        <div className="card formCard">
          <form className="form" onSubmit={handleSubmit}>
            <label className="label">Name</label>
            <input
              className="input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={LIMIT.name}
            />

            <label className="label">Message</label>
            <textarea
              ref={msgRef}
              className="textarea"
              placeholder="Your feedback…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={LIMIT.message}
            />

            <div className="row">
              <div className="muted small">{name.length}/{LIMIT.name} • {message.length}/{LIMIT.message}</div>
              <button className="btn" disabled={posting}>{posting ? "Submitting…" : "Submit"}</button>
            </div>

            {error && <div className="alert error">{error}</div>}
          </form>
        </div>

        {/* Filters */}
        <div className="toolRow">
          <div className="filters">
            <Pill active={filter==="all"} onClick={()=>setFilter("all")}>All</Pill>
            {SENTS.map(s => (
              <Pill key={s} active={filter===s} onClick={()=>setFilter(s)}>
                <Dot kind={s} /> {s}
              </Pill>
            ))}
          </div>
        </div>

        {/* List + search */}
        <section className="listWrap">
          <div className="sectionHeader">
            <h2 className="sectionTitle">All Feedback</h2>
            <div className="searchWrap">
              <input
                className="searchInput"
                placeholder="Search name, message, or summary…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                className="iconBtn"
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                title="Clear"
                style={{ visibility: query ? "visible" : "hidden" }}
              >
                ×
              </button>
              <span className="searchIcon" aria-hidden>🔍</span>
            </div>
          </div>

          {loading ? (
            <div className="skeletonList">
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card empty">No feedback yet.</div>
          ) : (
            <div className="list">
              {filtered.map((f) => <FeedbackCard key={f.id} f={f} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
