/** Identifiants stables (DailyCheckIn) — libellés via i18n `dailyCheckIn.symptoms.<id>` */
export const SYMPTOM_IDS = [
  "fatigue",
  "headache",
  "dizziness",
  "nausea",
  "shortBreath",
  "chestPain",
  "swellingLegs",
  "fever",
  "lossAppetite",
  "insomnia",
  "palpitations",
  "cough",
];

/** Anciennes entrées possibles (avant passage aux ids) — affichage rétrocompatible */
const LEGACY_EN_TO_ID = {
  Fatigue: "fatigue",
  Headache: "headache",
  Dizziness: "dizziness",
  Nausea: "nausea",
  "Shortness of breath": "shortBreath",
  "Chest pain": "chestPain",
  "Swelling (legs/ankles)": "swellingLegs",
  Fever: "fever",
  "Loss of appetite": "lossAppetite",
  Insomnia: "insomnia",
  Palpitations: "palpitations",
  Cough: "cough",
};

/**
 * @param {string} raw
 * @param {import("i18next").TFunction} t
 */
export function translateSymptom(raw, t) {
  if (raw == null || raw === "") return "";
  const s = String(raw).trim();
  const id = SYMPTOM_IDS.includes(s) ? s : LEGACY_EN_TO_ID[s];
  if (id) return t(`dailyCheckIn.symptoms.${id}`);
  return s;
}
