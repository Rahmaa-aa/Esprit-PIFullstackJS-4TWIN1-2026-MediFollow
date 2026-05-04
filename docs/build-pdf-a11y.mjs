/**
 * Convertit `rapport-accessibilite-wcag.md` en HTML puis génère le PDF via Edge.
 * Les images Markdown ![...](./screenshots/...) sont lues depuis le disque et
 * intégrées en data URL (base64) : ainsi elles s’affichent dans le PDF même si
 * les chemins relatifs file:// poseraient problème avec md-to-pdf ou Edge.
 *
 * Pré-requis : `marked` (même usage que build-pdf.mjs)
 *   npm install --no-save marked
 *
 * Usage :
 *   node docs/build-pdf-a11y.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mdPath = resolve(__dirname, "rapport-accessibilite-wcag.md");
const htmlPath = resolve(__dirname, "rapport-accessibilite-wcag.html");
const pdfPath = resolve(__dirname, "rapport-accessibilite-wcag.pdf");

function mimeForPath(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
}

/** Résout ./screenshots/x.png par rapport au dossier docs/ */
function resolveImgHref(href) {
  if (!href || /^https?:\/\//i.test(href) || href.startsWith("data:")) return href;
  const clean = href.split(/[?#]/)[0].trim();
  return resolve(__dirname, clean);
}

function embedImages(html) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const m = /\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i.exec(tag);
    const src = m ? (m[2] ?? m[3] ?? "") : "";
    if (!src || src.startsWith("data:") || /^https?:\/\//i.test(src)) return tag;
    const abs = resolveImgHref(src);
    if (!existsSync(abs)) {
      return `<div style="border:2px dashed #c62828;background:#ffebee;padding:12px;margin:8px 0;font-size:10pt;color:#b71c1c;">
        <strong>Missing image</strong> — save your screenshot as:<br/>
        <code style="word-break:break-all;">docs/${src.replace(/^\.\//, "")}</code><br/>
        then run <code>node docs/build-pdf-a11y.mjs</code>
      </div>`;
    }
    const buf = readFileSync(abs);
    const b64 = buf.toString("base64");
    const mime = mimeForPath(abs);
    const newSrc = `src="data:${mime};base64,${b64}"`;
    return tag.replace(/\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i, newSrc);
  });
}

const md = readFileSync(mdPath, "utf-8");
const bodyHtmlRaw = marked.parse(md, { async: false, gfm: true });
const bodyHtml = embedImages(bodyHtmlRaw);

const css = `
  @page { size: A4; margin: 22mm 18mm; }
  @page :first { margin-top: 18mm; }
  body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-size: 10.5pt; color:#222; line-height:1.55; max-width: none; margin: 0; padding: 0; }
  h1 { font-size: 22pt; color:#1b5e20; border-bottom: 3px solid #2e7d32; padding-bottom: 6px; margin-top: 0; page-break-before: avoid; }
  h2 { font-size: 15pt; color:#2e7d32; margin-top: 1.6em; border-bottom: 1px solid #c8e6c9; padding-bottom: 4px; page-break-after: avoid; }
  h3 { font-size: 12.5pt; color:#388e3c; margin-top: 1.2em; page-break-after: avoid; }
  h4 { font-size: 11pt; color:#43a047; margin-top: 1em; page-break-after: avoid; }
  p, li { font-size: 10.5pt; }
  table { border-collapse: collapse; width: 100%; margin: 0.6em 0 1.2em; font-size: 9.5pt; page-break-inside: avoid; }
  th, td { border: 1px solid #c8e6c9; padding: 5px 8px; vertical-align: top; }
  th { background: #e8f5e9; color:#1b5e20; font-weight: 600; text-align: left; }
  tr:nth-child(even) td { background: #f1f8f4; }
  code, pre { font-family: 'Cascadia Code', 'Consolas', 'Courier New', monospace; }
  code { background: #f1f8e9; padding: 1px 5px; border-radius: 3px; font-size: 9.5pt; color:#33691e; }
  pre { background: #263238; color: #eceff1; padding: 12px 14px; border-radius: 5px; font-size: 9pt; line-height: 1.45; overflow-x: auto; page-break-inside: avoid; }
  pre code { background: transparent; color: inherit; padding: 0; }
  blockquote { border-left: 4px solid #43a047; background: #e8f5e9; margin: 0.6em 0; padding: 0.5em 0.8em; color:#37474f; }
  img { max-width: 100%; height: auto; border: 1px solid #c8e6c9; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin: 0.4em 0; display:block; }
  a { color: #2e7d32; text-decoration: none; }
  hr { border: none; border-top: 1px solid #c8e6c9; margin: 1.4em 0; }
  ul, ol { margin: 0.4em 0 0.8em 1.4em; }
  em { color:#37474f; }
  strong { color:#1b5e20; }
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="generator" content="medifollow build-pdf-a11y.mjs" />
<title>MediFollow — Accessibility audit (WCAG)</title>
<style>${css}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

writeFileSync(htmlPath, html, "utf-8");
console.log(`HTML written: ${htmlPath}`);

const edgeCandidates = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
const edge = edgeCandidates.find((p) => existsSync(p));
if (!edge) {
  console.error("Edge not found. Open docs/rapport-accessibilite-wcag.html in a browser and print to PDF.");
  process.exit(1);
}

const fileUrl = pathToFileURL(htmlPath).href;
console.log(`Starting headless Edge: ${edge}`);
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
console.log(`PDF generated: ${pdfPath}`);
