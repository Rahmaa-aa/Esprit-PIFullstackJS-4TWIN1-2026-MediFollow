/**
 * Config md-to-pdf pour le rapport d'accessibilité WCAG.
 * Préférez plutôt node docs/build-pdf-a11y.mjs pour intégrer les images en PDF.
 *
 * Usage :
 *   npx --yes md-to-pdf --config-file docs/md-to-pdf-a11y.config.cjs docs/rapport-accessibilite-wcag.md
 */
const path = require("path");
const docsDir = path.resolve(__dirname);

module.exports = {
  basedir: docsDir,
  pdf_options: {
    format: "A4",
    margin: { top: "22mm", bottom: "22mm", left: "18mm", right: "18mm" },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size:8.5px; color:#666; width:100%; padding:0 18mm;
                  display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:600;">MediFollow — Accessibility audit (WCAG)</span>
        <span>April 2026</span>
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
    h1 { font-size: 22pt; color:#1b5e20; border-bottom: 3px solid #2e7d32; padding-bottom: 6px; margin-top: 0; page-break-before: avoid; }
    h2 { font-size: 15pt; color:#2e7d32; margin-top: 1.6em; border-bottom: 1px solid #c8e6c9; padding-bottom: 4px; page-break-after: avoid; }
    h3 { font-size: 12.5pt; color:#388e3c; margin-top: 1.2em; page-break-after: avoid; }
    p, li { font-size: 10.5pt; }
    table { border-collapse: collapse; width: 100%; margin: 0.6em 0 1.2em; font-size: 9.5pt; page-break-inside: avoid; }
    th, td { border: 1px solid #c8e6c9; padding: 5px 8px; vertical-align: top; }
    th { background: #e8f5e9; color:#1b5e20; font-weight: 600; text-align: left; }
    img { max-width: 100%; height: auto; border: 1px solid #c8e6c9; border-radius: 4px; margin: 0.4em 0; }
    code { background: #f1f8e9; padding: 1px 5px; font-size: 9.5pt; }
    hr { border: none; border-top: 1px solid #c8e6c9; margin: 1.2em 0; }
  `,
};
