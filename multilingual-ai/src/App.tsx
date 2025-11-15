import React, { useEffect, useState } from "react";
import MultilingualAI from "./MultilingualAI";
import Splash from "./Splash";

export default function App() {
  // Always start with splash
  const [showSplash, setShowSplash] = useState(true);

  // Auto hide after 5.6s (match your Splash default)
  useEffect(() => {
    if (!showSplash) return;
    const t = setTimeout(() => setShowSplash(false), 5600);
    return () => clearTimeout(t);
  }, [showSplash]);

  // Debug: press "S" to show splash again
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "s") setShowSplash(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  console.log("[App] showSplash =", showSplash);
  return showSplash ? (
    <Splash onDone={() => setShowSplash(false)} durationMs={5600} key="splash" />
  ) : (
    <MultilingualAI key="main" />
  );
}