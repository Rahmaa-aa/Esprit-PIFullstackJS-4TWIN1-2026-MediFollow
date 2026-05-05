/**
 * Liste indicative de DCI / dénominations usuelles (France), groupées par famille thérapeutique.
 * À enrichir ou remplacer par une API officielle si besoin.
 */
export const MEDICATIONS_BY_FAMILY = [
  {
    family: "Antalgiques / antipyrétiques",
    drugs: ["Paracétamol", "Codéine", "Tramadol", "Morphine", "Oxycodone", "Fentanyl"],
  },
  {
    family: "Anti-inflammatoires non stéroïdiens (AINS)",
    drugs: ["Ibuprofène", "Kétoprofène", "Diclofénac", "Naproxène", "Méloxicam", "Célécoxib", "Acide acétylsalicylique"],
  },
  {
    family: "Cardiovasculaire — antihypertenseurs / diurétiques",
    drugs: [
      "Amlodipine",
      "Lercanidipine",
      "Ramipril",
      "Périndopril",
      "Énalapril",
      "Lisinopril",
      "Candésartan",
      "Losartan",
      "Valsartan",
      "Olmesartan",
      "Bisoprolol",
      "Métoprolol",
      "Aténolol",
      "Propranolol",
      "Carvédilol",
      "Nébivolol",
      "Furosémide",
      "Hydrochlorothiazide",
      "Indapamide",
      "Spironolactone",
      "Doxazosine",
    ],
  },
  {
    family: "Cardiovasculaire — anticoagulants / antiagrégants",
    drugs: [
      "Warfarine",
      "Rivaroxaban",
      "Apixaban",
      "Dabigatran",
      "Édouxaban",
      "Clopidogrel",
      "Prasugrel",
      "Ticagrelor",
      "Acide acétylsalicylique",
    ],
  },
  {
    family: "Cardiovasculaire — autres",
    drugs: ["Atorvastatine", "Rosuvastatine", "Simvastatine", "Pravastatine", "Ézétimibe", "Ivabradine", "Digoxine"],
  },
  {
    family: "Diabète",
    drugs: [
      "Métformine",
      "Gliclazide",
      "Glimepiride",
      "Sitagliptine",
      "Linagliptine",
      "Empagliflozine",
      "Dapagliflozine",
      "Canagliflozine",
      "Insuline glargine",
      "Insuline détemir",
      "Insuline lispro",
      "Insuline asparte",
      "Insuline humaine",
      "Liraglutide",
      "Dulaglutide",
      "Sémaglutide",
    ],
  },
  {
    family: "Gastro-entérologie",
    drugs: [
      "Oméprazole",
      "Ésoméprazole",
      "Pantoprazole",
      "Lansoprazole",
      "Famotidine",
      "Dompéridone",
      "Métoclopramide",
      "Mésalazine",
      "Lactulose",
      "Macrogol",
    ],
  },
  {
    family: "Infectiologie — antibiotiques (exemples)",
    drugs: [
      "Amoxicilline",
      "Amoxicilline / acide clavulanique",
      "Azithromycine",
      "Clarithromycine",
      "Ciprofloxacine",
      "Lévofloxacine",
      "Doxycycline",
      "Céfalexine",
      "Céfotaxime",
      "Ceftriaxone",
      "Gentamicine",
      "Vancomycine",
      "Métronidazole",
      "Triméthoprime / sulfaméthoxazole",
      "Nitrofurantoïne",
      "Fusidique acide",
    ],
  },
  {
    family: "Psychiatrie / neurologie",
    drugs: [
      "Sertraline",
      "Escitalopram",
      "Citalopram",
      "Fluoxétine",
      "Paroxétine",
      "Venlafaxine",
      "Duloxétine",
      "Mirtazapine",
      "Aripiprazole",
      "Olanzapine",
      "Quétiapine",
      "Rispéridone",
      "Halopéridol",
      "Lorazépam",
      "Diazépam",
      "Clonazépam",
      "Alprazolam",
      "Zolpidem",
      "Lévétiracétam",
      "Valproate de sodium",
      "Carbamazépine",
      "Lamotrigine",
      "Gabapentine",
      "Prégabaline",
    ],
  },
  {
    family: "Respiratoire",
    drugs: [
      "Salbutamol",
      "Formotérol",
      "Salmétérol",
      "Budésonide",
      "Béclométasone",
      "Fluticasone",
      "Montélukast",
      "Théophylline",
      "Tiotropium",
    ],
  },
  {
    family: "Thyroïde / hormones",
    drugs: ["Lévothyroxine", "Liothyronine", "Prednisone", "Prednisolone", "Hydrocortisone", "Dexaméthasone"],
  },
  {
    family: "Gynécologie / contraception",
    drugs: [
      "Éthinylestradiol / lévonorgestrel",
      "Éthinylestradiol / désogestrel",
      "Acide folique",
      "Fer",
    ],
  },
  {
    family: "Dermatologie",
    drugs: ["Isotrétinoïne", "Méthotrexate", "Cortisol topique", "Fucidine", "Mupirocine"],
  },
  {
    family: "Allergie / rhinite",
    drugs: ["Cétirizine", "Lévocétirizine", "Loratadine", "Désloratadine", "Fexofénadine", "Méquitazine"],
  },
  {
    family: "Urologie / prostate",
    drugs: ["Tamsulosine", "Alfuzosine", "Finastéride", "Dutastéride", "Tadalafil", "Sildénafil"],
  },
  {
    family: "Rhumatologie / immunologie",
    drugs: ["Méthotrexate", "Sulfasalazine", "Léflunomide", "Adalimumab", "Infliximab", "Étanercept"],
  },
  {
    family: "Ophtalmologie (exemples)",
    drugs: ["Timolol", "Latanoprost", "Dorzolamide", "Cyclopentolate"],
  },
];

let _flatCache = null;

/** Liste plate avec famille pour filtrage (mis en cache). */
export function getAllMedicationsFlat() {
  if (_flatCache) return _flatCache;
  const out = [];
  for (const { family, drugs } of MEDICATIONS_BY_FAMILY) {
    for (const name of drugs) {
      out.push({ family, name });
    }
  }
  _flatCache = out;
  return _flatCache;
}
