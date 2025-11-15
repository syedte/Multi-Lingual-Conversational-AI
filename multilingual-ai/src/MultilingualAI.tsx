import React, { useEffect, useMemo, useRef, useState } from "react";

type LangCode = "en" | "hi" | "te" | "es" | "ar" | "zh-Hans" | "ja";

const VOICE_PREFS: Record<LangCode, string[]> = {
  en: ["en-US", "en-GB"],
  hi: ["hi-IN"],
  te: ["te-IN"],
  es: ["es-ES", "es-MX"],
  ar: ["ar-SA", "ar"],
  "zh-Hans": ["zh-CN", "zh"],
  ja: ["ja-JP", "ja"],
};

export default function MultilingualAI() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState<LangCode>("hi");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const playedOnceRef = useRef(false);

  useEffect(() => {
    function load() {
      const v = window.speechSynthesis?.getVoices?.() || [];
      setVoices(v);
    }
    load();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = load;
    }
  }, []);

  async function translate() {
    if (!text.trim()) return;
    setBusy(true);
    setOut("");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target: lang }),
      });
      const j = await res.json();
      setOut(j.translated || JSON.stringify(j));
    } catch {
      setOut("❌ Request failed. Check server logs.");
    } finally {
      setBusy(false);
    }
  }

  const chosenVoice = useMemo(() => {
    if (!voices.length) return undefined;
    const prefs = VOICE_PREFS[lang] || [];
    for (const pref of prefs) {
      const match = voices.find((v) =>
        v.lang?.toLowerCase().startsWith(pref.toLowerCase())
      );
      if (match) return match;
    }
    const primary = (prefs[0] || lang).split("-")[0];
    const byPrimary = voices.find((v) =>
      v.lang?.toLowerCase().startsWith(primary.toLowerCase())
    );
    if (byPrimary) return byPrimary;
    return voices.find((v) => v.lang?.toLowerCase().startsWith("en")) || voices[0];
  }, [voices, lang]);

  function speak() {
    if (!out) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(out);
    const prefLang = VOICE_PREFS[lang]?.[0] || "en-US";
    utter.lang = prefLang;
    if (chosenVoice) utter.voice = chosenVoice;
    utter.rate = 1;
    utter.pitch = 1;
    utter.onend = () => { playedOnceRef.current = true; };
    window.speechSynthesis.speak(utter);
  }

  return (
    <div className="app-shell">
      <style>{`
        .app-shell {
          min-height: 100vh;
          position: relative;
          isolation: isolate;
        }

        /* Word cloud background */
        .app-bg {
          position: fixed;
          inset: 0;
          background: #0b0c10 url(/bg-languages.jpg) center / cover fixed no-repeat;
          z-index: -2;
        }

        /* Darker overlay for stronger dimming */
        .app-film {
          position: fixed;
          inset: 0;
          background: rgba(3, 4, 6, 0.88); /* was 0.75 → now darker */
          backdrop-filter: blur(3px); /* was 2px → smoother blur */
          z-index: -1;
        }

        .app-content {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
        }

        /* Glass panel */
        .glass {
          width: 100%;
          max-width: 900px;
          background: rgba(20, 22, 26, 0.92);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.55);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          color: #eef2ff;
          padding: 28px 32px;
        }

        .title {
          margin: 0 0 18px 0;
          font-size: clamp(22px, 3vw, 36px);
          font-weight: 800;
          color: #eef2ff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.4);
        }

        .label { display:block; margin-bottom:6px; opacity:.9; }
        .area {
          width: 100%;
          background: #2b2d31;
          color: #eef2ff;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 10px;
          padding: 12px;
        }

        .row { display:flex; gap:8px; align-items:center; margin-top:12px; flex-wrap:wrap; }

        .select, .btn {
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: #1f2126;
          color: #f3f5ff;
          padding: 8px 12px;
          transition: background 0.25s ease;
        }
        .select:hover, .btn:hover {
          background: #2d3035;
        }

        .hint { margin-top:8px; font-size:13px; opacity:.8; }
      `}</style>

      <div className="app-bg" />
      <div className="app-film" />

      <div className="app-content">
        <div className="glass">
          <h1 className="title">🌐 Multilingual AI (text → translate → audio)</h1>

          <label className="label">Input</label>
          <textarea
            className="area"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something…"
          />

          <div className="row">
            <select
              className="select"
              value={lang}
              onChange={(e) => setLang(e.target.value as LangCode)}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
              <option value="es">Spanish</option>
              <option value="ar">Arabic</option>
              <option value="zh-Hans">Chinese (Simplified)</option>
              <option value="ja">Japanese</option>
            </select>

            <button className="btn" onClick={translate} disabled={busy}>
              {busy ? "Translating…" : "Translate"}
            </button>

            <button
              className="btn"
              onClick={speak}
              disabled={!out}
              title={voices.length ? "" : "Loading voices… try again in a second"}
            >
              ▶️ Play Audio
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ opacity: 0.9, marginBottom: 6 }}>✅ Translated Text</div>
            <textarea
              className="area"
              readOnly
              rows={3}
              value={out}
              placeholder="(translation will appear here)"
            />
            {!chosenVoice && out && (
              <div className="hint">
                Note: no matching TTS voice found for <code>{lang}</code>. Falling back to your system’s default voice.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}