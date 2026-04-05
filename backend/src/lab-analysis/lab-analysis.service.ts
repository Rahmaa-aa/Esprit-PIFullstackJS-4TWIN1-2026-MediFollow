import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import {
  LabAnalysisRecord,
  LabAnalysisRecordDocument,
  LabAnalysisStatus,
} from './schemas/lab-analysis-record.schema';
import {
  analyzeStructured,
  type ComparedParameter,
  type ConditionHint,
} from './lab-structured-analysis';
import { NotificationService } from '../notification/notification.service';

export type AnomalyStrength = 'strong' | 'approximate' | 'none';

export type AnalyzeOutcome = {
  status: LabAnalysisStatus;
  classificationConfidence: number;
  ocrConfidence: number;
  method: string;
  textPreview: string;
  anomalyStrength: AnomalyStrength;
  matchedAnomalyHints: string[];
  matchedNormalHints: string[];
  parametersCompared: ComparedParameter[];
  conditionHints: ConditionHint[];
};

/** Espaces autour pour éviter les faux positifs sur des sous-chaînes. */
function padNormText(raw: string): string {
  const stripped = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');
  return ` ${stripped} `;
}

/** Formulations rassurantes : masquées avant recherche d’anomalies (évite « sans anomalie » → mot « anomalie »). */
const NORMAL_PHRASES = [
  ' sans anomalie notable ',
  ' aucune anomalie ',
  ' sans anomalie ',
  ' negatif ',
  ' negative ',
  ' dans les normes ',
  ' dans la norme ',
  ' within normal ',
  ' wnl ',
  ' no significant ',
  ' satisfactory ',
  ' unremarkable ',
  ' valeur normale ',
  ' valeurs normales ',
];

/**
 * Signaux « nets » (vocabulaire souvent lié à un résultat à interpréter avec un pro).
 * Remarque : pas de mot seul « anomalie » ici — il est en approximatif pour limiter les faux positifs OCR.
 */
const STRONG_ANOMALY_PHRASES = [
  ' pas normal ',
  ' non normal ',
  ' not normal ',
  ' positif ',
  ' positive ',
  ' tres eleve ',
  ' tres elevee ',
  ' tres bas ',
  ' tres basse ',
  ' high ',
  ' elevated ',
  ' anormal ',
  ' critique ',
  ' critical ',
  ' severe ',
  ' pathologique ',
  ' infection ',
  ' hors norme ',
  ' hors des normes ',
  ' abnormal ',
  ' panic ',
  ' ++ ',
  ' danger ',
  ' eleve ', // après « très élevé » plus longs si besoin — garder versions courtes en dernier si conflit
  ' elevee ',
];

/**
 * Signaux « approximatifs » : limites, formulations à confirmer, ou « anomalie » seule (OCR bruité).
 */
const SOFT_ANOMALY_PHRASES = [
  ' anomalie ',
  ' anomalies ',
  ' a surveiller ',
  ' a confirmer ',
  ' limite ',
  ' limite haute ',
  ' limite basse ',
  ' limite superieure ',
  ' limite inferieure ',
  ' valeur limite ',
  ' borderline ',
  ' legerement eleve ',
  ' legerement elevee ',
  ' legerement bas ',
  ' discordance ',
  ' resultat douteux ',
  ' doute ',
];

function maskPhrases(padded: string, phrases: string[]): string {
  let m = padded;
  const sorted = [...phrases].sort((a, b) => b.length - a.length);
  for (const p of sorted) {
    while (m.includes(p)) {
      m = m.split(p).join(' ');
    }
  }
  return m.replace(/\s+/g, ' ');
}

/** Détecte les expressions trouvées ; ignore les courtes si une phrase plus longue du même groupe les couvre déjà (évite « eleve » + « tres eleve »). */
function collectHits(padded: string, phrases: string[]): string[] {
  const hits: string[] = [];
  const sorted = [...phrases].sort((a, b) => b.length - a.length);
  for (const p of sorted) {
    if (!padded.includes(p)) continue;
    const label = p.trim().replace(/\s+/g, ' ');
    if (!label) continue;
    const wrappedLabel = ` ${label} `;
    const subsumedByLonger = hits.some((h) => {
      if (h.length <= label.length) return false;
      return ` ${h} `.includes(wrappedLabel);
    });
    if (subsumedByLonger) continue;
    for (let i = hits.length - 1; i >= 0; i--) {
      const h = hits[i];
      if (h.length < label.length && wrappedLabel.includes(` ${h} `)) hits.splice(i, 1);
    }
    if (!hits.includes(label)) hits.push(label);
  }
  return hits;
}

