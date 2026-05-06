import { useId } from "react";

const svgBase = {
  display: "block",
  flexShrink: 0,
  borderRadius: 2,
  boxShadow: "0 0 0 1px rgba(0,0,0,.06)",
};

/** Royaume-Uni — SVG (évite l’affichage « GB » en lettres sous Windows). */
export function SvgFlagGb({ className = "", style, width = 20 }) {
  const clipId = useId().replace(/:/g, "");
  const h = width / 2;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 30"
      width={width}
      height={h}
      className={className}
      style={{ ...svgBase, ...style }}
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M0 0v30h60V0z" />
        </clipPath>
      </defs>
      <path fill="#012169" d="M0 0v30h60V0z" />
      <path stroke="#fff" strokeWidth="6" d="M0 0l60 30M60 0L0 30" />
      <path stroke="#C8102E" strokeWidth="4" d="M0 0l60 30M60 0L0 30" clipPath={`url(#${clipId})`} />
      <path stroke="#fff" strokeWidth="10" d="M30 0v30M0 15h60" />
      <path stroke="#C8102E" strokeWidth="6" d="M30 0v30M0 15h60" />
    </svg>
  );
}

/** France — tricolore. */
export function SvgFlagFr({ className = "", style, width = 20 }) {
  const h = (width * 2) / 3;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3 2"
      width={width}
      height={h}
      className={className}
      style={{ ...svgBase, ...style }}
      aria-hidden
    >
      <rect width="1" height="2" fill="#002395" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#ED2939" />
    </svg>
  );
}

/** Tunisie — SVG inline (léger à l’échelle 32px ; évite le PNG 960×640). */
export function SvgFlagTn({ className = "", style, width = 20 }) {
  const h = (width * 2) / 3;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 8"
      width={width}
      height={h}
      className={className}
      style={{ ...svgBase, ...style }}
      aria-hidden
    >
      <path fill="#E70013" d="M0 0h12v8H0z" />
      <circle cx="6" cy="4" r="2.35" fill="#fff" />
      <circle cx="6.42" cy="4" r="1.95" fill="#E70013" />
      <circle cx="6.78" cy="4" r="1.72" fill="#fff" />
      <path
        fill="#E70013"
        d="M6.95 3.15l.22.68h.72l-.58.42.22.68-.58-.42-.58.42.22-.68-.58-.42h.72z"
      />
    </svg>
  );
}

/** Algérie — vert #006233 / blanc, croissant et étoile #D21034 (SVG). */
export function SvgFlagDz({ className = "", style, width = 20 }) {
  const clipId = useId().replace(/:/g, "");
  const h = (width * 2) / 3;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 8"
      width={width}
      height={h}
      className={className}
      style={{ ...svgBase, ...style }}
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect width="12" height="8" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="6" height="8" fill="#006233" />
        <rect x="6" width="6" height="8" fill="#fff" />
        <path
          fill="#D21034"
          fillRule="evenodd"
          d="M 6.25 4 m -2 0 a 2 2 0 1 1 4 0 a 2 2 0 1 1 -4 0 M 6.82 4 m -1.62 0 a 1.62 1.62 0 1 0 3.24 0 a 1.62 1.62 0 1 0 -3.24 0"
        />
        <path
          fill="#D21034"
          d="M6 3.45L6.13 3.8L6.52 3.86L6.24 4.12L6.34 4.52L6 4.28L5.66 4.52L5.76 4.12L5.48 3.86L5.87 3.8Z"
        />
      </g>
    </svg>
  );
}

/** Arabe : drapeaux Tunisie + Algérie (partenariat régional). */
function FlagArTnDz({ className = "", style, width = 20 }) {
  const w = Math.max(12, Math.round(width * 0.9));
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        verticalAlign: "middle",
        ...style,
      }}
    >
      <SvgFlagTn width={w} />
      <SvgFlagDz width={w} />
    </span>
  );
}

const FLAGS = {
  en: SvgFlagGb,
  fr: SvgFlagFr,
  ar: FlagArTnDz,
};

/** `width` : largeur du drapeau en px (défaut 20). Passer ~32 sur la landing pour un menu plus lisible. */
export function LanguageFlag({ code, className = "", style, width = 20 }) {
  const C = FLAGS[code] || SvgFlagFr;
  if (code === "ar") {
    return <FlagArTnDz className={className} style={style} width={width} />;
  }
  return <C className={className} style={style} width={width} />;
}
