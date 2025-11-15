// server/server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const LIBRE_URL = (process.env.LIBRE_URL || "http://localhost:5001").replace(/\/+$/, "");
const INDIC_URL = (process.env.INDIC_URL || "").replace(/\/+$/, ""); // optional

app.get("/api/health", async (req, res) => {
  const checks = { ok: true, libre: LIBRE_URL, indic: null };
  if (INDIC_URL) {
    try {
      const r = await fetch(`${INDIC_URL}/health`);
      checks.indic = r.ok ? INDIC_URL : null;
    } catch {
      checks.indic = null;
    }
  }
  res.json(checks);
});

app.get("/api/languages", async (req, res) => {
  // Base set from Libre
  let list = [];
  try {
    const r = await fetch(`${LIBRE_URL}/languages`);
    if (r.ok) list = await r.json();
  } catch {}
  // If Indic service is available, add Telugu
  if (INDIC_URL && !list.find((x) => x.code === "te")) {
    list.push({ code: "te", name: "Telugu" });
  }
  // Sort nicely
  list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  res.json(list);
});

app.post("/api/translate", async (req, res) => {
  try {
    let { text, target } = req.body || {};
    if (!text || !target) return res.status(400).json({ error: "bad-request" });

    // 1) Telugu → try Indic first (if running)
    if (target === "te" && INDIC_URL) {
      try {
        const r = await fetch(`${INDIC_URL}/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: text, source: "en", target: "te" }),
        });
        const raw = await r.text();
        if (r.ok) {
          const j = JSON.parse(raw);
          return res.json({ translated: j.translated, provider: "indic" });
        }
        // fall through
      } catch (_) {}
    }

    // 2) Everyone else → Libre
    const r = await fetch(`${LIBRE_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ q: text, source: "auto", target, format: "text" }),
    });
    const raw = await r.text();
    if (!r.ok) return res.status(502).json({ error: "translate-failed", detail: raw.slice(0, 200) });

    const j = JSON.parse(raw);
    if (!j?.translatedText) return res.status(502).json({ error: "translate-failed" });
    return res.json({ translated: j.translatedText, provider: "libre" });

  } catch (e) {
    return res.status(500).json({ error: "translate-failed" });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on :${PORT} | libre=${LIBRE_URL} | indic=${INDIC_URL || "OFF"}`);
});