function classifyFromPaddedText(padded: string, ocrConfidence: number): AnalyzeOutcome {
  const trimmed = padded.trim();
  const trimmedLen = trimmed.length;
  const emptyOutcome = (method: string, status: LabAnalysisStatus): AnalyzeOutcome => ({
    status,
    classificationConfidence: status === 'indeterminate' ? 40 : 50,
    ocrConfidence,
    method,
    textPreview: trimmed.slice(0, 240),
    anomalyStrength: 'none',
    matchedAnomalyHints: [],
    matchedNormalHints: [],
    parametersCompared: [],
    conditionHints: [],
  });

  if (trimmedLen < 12) {
    return emptyOutcome('heuristic_short_text', 'indeterminate');
  }

  const matchedNormalHints = collectHits(padded, NORMAL_PHRASES);
  const nNormal = matchedNormalHints.length;

  const maskedForAnomaly = maskPhrases(padded, NORMAL_PHRASES);
  const strongHits = collectHits(maskedForAnomaly, STRONG_ANOMALY_PHRASES);
  const softHits = collectHits(maskedForAnomaly, SOFT_ANOMALY_PHRASES);
  const matchedAnomalyHints = [...strongHits];
  for (const s of softHits) {
    if (!matchedAnomalyHints.includes(s)) matchedAnomalyHints.push(s);
  }

  const totalA = matchedAnomalyHints.length;
  const aStrong = strongHits.length;
  const aSoft = softHits.length;

  if (totalA === 0 && nNormal === 0) {
    const lowOcr = ocrConfidence < 45;
    return {
      status: 'indeterminate',
      classificationConfidence: lowOcr ? 35 : 50,
      ocrConfidence,
      method: 'heuristic_no_signal',
      textPreview: trimmed.slice(0, 240),
      anomalyStrength: 'none',
      matchedAnomalyHints: [],
      matchedNormalHints: [],
      parametersCompared: [],
      conditionHints: [],
    };
  }

  if (nNormal > totalA) {
    const conf = Math.min(92, 55 + (nNormal - totalA) * 10 + Math.min(15, ocrConfidence / 6));
    return {
      status: 'normal',
      classificationConfidence: Math.round(conf),
      ocrConfidence,
      method: 'heuristic_keywords',
      textPreview: trimmed.slice(0, 240),
      anomalyStrength: 'none',
      matchedAnomalyHints,
      matchedNormalHints,
      parametersCompared: [],
      conditionHints: [],
    };
  }

  if (totalA > nNormal) {
    const strong = aStrong >= 1;
    const strength: AnomalyStrength = strong ? 'strong' : 'approximate';
    const base = 55 + (totalA - nNormal) * 10;
    const ocrBoost = Math.min(20, ocrConfidence / 5);
    let conf = Math.min(95, base + ocrBoost);
    if (!strong) {
      conf = Math.min(78, 45 + Math.max(aSoft, 1) * 8 + Math.min(15, ocrConfidence / 8));
    }
    return {
      status: 'anomaly',
      classificationConfidence: Math.round(conf),
      ocrConfidence,
      method: strong ? 'heuristic_keywords_strong' : 'heuristic_keywords_approx',
      textPreview: trimmed.slice(0, 240),
      anomalyStrength: strength,
      matchedAnomalyHints,
      matchedNormalHints,
      parametersCompared: [],
      conditionHints: [],
    };
  }

  return {
    status: 'indeterminate',
    classificationConfidence: 55,
    ocrConfidence,
    method: 'heuristic_tie',
    textPreview: trimmed.slice(0, 240),
    anomalyStrength: 'none',
    matchedAnomalyHints,
    matchedNormalHints,
    parametersCompared: [],
    conditionHints: [],
  };
}

