/**
 * Convertit `rapport-performance-landing.md` en HTML stylé puis appelle Edge en mode
 * headless pour imprimer le PDF (`rapport-performance-landing.pdf`) à côté.
 *
 * Pourquoi pas md-to-pdf : il télécharge Chromium (~170 MB) au premier lancement.
 * Edge est déjà installé sur Windows, on l'utilise directement.
 *
 * Pré-requis : la dépendance `marked` doit être disponible.
 *   npm install --no-save marked
 *
 * Usage :
 *   cd <repo>
 *   node docs/build-pdf.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mdPath = resolve(__dirname, "rapport-performance-landing.md");
const htmlPath = resolve(__dirname, "rapport-performance-landing.html");
const pdfPath = resolve(__dirname, "rapport-performance-landing.pdf");

const md = readFileSync(mdPath, "utf-8");
const bodyHtml = marked.parse(md, { async: false, gfm: true });

const css = `
  @page { size: A4; margin: 22mm 18mm; }
  @page :first { margin-top: 18mm; }
  body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-size: 10.5pt; color:#222; line-height:1.55; max-width: none; margin: 0; padding: 0; }
  h1 { font-size: 22pt; color:#0d47a1; border-bottom: 3px solid #0d47a1; padding-bottom: 6px; margin-top: 0; page-break-before: avoid; }
  h2 { font-size: 15pt; color:#0d47a1; margin-top: 1.6em; border-bottom: 1px solid #cfd8dc; padding-bottom: 4px; page-break-after: avoid; }
  h3 { font-size: 12.5pt; color:#1565c0; margin-top: 1.2em; page-break-after: avoid; }
  h4 { font-size: 11pt; color:#1976d2; margin-top: 1em; page-break-after: avoid; }
  p, li { font-size: 10.5pt; }
  table { border-collapse: collapse; width: 100%; margin: 0.6em 0 1.2em; font-size: 9.5pt; page-break-inside: avoid; }
  th, td { border: 1px solid #cfd8dc; padding: 5px 8px; vertical-align: top; }
  th { background: #e3f2fd; color:#0d47a1; font-weight: 600; text-align: left; }
  tr:nth-child(even) td { background: #f5f9ff; }
  code, pre { font-family: 'Cascadia Code', 'Consolas', 'Courier New', monospace; }
  code { background: #f1f3f4; padding: 1px 5px; border-radius: 3px; font-size: 9.5pt; color:#c2185b; }
  pre { background: #263238; color: #eceff1; padding: 12px 14px; border-radius: 5px; font-size: 9pt; line-height: 1.45; overflow-x: auto; page-break-inside: avoid; }
  pre code { background: transparent; color: inherit; padding: 0; }
  blockquote { border-left: 4px solid #1976d2; background: #e3f2fd; margin: 0.6em 0; padding: 0.5em 0.8em; color:#37474f; }
  img { max-width: 100%; height: auto; border: 1px solid #cfd8dc; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin: 0.4em 0; display:block; }
  a { color: #1565c0; text-decoration: none; }
  hr { border: none; border-top: 1px solid #cfd8dc; margin: 1.4em 0; }
  ul, ol { margin: 0.4em 0 0.8em 1.4em; }
  em { color:#37474f; }
  strong { color:#0d47a1; }
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="generator" content="medifollow build-pdf.mjs" />
<title>MediFollow — Landing Optimization Report</title>
<style>${css}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

writeFileSync(htmlPath, html, "utf-8");
console.log(`HTML écrit : ${htmlPath}`);

const edgeCandidates = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
const edge = edgeCandidates.find((p) => existsSync(p));
if (!edge) {
  console.error("Edge introuvable. Imprimez manuellement docs/rapport-performance-landing.html en PDF.");
  process.exit(1);
}

const fileUrl = pathToFileURL(htmlPath).href;
console.log(`Lancement Edge headless : ${edge}`);
execFileSync(
  edge,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${pdfPath}`,
    fileUrl,
  ],
  { stdio: "inherit" },
);
console.log(`PDF généré : ${pdfPath}`);
