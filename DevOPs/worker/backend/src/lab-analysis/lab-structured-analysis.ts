/**
 * Analyse « bilan » par intervalles de référence (adulte, indicatif).
 * Ne constitue pas un diagnostic — à valider par un laboratoire / médecin.
 */

export type ComparedParameter = {
  id: string;
  labelFr: string;
  labelEn: string;
  value: number;
  unit: string;
  refMin: number | null;
  refMax: number | null;
  refLabel: string;
  status: 'normal' | 'high' | 'low';
};

export type ConditionHint = {
  id: string;
  labelFr: string;
  labelEn: string;
  detailFr: string;
  detailEn: string;
  relatedAnalytes: string[];
};

type AnalyteDef = {
  id: string;
  labelFr: string;
  labelEn: string;
  /** Alias sans accents (OCR normalisé). */
  aliases: string[];
  refMin: number | null;
  refMax: number | null;
  /** Unité canonique affichée */
  unit: string;
  /** Texte court pour la plage affichée */
  refLabel: string;
  /** Convertit (valeur brute, unité brute extraite) -> valeur canonique ; null si incohérent */
  toCanonical: (value: number, rawUnitNorm: string) => number | null;
};

function stripAccents(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');
}

function parseNum(raw: string): number | null {
  const t = raw.replace(/\s/g, '').replace(',', '.');
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

/** µmol/L créatinine : plausibles 30–300 ; mmol/L glycémie : 2–30 ; etc. */
const CATALOG: AnalyteDef[] = [
  {
    id: 'glucose',
    labelFr: 'Glycémie',
    labelEn: 'Glucose',
    aliases: ['glycemie', 'glycémie', 'glucose', 'glu', 'gly'],
    refMin: 0.7,
    refMax: 1.1,
    unit: 'g/L',
    refLabel: '0,70 – 1,10 g/L (à jeun, indicatif)',
    toCanonical: (v, u) => {
      const un = u.replace(/\s/g, '');
      if (/mmol/.test(un)) return v / 5.55;
      if (v > 3.5) return v / 5.55;
      if (/g\/?l|^gl$/.test(un) || un === '' || un === 'g') return v;
      if (v >= 0.3 && v <= 2.5) return v;
      return null;
    },
  },
  {
    id: 'hba1c',
    labelFr: 'HbA1c',
    labelEn: 'HbA1c',
    aliases: ['hba1c', 'hemoglobine glyquee', 'hg a1c', 'a1c'],
    refMin: 4.0,
    refMax: 5.7,
    unit: '%',
    refLabel: '4,0 – 5,7 % (objectifs usuels, indicatif)',
    toCanonical: (v, u) => {
      if (v < 3 || v > 20) return null;
      if (/mmol/.test(u) && v > 20) return null;
      return v;
    },
  },
  {
    id: 'creatinine',
    labelFr: 'Créatinine',
    labelEn: 'Creatinine',
    aliases: ['creatinine', 'creat', 'crea'],
    refMin: 60,
    refMax: 115,
    unit: 'µmol/L',
    refLabel: '60 – 115 µmol/L (adulte, indicatif)',
    toCanonical: (v, u) => {
      const un = u.replace(/\s/g, '');
      if (/mg/.test(un) && v < 3) return v * 88.4;
      if (v >= 30 && v <= 400) return v;
      if (v > 1 && v < 25 && /mg|l/.test(un)) return v * 88.4;
      return null;
    },
  },
  {
    id: 'urea',
    labelFr: 'Urée',
    labelEn: 'Urea',
    aliases: ['uree', 'urea', 'azotemie', 'azotémie', 'bun'],
    refMin: 0.15,
    refMax: 0.5,
    unit: 'g/L',
    refLabel: '0,15 – 0,50 g/L (indicatif)',
    toCanonical: (v, u) => {
      if (v > 2 && v < 30 && /mmol/.test(u)) return v * 0.06;
      if (v >= 0.05 && v <= 2) return v;
      return null;
    },
  },
  {
    id: 'cholesterol_total',
    labelFr: 'Cholestérol total',
    labelEn: 'Total cholesterol',
    aliases: ['cholesterol', 'cholestérol', 'cholesterol total', 'ct', 'col total'],
    refMin: null,
    refMax: 2.0,
    unit: 'g/L',
    refLabel: '< 2,0 g/L (objectif courant, indicatif)',
    toCanonical: (v, u) => {
      if (v > 15) return v / 38.67;
      if (v >= 0.5 && v <= 4) return v;
      return null;
    },
  },
  {
    id: 'ldl',
    labelFr: 'LDL',
    labelEn: 'LDL cholesterol',
    aliases: ['ldl', 'ldl-c', 'cldl', 'cholesterol ldl'],
    refMin: null,
    refMax: 1.6,
    unit: 'g/L',
    refLabel: '< 1,6 g/L (souvent visé, indicatif)',
    toCanonical: (v, u) => {
      if (v > 10) return v / 38.67;
      if (v >= 0.2 && v <= 3) return v;
      return null;
    },
  },
  {
    id: 'hdl',
    labelFr: 'HDL',
    labelEn: 'HDL cholesterol',
    aliases: ['hdl', 'hdl-c', 'cholesterol hdl'],
    refMin: 0.4,
    refMax: null,
    unit: 'g/L',
    refLabel: '> 0,40 g/L (souvent visé, indicatif)',
    toCanonical: (v, u) => {
      if (v > 8) return v / 38.67;
      if (v >= 0.15 && v <= 2.5) return v;
      return null;
    },
  },
  {
    id: 'triglycerides',
    labelFr: 'Triglycérides',
    labelEn: 'Triglycerides',
    aliases: ['triglycerides', 'triglycérides', 'tg', 'trig'],
    refMin: null,
    refMax: 1.5,
    unit: 'g/L',
    refLabel: '< 1,5 g/L (à jeun, indicatif)',
    toCanonical: (v, u) => {
      if (v > 10) return v / 88.57;
      if (v >= 0.2 && v <= 6) return v;
      return null;
    },
  },
  {
    id: 'alt',
    labelFr: 'ALAT / TGP',
    labelEn: 'ALT',
    aliases: ['alat', 'alt', 'tgp', 'gpt'],
    refMin: null,
    refMax: 45,
    unit: 'UI/L',
    refLabel: '< 45 UI/L (indicatif)',
    toCanonical: (v) => (v >= 1 && v <= 500 ? v : null),
  },
  {
    id: 'ast',
    labelFr: 'ASAT / TGO',
    labelEn: 'AST',
    aliases: ['asat', 'ast', 'tgo', 'got'],
    refMin: null,
    refMax: 45,
    unit: 'UI/L',
    refLabel: '< 45 UI/L (indicatif)',
    toCanonical: (v) => (v >= 1 && v <= 500 ? v : null),
  },
  {
    id: 'ggt',
    labelFr: 'GGT',
    labelEn: 'GGT',
    aliases: ['ggt', 'gamma gt', 'gamma-gt', 'ygt'],
    refMin: null,
    refMax: 60,
    unit: 'UI/L',
    refLabel: '< 60 UI/L (indicatif)',
    toCanonical: (v) => (v >= 1 && v <= 500 ? v : null),
  },
  {
    id: 'hemoglobin',
    labelFr: 'Hémoglobine',
    labelEn: 'Hemoglobin',
    aliases: ['hemoglobine', 'hemoglobin', 'hb', 'hgb'],
    refMin: 12,
    refMax: 17,
    unit: 'g/dL',
    refLabel: '12 – 17 g/dL (large, sexe non pris en compte)',
    toCanonical: (v, u) => {
      if (/mmol|l$/.test(u) && v < 5) return v * 1.61;
      if (v >= 5 && v <= 20) return v;
      return null;
    },
  },
  {
    id: 'wbc',
    labelFr: 'Globules blancs',
    labelEn: 'White blood cells',
    aliases: ['gb', 'leucocytes', 'leucocyte', 'wbc', 'white blood'],
    refMin: 4,
    refMax: 10,
    unit: 'G/L',
    refLabel: '4 – 10 G/L',
    toCanonical: (v) => (v >= 1 && v <= 25 ? v : null),
  },
  {
    id: 'platelets',
    labelFr: 'Plaquettes',
    labelEn: 'Platelets',
    aliases: ['plaquettes', 'plt', 'platelets'],
    refMin: 150,
    refMax: 400,
    unit: 'G/L',
    refLabel: '150 – 400 G/L',
    toCanonical: (v) => {
      if (v >= 50 && v <= 800) return v;
      if (v >= 50000 && v <= 800000) return v / 1000;
      return null;
    },
  },
  {
    id: 'tsh',
    labelFr: 'TSH',
    labelEn: 'TSH',
    aliases: ['tsh', 'thyrotrophine'],
    refMin: 0.4,
    refMax: 4.5,
    unit: 'mUI/L',
    refLabel: '0,4 – 4,5 mUI/L (indicatif)',
    toCanonical: (v) => (v >= 0.01 && v <= 50 ? v : null),
  },
];

function compareStatus(
  v: number,
  refMin: number | null,
  refMax: number | null,
): 'normal' | 'high' | 'low' {
  if (refMin != null && v < refMin) return 'low';
  if (refMax != null && v > refMax) return 'high';
  if (refMin != null && refMax != null && v >= refMin && v <= refMax) return 'normal';
  if (refMin != null && refMax == null && v >= refMin) return 'normal';
  if (refMax != null && refMin == null && v <= refMax) return 'normal';
  return 'normal';
}

function extractRawMeasurements(normText: string): { analyteId: string; rawValue: number; rawUnit: string }[] {
  const out: { analyteId: string; rawValue: number; rawUnit: string }[] = [];
  for (const a of CATALOG) {
    const escaped = a.aliases.map((x) =>
      stripAccents(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    );
    const aliasRe = escaped.join('|');
    const re = new RegExp(
      `(?:^|[^a-z0-9])(${aliasRe})(?:[^a-z0-9]{0,30})([0-9]+[.,]?[0-9]*)(?:\\s*([a-zµ/%°.]+(?:\\/[a-z]+)?))?`,
      'gi',
    );
    let m: RegExpExecArray | null;
    while ((m = re.exec(normText)) !== null) {
      const val = parseNum(m[2]);
      if (val == null) continue;
      const rawUnit = (m[3] || '').trim();
      out.push({ analyteId: a.id, rawValue: val, rawUnit });
    }
  }
  const byId = new Map<string, { analyteId: string; rawValue: number; rawUnit: string }>();
  for (const r of out) {
    if (!byId.has(r.analyteId)) byId.set(r.analyteId, r);
  }
  return [...byId.values()];
}

export function analyzeStructured(ocrText: string): {
  parameters: ComparedParameter[];
  conditionHints: ConditionHint[];
  hasNumericEvidence: boolean;
  abnormalCount: number;
  statusSuggestion: 'normal' | 'anomaly' | 'indeterminate';
  classificationConfidence: number;
} {
  const norm = stripAccents(ocrText.replace(/\r/g, '\n'));
  const raw = extractRawMeasurements(norm);
  const byCatalogId = new Map(CATALOG.map((c) => [c.id, c]));

  const parameters: ComparedParameter[] = [];
  for (const r of raw) {
    const def = byCatalogId.get(r.analyteId);
    if (!def) continue;
    const uNorm = stripAccents(r.rawUnit);
    const canon = def.toCanonical(r.rawValue, uNorm);
    if (canon == null) continue;
    const status = compareStatus(canon, def.refMin, def.refMax);
    parameters.push({
      id: def.id,
      labelFr: def.labelFr,
      labelEn: def.labelEn,
      value: Math.round(canon * 10000) / 10000,
      unit: def.unit,
      refMin: def.refMin,
      refMax: def.refMax,
      refLabel: def.refLabel,
      status,
    });
  }

  const abnormal = parameters.filter((p) => p.status !== 'normal');
  const abnormalIds = new Set(abnormal.map((p) => p.id));
  const hasNumericEvidence = parameters.length > 0;

  const conditionHints = inferConditionHints(abnormalIds, parameters);

  let statusSuggestion: 'normal' | 'anomaly' | 'indeterminate' = 'indeterminate';
  let classificationConfidence = 45;
  if (!hasNumericEvidence) {
    statusSuggestion = 'indeterminate';
    classificationConfidence = 40;
  } else if (abnormal.length === 0) {
    statusSuggestion = 'normal';
    classificationConfidence = Math.min(90, 60 + parameters.length * 5);
  } else {
    statusSuggestion = 'anomaly';
    classificationConfidence = Math.min(92, 58 + abnormal.length * 8 + parameters.length * 3);
  }

  return {
    parameters,
    conditionHints,
    hasNumericEvidence,
    abnormalCount: abnormal.length,
    statusSuggestion,
    classificationConfidence,
  };
}

function inferConditionHints(abnormalIds: Set<string>, parameters: ComparedParameter[]): ConditionHint[] {
  const hints: ConditionHint[] = [];
  const push = (h: ConditionHint) => {
    if (!hints.some((x) => x.id === h.id)) hints.push(h);
  };

  if (abnormalIds.has('glucose') || abnormalIds.has('hba1c')) {
    push({
      id: 'glycemia_diabetes_screening',
      labelFr: 'Glycémie / sucre dans le sang',
      labelEn: 'Blood glucose metabolism',
      detailFr:
        'Une glycémie et/ou une HbA1c hors cibles usuelles peut aller dans le sens d’un trouble du métabolisme du glucose (prédiabète, diabète possible). Seul un médecin peut confirmer après examen clinique et éventuellement d’autres analyses.',
      detailEn:
        'High glucose and/or HbA1c may suggest a glucose metabolism issue (prediabetes or diabetes possible). Only a clinician can confirm with further tests.',
      relatedAnalytes: ['glucose', 'hba1c'].filter((id) => abnormalIds.has(id)),
    });
  }

  if (abnormalIds.has('cholesterol_total') || abnormalIds.has('ldl') || abnormalIds.has('triglycerides')) {
    push({
      id: 'dyslipidemia',
      labelFr: 'Lipides (cholestérol / triglycérides)',
      labelEn: 'Blood lipids',
      detailFr:
        'Des taux élevés de cholestérol LDL, cholestérol total ou triglycérides orientent vers une dyslipidémie (risque cardio-vasculaire à discuter). Le traitement et les objectifs dépendent de votre profil : à voir avec votre médecin.',
      detailEn:
        'High LDL, total cholesterol, or triglycerides may indicate dyslipidemia and cardiovascular risk. Discuss targets and treatment with your doctor.',
      relatedAnalytes: ['cholesterol_total', 'ldl', 'triglycerides'].filter((id) => abnormalIds.has(id)),
    });
  }

  if (abnormalIds.has('hdl')) {
    push({
      id: 'hdl_low',
      labelFr: 'HDL bas',
      labelEn: 'Low HDL cholesterol',
      detailFr:
        'Un HDL bas est parfois associé au risque cardio-vasculaire ; il s’interprète avec le reste du bilan lipidique et le contexte clinique.',
      detailEn: 'Low HDL may relate to cardiovascular risk; interpret with the full lipid panel and clinical context.',
      relatedAnalytes: ['hdl'],
    });
  }

  if (abnormalIds.has('creatinine') || abnormalIds.has('urea')) {
    push({
      id: 'kidney_function',
      labelFr: 'Fonction rénale',
      labelEn: 'Kidney function',
      detailFr:
        'Créatinine et/ou urée anormales peuvent évoquer une altération de la fonction rénale ou un autre contexte (déshydratation, médicaments, etc.). Interprétation médicale obligatoire.',
      detailEn:
        'Abnormal creatinine and/or urea may reflect kidney function issues or other causes (dehydration, drugs, etc.). Medical interpretation required.',
      relatedAnalytes: ['creatinine', 'urea'].filter((id) => abnormalIds.has(id)),
    });
  }

  if (abnormalIds.has('alt') || abnormalIds.has('ast') || abnormalIds.has('ggt')) {
    push({
      id: 'liver_enzymes',
      labelFr: 'Foie (enzymes)',
      labelEn: 'Liver enzymes',
      detailFr:
        'Des transaminases (ALAT/ASAT) ou GGT élevées peuvent refléter une atteinte hépatique, un médicament, ou d’autres causes. À interpréter avec un professionnel.',
      detailEn:
        'Raised ALT/AST or GGT may reflect liver injury, medication effects, or other causes. Discuss with a clinician.',
      relatedAnalytes: ['alt', 'ast', 'ggt'].filter((id) => abnormalIds.has(id)),
    });
  }

  if (abnormalIds.has('hemoglobin')) {
    const h = parameters.find((p) => p.id === 'hemoglobin');
    if (h?.status === 'low') {
      push({
        id: 'anemia_possible',
        labelFr: 'Anémie possible',
        labelEn: 'Possible anemia',
        detailFr:
          'Une hémoglobine basse peut correspondre à une anémie ; les causes sont multiples (carences, pertes sanguines, maladies chroniques…). Diagnostic et traitement : médecin.',
        detailEn:
          'Low hemoglobin may indicate anemia; many possible causes. Diagnosis and treatment require a doctor.',
        relatedAnalytes: ['hemoglobin'],
      });
    }
  }

  if (abnormalIds.has('wbc')) {
    push({
      id: 'wbc_abnormal',
      labelFr: 'Globules blancs',
      labelEn: 'White blood cells',
      detailFr:
          'Un taux de leucocytes hors norme peut être lié à une infection, une inflammation, un médicament ou d’autres situations. Ne pas conclure seul : avis médical.',
      detailEn:
        'Abnormal WBC count may relate to infection, inflammation, drugs, or other causes. Do not self-diagnose.',
      relatedAnalytes: ['wbc'],
    });
  }

  if (abnormalIds.has('platelets')) {
    push({
      id: 'platelets_abnormal',
      labelFr: 'Plaquettes',
      labelEn: 'Platelets',
      detailFr:
        'Plaquettes basses ou élevées : nombreuses causes possibles. Suivi et interprétation par un professionnel de santé.',
      detailEn: 'Low or high platelets have many possible causes; follow up with a healthcare professional.',
      relatedAnalytes: ['platelets'],
    });
  }

  if (abnormalIds.has('tsh')) {
    push({
      id: 'thyroid',
      labelFr: 'Thyroïde (TSH)',
      labelEn: 'Thyroid (TSH)',
      detailFr:
        'TSH haute ou basse peut orienter vers hypo- ou hyperthyroïdie, mais le diagnostic repose sur l’avis médical et souvent d’autres dosages (T4 libre, etc.).',
      detailEn:
        'High or low TSH may suggest thyroid issues, but diagnosis needs clinical review and often more tests (e.g. free T4).',
      relatedAnalytes: ['tsh'],
    });
  }

  return hints;
}
