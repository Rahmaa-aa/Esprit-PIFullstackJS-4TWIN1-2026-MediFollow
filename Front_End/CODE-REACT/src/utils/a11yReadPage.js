/**
 * Texte lisible pour la synthèse vocale : zone principale (#page_layout) sans navigation latérale.
 */
export function getA11yReadablePageText() {
  if (typeof document === "undefined") return "";
  const el = document.getElementById("page_layout");
  if (!el) return "";
  const clone = el.cloneNode(true);
  clone.querySelectorAll?.("script, style, noscript, svg, canvas, [aria-hidden='true']").forEach((n) => n.remove());
  let text = clone.innerText || "";
  text = text.replace(/\s+/g, " ").trim();
  if (text.length > 15000) {
    return `${text.slice(0, 15000)}…`;
  }
  return text;
}
