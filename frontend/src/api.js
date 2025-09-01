// frontend/src/api.js
const BASE =
  (import.meta.env?.VITE_API_URL || "").replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

export const API = {
  async list() {
    const r = await fetch(`${BASE}/api/feedback`, {
      headers: { Accept: "application/json" },
    });
    if (!r.ok) throw new Error(`Load failed (${r.status})`);
    return await r.json();
  },

  async create({ name, message }) {
    const r = await fetch(`${BASE}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message }),
    });
    if (!r.ok) {
      let txt = "";
      try { txt = await r.text(); } catch {}
      throw new Error(txt || `Submit failed (${r.status})`);
    }
    return await r.json();
  },
};