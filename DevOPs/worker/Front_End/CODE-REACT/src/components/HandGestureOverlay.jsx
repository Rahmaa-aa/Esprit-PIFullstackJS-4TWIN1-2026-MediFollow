import React, { useEffect, useState } from "react";
import { useHandGesture } from "../context/HandGestureContext";

const CURSOR_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
  <polygon points='2,2 2,20 7,15 11,22 13,21 9,14 16,14' fill='white' stroke='black' stroke-width='1.5' stroke-linejoin='round'/>
</svg>
`;

const SCROLL_ZONE = 90;

const HandGestureOverlay = () => {
  const { isActive, cursorPosition, dwellProgress } = useHandGesture();
  const [winHeight, setWinHeight] = useState(window.innerHeight);

  useEffect(() => {
    const onResize = () => setWinHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.cursor = isActive ? "none" : "";
    return () => { document.body.style.cursor = ""; };
  }, [isActive]);

  if (!isActive) return null;

  const isClicking = dwellProgress > 0;
  const keyboardOpen = !!document.querySelector("[data-vk-container]");
  const scrollUp = cursorPosition.y < SCROLL_ZONE;
  const scrollDown = !keyboardOpen && cursorPosition.y > winHeight - SCROLL_ZONE;

  // Intensité de la zone de scroll (0 → 1)
  const scrollUpDepth = scrollUp ? 1 - cursorPosition.y / SCROLL_ZONE : 0;
  const scrollDownDepth = scrollDown ? 1 - (winHeight - cursorPosition.y) / SCROLL_ZONE : 0;

  return (
    <>
      {/* Zone de scroll HAUT */}
      {scrollUp && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: SCROLL_ZONE,
            background: `rgba(13, 110, 253, ${0.08 + scrollUpDepth * 0.18})`,
            borderBottom: `2px solid rgba(13, 110, 253, ${0.3 + scrollUpDepth * 0.5})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 299990,
            transition: "background 0.1s",
          }}
        >
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            animation: "vk-bounce-up 0.6s ease-in-out infinite",
          }}>
            <i className="ri-arrow-up-double-line" style={{ fontSize: 28, color: "rgba(13, 110, 253, 0.9)" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(13, 110, 253, 0.9)", letterSpacing: "0.05em" }}>DÉFILER VERS LE HAUT</span>
          </div>
        </div>
      )}

      {/* Zone de scroll BAS */}
      {scrollDown && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: SCROLL_ZONE,
            background: `rgba(13, 110, 253, ${0.08 + scrollDownDepth * 0.18})`,
            borderTop: `2px solid rgba(13, 110, 253, ${0.3 + scrollDownDepth * 0.5})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 299990,
            transition: "background 0.1s",
          }}
        >
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            animation: "vk-bounce-down 0.6s ease-in-out infinite",
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(13, 110, 253, 0.9)", letterSpacing: "0.05em" }}>DÉFILER VERS LE BAS</span>
            <i className="ri-arrow-down-double-line" style={{ fontSize: 28, color: "rgba(13, 110, 253, 0.9)" }} />
          </div>
        </div>
      )}

      {/* Curseur flèche */}
      <div
        style={{
          position: "fixed",
          left: cursorPosition.x,
          top: cursorPosition.y,
          width: 24,
          height: 24,
          pointerEvents: "none",
          zIndex: 299999,
        }}
        dangerouslySetInnerHTML={{
          __html: isClicking
            ? `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
                <polygon points='2,2 2,20 7,15 11,22 13,21 9,14 16,14' fill='#0d6efd' stroke='white' stroke-width='1.5' stroke-linejoin='round'/>
               </svg>`
            : CURSOR_SVG,
        }}
      />

      {/* Arc de progression dwell */}
      {dwellProgress > 0 && (
        <svg
          style={{
            position: "fixed",
            left: cursorPosition.x - 14,
            top: cursorPosition.y - 14,
            pointerEvents: "none",
            zIndex: 299998,
          }}
          width={28}
          height={28}
          viewBox="0 0 28 28"
        >
          <circle cx={14} cy={14} r={12} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth={3} />
          <circle
            cx={14}
            cy={14}
            r={12}
            fill="none"
            stroke="rgba(25, 135, 84, 0.95)"
            strokeWidth={3}
            strokeDasharray={`${(dwellProgress / 100) * 75.4} 75.4`}
            strokeLinecap="round"
            transform="rotate(-90 14 14)"
          />
        </svg>
      )}

      {/* Animations CSS */}
      <style>{`
        @keyframes vk-bounce-up {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes vk-bounce-down {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
      `}</style>
    </>
  );
};

export default HandGestureOverlay;