function mergeKeywordAndStructured(
  text: string,
  padded: string,
  ocrConfidence: number,
): AnalyzeOutcome {
  const structured = analyzeStructured(text);
  const kw = classifyFromPaddedText(padded, ocrConfidence);
  const preview = text.replace(/\s+/g, ' ').trim().slice(0, 240);

  if (!structured.hasNumericEvidence) {
    return { ...kw, parametersCompared: [], conditionHints: [] };
  }

  const abnormalLabels = structured.parameters
    .filter((p) => p.status !== 'normal')
    .map((p) =>
      p.status === 'high' ? `${p.labelFr} élevé(e)` : `${p.labelFr} bas(se)`,
    );

  let status: LabAnalysisStatus =
    structured.abnormalCount > 0 ? 'anomaly' : 'normal';
  let method =
    structured.abnormalCount > 0 ? 'reference_intervals' : 'reference_intervals';
  let strength: AnomalyStrength = structured.abnormalCount > 0 ? 'strong' : 'none';

  if (status === 'normal' && kw.status === 'anomaly') {
    status = 'anomaly';
    method = 'reference_intervals+keywords';
    strength = kw.anomalyStrength;
  }

  const conf = Math.round(
    structured.classificationConfidence * 0.62 + Math.min(100, ocrConfidence) * 0.38,
  );

  const hintSet = new Set([...abnormalLabels, ...kw.matchedAnomalyHints]);

  return {
    status,
    classificationConfidence: Math.min(95, conf),
    ocrConfidence,
    method,
    textPreview: preview || kw.textPreview,
    anomalyStrength: strength,
    matchedAnomalyHints: [...hintSet],
    matchedNormalHints: kw.matchedNormalHints,
    parametersCompared: structured.parameters,
    conditionHints: structured.conditionHints,
  };
}

@Injectable()
export class LabAnalysisService {
  private readonly logger = new Logger(LabAnalysisService.name);
  private readonly uploadDir = join(process.cwd(), 'uploads', 'lab-analysis');

  constructor(
    @InjectModel(LabAnalysisRecord.name)
    private recordModel: Model<LabAnalysisRecordDocument>,
    private readonly notificationService: NotificationService,
  ) {}

  async analyzeImageBuffer(
    buffer: Buffer,
    mime: string,
    patientId: string,
  ): Promise<{ record: LabAnalysisRecordDocument; outcome: AnalyzeOutcome }> {
    const ext =
      mime === 'image/png' ? '.png' : mime === 'image/webp' ? '.webp' : mime === 'image/jpeg' || mime === 'image/jpg' ? '.jpg' : '.bin';
    const filename = `${randomUUID()}${ext}`;
    await writeFile(join(this.uploadDir, filename), buffer).catch((e) => {
      this.logger.warn(`Could not persist lab image: ${String(e)}`);
    });

    const mode = (process.env.LAB_ANALYSIS_MODE || 'ocr').toLowerCase();
    let ocrConfidence = 0;
    let text = '';

    if (mode === 'mock') {
      text =
        'glycemie 1.42 g/l\nhba1c 6.1 %\ncreatinine 88 umol/l\ncholesterol 2.15 g/l\nldl 1.2 g/l';
      ocrConfidence = 75;
    } else {
      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('fra+eng');
        const { data } = await worker.recognize(buffer);
        await worker.terminate();
        text = data.text || '';
        ocrConfidence = typeof data.confidence === 'number' ? data.confidence : 0;
      } catch (e) {
        this.logger.error(`OCR failed: ${String(e)}`);
        text = '';
        ocrConfidence = 0;
      }
    }

    const padded = padNormText(text);
    const outcome = mergeKeywordAndStructured(text, padded, ocrConfidence);

    const record = await this.recordModel.create({
      patientId: new Types.ObjectId(patientId),
      status: outcome.status,
      classificationConfidence: outcome.classificationConfidence,
      ocrConfidence: outcome.ocrConfidence,
      method: outcome.method,
      imageFilename: filename,
      textPreview: outcome.textPreview,
      anomalyStrength: outcome.anomalyStrength,
      matchedAnomalyHints: outcome.matchedAnomalyHints,
      matchedNormalHints: outcome.matchedNormalHints,
      structuredFinding:
        outcome.parametersCompared.length > 0
          ? {
              parameters: outcome.parametersCompared,
              conditionHints: outcome.conditionHints,
            }
          : null,
    });

    if (outcome.status === 'anomaly') {
      try {
        await this.notificationService.notifyCareTeamLabAnalysisAnomaly({
          patientId: new Types.ObjectId(patientId),
          labAnalysisRecordId: record._id as Types.ObjectId,
          classificationConfidence: outcome.classificationConfidence,
          anomalyStrength: outcome.anomalyStrength,
        });
      } catch (e) {
        this.logger.warn(`Notification équipe soignante (analyse lab) échouée: ${String(e)}`);
      }
    }

    return { record, outcome };
  }

  async listForPatient(patientId: string, limit = 20) {
    return this.recordModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .sort({ createdAt: -1 })
      .limit(Math.min(50, Math.max(1, limit)))
      .lean()
      .exec();
  }
}
