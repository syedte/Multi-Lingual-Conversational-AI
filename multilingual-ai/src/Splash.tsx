import React, { useEffect, useState } from "react";

type Props = { onDone: () => void; durationMs?: number };

export default function Splash({ onDone, durationMs = 5600 }: Props) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const fadeMs = 900;
    const t1 = setTimeout(() => setFade(true), Math.max(0, durationMs - fadeMs));
    const t2 = setTimeout(onDone, durationMs);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [durationMs, onDone]);

  return (
    <>
      <style>{`
        .mlc-splash {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          background: center / cover no-repeat url(/bearcats-bg.jpg); /* from public folder */
          animation: fadeIn 0.6s ease-out both;
        }

        .mlc-splash::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7); /* darker overlay for contrast */
          backdrop-filter: blur(1px);
        }

        .mlc-splash.fade {
          animation: fadeOut 1s ease-in forwards;
        }

        .mlc-title {
          margin: 0;
          text-align: center;
          white-space: nowrap;
          font-weight: 900;
          letter-spacing: 0.04em;
          position: relative;
          z-index: 1;
          font-size: clamp(28px, 4vw, 60px);

          /* Glowing gradient text in Bearcats red */
          background: linear-gradient(180deg, #ff5555 0%, #ff0000 40%, #990000 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;

          text-shadow:
            0 0 15px rgba(255, 85, 85, 0.75),
            0 0 30px rgba(255, 0, 0, 0.55),
            0 0 60px rgba(255, 50, 50, 0.45),
            0 0 100px rgba(255, 0, 0, 0.3);

          animation: redGlow 2.5s ease-in-out infinite alternate;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes fadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(1.02); }
        }

        @keyframes redGlow {
          0% {
            text-shadow:
              0 0 8px rgba(255, 60, 60, 0.4),
              0 0 20px rgba(255, 20, 20, 0.25),
              0 0 40px rgba(255, 0, 0, 0.15);
          }
          100% {
            text-shadow:
              0 0 18px rgba(255, 90, 90, 0.9),
              0 0 40px rgba(255, 0, 0, 0.65),
              0 0 80px rgba(255, 20, 20, 0.55);
          }
        }
      `}</style>

      <div className={`mlc-splash ${fade ? "fade" : ""}`}>
        <h1 className="mlc-title">MULTI-LINGUAL CONVERSATIONAL AI</h1>
      </div>
    </>
  );
}