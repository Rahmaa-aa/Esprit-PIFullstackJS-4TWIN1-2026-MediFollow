/**
 * Maps stored medication frequency (French legacy, English canonical, Arabic, title-case EN)
 * to i18n keys under doctorPrescriptions.freq.* for display in the current locale.
 */
export function resolveFrequencyI18nKey(rawInput) {
  const raw = String(rawInput ?? "").trim();
  if (!raw) return null;

  // Arabic (stored or UI language) — check before Latin normalization
  if (/[\u0600-\u06FF]/.test(raw)) {
    if (raw.includes("ثلاث مرات") || raw.includes("ثلاثة")) return "threeTimesDaily";
    if (raw.includes("مرتان")) return "twiceDaily";
    if (raw.includes("مرة يومي") || raw.includes("مرة في اليوم")) return "onceDaily";
    if (raw.includes("كل 8") || raw.includes("8 ساعات")) return "every8h";
    if (raw.includes("أسبوعي")) return "weekly";
    if (raw.includes("عند الحاجة") || raw.includes("حسب الحاجة")) return "asNeeded";
  }

  const f = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!f) return null;
  if (f.includes("si besoin") || f.includes("as needed")) return "asNeeded";
  if (f.includes("8 heures") || f.includes("every 8 hours") || f.includes("toutes les 8")) return "every8h";
  if (f.includes("hebdomadaire") || f.includes("weekly")) return "weekly";
  if (f.includes("3 fois") || f.includes("three times daily")) return "threeTimesDaily";
  if (f.includes("2 fois") || f.includes("twice daily")) return "twiceDaily";
  if (f.includes("1 fois") || f.includes("once daily")) return "onceDaily";

  return null;
}

/**
 * @param {string|undefined} frequency - raw value from API
 * @param {(key: string) => string} t - i18next t
 * @param {string} [emptyDash='—']
 */
export function formatMedicationFrequencyDisplay(frequency, t, emptyDash = "—") {
  const raw = String(frequency ?? "").trim();
  if (!raw) return emptyDash;
  const key = resolveFrequencyI18nKey(raw);
  if (key) return t(`doctorPrescriptions.freq.${key}`);
  return raw;
}
