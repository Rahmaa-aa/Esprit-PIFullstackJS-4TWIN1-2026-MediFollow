/**
 * Dosages fréquemment utilisés (référence indicative, unités internationales courantes).
 * mg pour formes solides orales, ml pour liquides, UI pour insulines, etc.
 */
export const DOSAGES_BY_CATEGORY = [
  {
    category: "Microgrammes (µg)",
    dosages: ["12.5 µg", "25 µg", "50 µg", "75 µg", "100 µg", "125 µg", "250 µg"],
  },
  {
    category: "Milligrammes (mg) — faibles / pédiatrie",
    dosages: [
      "0.25 mg",
      "0.5 mg",
      "0.75 mg",
      "1 mg",
      "1.25 mg",
      "1.5 mg",
      "2 mg",
      "2.5 mg",
      "3 mg",
      "3.75 mg",
      "4 mg",
      "5 mg",
      "6 mg",
      "6.25 mg",
      "7.5 mg",
      "8 mg",
      "10 mg",
      "12.5 mg",
      "15 mg",
      "16 mg",
      "18 mg",
      "20 mg",
    ],
  },
  {
    category: "Milligrammes (mg) — doses moyennes",
    dosages: [
      "24 mg",
      "25 mg",
      "30 mg",
      "40 mg",
      "48 mg",
      "50 mg",
      "60 mg",
      "75 mg",
      "80 mg",
      "90 mg",
      "100 mg",
      "120 mg",
      "125 mg",
      "150 mg",
      "160 mg",
      "180 mg",
      "200 mg",
      "240 mg",
      "250 mg",
      "300 mg",
      "400 mg",
      "500 mg",
      "600 mg",
      "800 mg",
      "1000 mg",
    ],
  },
  {
    category: "Grammes (g)",
    dosages: ["1 g", "1.5 g", "2 g", "3 g"],
  },
  {
    category: "Millilitres (ml) — solutions / sirops",
    dosages: ["1 ml", "2 ml", "2.5 ml", "5 ml", "10 ml", "15 ml", "20 ml", "50 ml", "100 ml", "125 ml", "200 ml"],
  },
  {
    category: "Unités internationales (UI) — insulines / héparines (exemples)",
    dosages: ["100 UI", "200 UI", "300 UI", "400 UI", "500 UI"],
  },
];

let _flatCache = null;

export function getAllDosagesFlat() {
  if (_flatCache) return _flatCache;
  const out = [];
  for (const { category, dosages } of DOSAGES_BY_CATEGORY) {
    for (const name of dosages) {
      out.push({ family: category, name });
    }
  }
  _flatCache = out;
  return _flatCache;
}
