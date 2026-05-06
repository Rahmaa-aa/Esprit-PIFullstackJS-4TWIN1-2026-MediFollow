/** YYYY-MM-DD → locale-aware short date (same logic as doctor dossier). */
export function formatYmdForLocale(ymd, localeTag) {
  const s = String(ymd ?? "").trim();
  const y = s.length >= 10 ? s.slice(0, 10) : s;
  if (!y || !/^\d{4}-\d{2}-\d{2}$/.test(y)) return s || "—";
  try {
    const loc = localeTag === "ar" ? "ar-TN" : localeTag === "fr" ? "fr-FR" : "en-US";
    return new Date(`${y}T12:00:00`).toLocaleDateString(loc, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return y;
  }
}
