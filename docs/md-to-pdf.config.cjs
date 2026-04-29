/**
 * Config md-to-pdf pour le rapport d'optimisation MediFollow.
 * Usage : npx --yes md-to-pdf --config-file docs/md-to-pdf.config.cjs docs/rapport-performance-landing.md
 */
module.exports = {
  pdf_options: {
    format: "A4",
    margin: { top: "22mm", bottom: "22mm", left: "18mm", right: "18mm" },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size:8.5px; color:#666; width:100%; padding:0 18mm;
                  display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:600;">MediFollow — Rapport d'optimisation Landing</span>
        <span>Avril 2026</span>
      </div>`,
    footerTemplate: `
      <div style="font-size:8.5px; color:#666; width:100%; padding:0 18mm;
                  display:flex; justify-content:space-between; align-items:center;">
        <span>medifollow-frontend.vercel.app</span>
        <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`,
  },
  css: `
    body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-size: 10.5pt; color:#222; line-height:1.55; }
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
    img { max-width: 100%; height: auto; border: 1px solid #cfd8dc; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin: 0.4em 0; }
    a { color: #1565c0; text-decoration: none; }
    hr { border: none; border-top: 1px solid #cfd8dc; margin: 1.4em 0; }
    ul, ol { margin: 0.4em 0 0.8em 1.4em; }
    em { color:#37474f; }
    strong { color:#0d47a1; }
  `,
};
