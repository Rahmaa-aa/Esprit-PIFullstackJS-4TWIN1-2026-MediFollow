import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { execFile } from 'child_process';
import { Model, Types } from 'mongoose';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { Patient } from '../patient/schemas/patient.schema';
import { BrainMriAnalysisRecord, BrainMriAnalysisRecordDocument } from './schemas/brain-mri-analysis-record.schema';

const execFileAsync = promisify(execFile);

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/bmp': '.bmp',
  'image/tiff': '.tif',
  'image/gif': '.gif',
};

/** Parse la dernière ligne JSON (TensorFlow peut écrire des warnings avant). */
function parsePythonJsonStdout(stdout: string): Record<string, unknown> {
  const s = stdout.trim();
  if (!s) {
    throw new Error('Sortie Python vide');
  }
  const lines = s
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.startsWith('{') && line.endsWith('}')) {
      try {
        return JSON.parse(line) as Record<string, unknown>;
      } catch {
        /* ligne suivante */
      }
    }
  }
  try {
    return JSON.parse(s) as Record<string, unknown>;
  } catch {
    throw new Error(`Réponse JSON invalide (début): ${s.slice(0, 400)}`);
  }
}

export interface BrainTumorPredictResult {
  prediction: number;
  probability: number;
  labelText: string;
  overlayPngBase64: string;
}

export interface BrainTumorUploadMeta {
  mimetype?: string;
  originalname?: string;
}

@Injectable()
export class BrainTumorService {
  private readonly brainMriUploadDir = path.join(process.cwd(), 'uploads', 'brain-mri');

  constructor(
    @InjectModel(BrainMriAnalysisRecord.name)
    private readonly brainMriRecordModel: Model<BrainMriAnalysisRecordDocument>,
    @InjectModel(Patient.name) private readonly patientModel: Model<Patient>,
  ) {}

  /**
   * Interpréteur Python (TensorFlow) :
   * - `BRAIN_TUMOR_PYTHON` optionnel : chemin absolu, ou relatif au dossier `brain-tumor-detection` (ex. `.venv/Scripts/python.exe`).
   * - Sinon : `brain-tumor-detection/.venv/...` (portable après clone + `pip install` dans le venv).
   * - Sinon : `python` du PATH.
   * Ne pas commiter de chemin absolu type `C:/Users/...` : laisser la variable vide pour l’équipe.
   */
  private async resolvePythonBinary(root: string): Promise<string> {
    const raw = process.env.BRAIN_TUMOR_PYTHON?.trim();
    const fromEnv = raw?.replace(/^["']|["']$/g, '') ?? '';

    const candidates: string[] = [];
    const seen = new Set<string>();

    const push = (p: string) => {
      const n = path.normalize(p);
      if (!seen.has(n)) {
        seen.add(n);
        candidates.push(n);
      }
    };

    if (fromEnv) {
      if (path.isAbsolute(fromEnv)) {
        push(fromEnv);
      } else {
        push(path.join(root, fromEnv));
        push(path.resolve(process.cwd(), fromEnv));
      }
    }

    push(path.join(root, '.venv', 'Scripts', 'python.exe'));
    push(path.join(root, '.venv', 'bin', 'python'));
    push('python');

    for (const c of candidates) {
      if (c === 'python') {
        return c;
      }
      try {
        await fs.access(c);
        return c;
      } catch {
        /* suivant */
      }
    }
    return 'python';
  }

  /** Préfère `brain_tumor_resnet.keras`, sinon ancien `.h5`. */
  private async resolveModelPath(root: string): Promise<string> {
    if (process.env.BRAIN_TUMOR_MODEL) {
      const p = path.resolve(process.env.BRAIN_TUMOR_MODEL);
      try {
        await fs.access(p);
        return p;
      } catch {
        throw new ServiceUnavailableException(`BRAIN_TUMOR_MODEL introuvable : ${p}`);
      }
    }
    const keras = path.join(root, 'brain_tumor_resnet.keras');
    const h5 = path.join(root, 'brain_tumor_resnet.h5');
    try {
      await fs.access(keras);
      return keras;
    } catch {
      /* ancien format */
    }
    try {
      await fs.access(h5);
      return h5;
    } catch {
      throw new ServiceUnavailableException(
        'Modèle introuvable (brain_tumor_resnet.keras ou .h5). Entraînez avec train_brain_tumor.py ou définissez BRAIN_TUMOR_MODEL.',
      );
    }
  }

  /** Suffixe fichier temporaire (OpenCV lit selon le contenu ; l’extension évite les soucis Windows). */
  private tempSuffix(meta?: BrainTumorUploadMeta): string {
    const orig = meta?.originalname;
    if (orig) {
      const ext = path.extname(orig).toLowerCase();
      if (ext && /^\.[a-z0-9]{1,8}$/i.test(ext)) {
        return ext;
      }
    }
    const mt = meta?.mimetype;
    if (mt && MIME_TO_EXT[mt]) {
      return MIME_TO_EXT[mt];
    }
    return '.jpg';
  }

  /** Cherche brain-tumor-detection : cwd parent (npm dans backend/) ou cwd = racine repo. */
  private async resolveBrainTumorRoot(): Promise<string> {
    if (process.env.BRAIN_TUMOR_ROOT) {
      const p = path.resolve(process.env.BRAIN_TUMOR_ROOT);
      try {
        await fs.access(path.join(p, 'brain_tumor_predict_cli.py'));
        return p;
      } catch {
        throw new ServiceUnavailableException(
          `BRAIN_TUMOR_ROOT (${p}) : brain_tumor_predict_cli.py introuvable.`,
        );
      }
    }
    const candidates = [
      path.resolve(process.cwd(), '..', 'brain-tumor-detection'),
      path.resolve(process.cwd(), 'brain-tumor-detection'),
    ];
    for (const c of candidates) {
      try {
        await fs.access(path.join(c, 'brain_tumor_predict_cli.py'));
        return c;
      } catch {
        /* essai suivant */
      }
    }
    throw new ServiceUnavailableException(
      `Script brain_tumor_predict_cli.py introuvable. Chemins testés : ${candidates.join(' ; ')}. Définissez BRAIN_TUMOR_ROOT.`,
    );
  }

  async predictFromBuffer(buffer: Buffer, meta?: BrainTumorUploadMeta): Promise<BrainTumorPredictResult> {
    const root = await this.resolveBrainTumorRoot();
    const script = path.join(root, 'brain_tumor_predict_cli.py');
    const modelPath = await this.resolveModelPath(root);

    const suffix = this.tempSuffix(meta);
    const tmp = path.join(os.tmpdir(), `mri-${Date.now()}-${Math.random().toString(36).slice(2)}${suffix}`);
    await fs.writeFile(tmp, buffer);

    const py = await this.resolvePythonBinary(root);
    const env = {
      ...process.env,
      BRAIN_TUMOR_MODEL: modelPath,
      PYTHONUTF8: '1',
      PYTHONWARNINGS: 'ignore',
      /** Réduit les logs C++ TensorFlow / oneDNN sur stderr (pas des erreurs métier). */
      TF_CPP_MIN_LOG_LEVEL: '3',
      TF_ENABLE_ONEDNN_OPTS: '0',
    };

    try {
      const { stdout, stderr } = await execFileAsync(py, [script, tmp, modelPath], {
        maxBuffer: 50 * 1024 * 1024,
        env,
        windowsHide: true,
      });
      let raw: Record<string, unknown>;
      try {
        raw = parsePythonJsonStdout(stdout);
      } catch {
        if (stderr?.trim()) {
          console.warn('[brain-tumor]', stderr);
        }
        throw new Error('Réponse Python invalide');
      }
      if (typeof raw.error === 'string') {
        if (stderr?.trim()) {
          console.warn('[brain-tumor]', stderr);
        }
        throw new BadRequestException(raw.error);
      }
      return {
        prediction: Number(raw.prediction),
        probability: Number(raw.probability),
        labelText: String(raw.labelText),
        overlayPngBase64: String(raw.overlayPngBase64),
      };
    } catch (e: unknown) {
      if (e instanceof BadRequestException) throw e;
      /** Python sort parfois en code 1 avec un JSON d’erreur sur stdout ; execFile rejette quand même. */
      const stdoutFromErr =
        typeof e === 'object' &&
        e !== null &&
        'stdout' in e &&
        Buffer.isBuffer((e as { stdout?: Buffer }).stdout)
          ? (e as { stdout: Buffer }).stdout.toString('utf8')
          : typeof e === 'object' &&
              e !== null &&
              'stdout' in e &&
              typeof (e as { stdout?: string }).stdout === 'string'
            ? (e as { stdout: string }).stdout
            : '';
      if (stdoutFromErr.trim()) {
        try {
          const rawErr = parsePythonJsonStdout(stdoutFromErr);
          if (typeof rawErr.error === 'string') {
            throw new BadRequestException(rawErr.error);
          }
        } catch (inner) {
          if (inner instanceof BadRequestException) throw inner;
        }
      }
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[brain-tumor] exec failed', msg);
      throw new BadRequestException(
        "Analyse IRM impossible (vérifiez Python, TensorFlow et l'image). Détails: " + msg,
      );
    } finally {
      await fs.unlink(tmp).catch(() => undefined);
    }
  }

  async assertDoctorAssignedToPatient(doctorId: string, patientId: string): Promise<void> {
    if (!Types.ObjectId.isValid(patientId)) {
      throw new BadRequestException('Identifiant patient invalide.');
    }
    const p = await this.patientModel.findById(patientId).select('doctorId').lean().exec();
    if (!p) throw new NotFoundException('Patient introuvable.');
    const assigned = String((p as { doctorId?: string }).doctorId || '').trim();
    const me = String(doctorId).trim();
    if (!assigned || assigned !== me) {
      throw new ForbiddenException('Ce patient n’est pas assigné à votre compte médecin.');
    }
  }

  /**
   * Enregistre le résultat + image overlay sur disque (dossier patient).
   */
  async persistAnalysis(
    patientId: string,
    result: BrainTumorPredictResult,
    opts: { source: 'doctor' | 'patient'; doctorId?: string; originalname?: string },
  ): Promise<{ id: string }> {
    if (!Types.ObjectId.isValid(patientId)) {
      throw new BadRequestException('Identifiant patient invalide.');
    }
    const pid = String(patientId);
    const rel = `${pid}/${randomUUID()}.png`;
    const abs = path.join(this.brainMriUploadDir, rel);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    try {
      await fs.writeFile(abs, Buffer.from(result.overlayPngBase64, 'base64'));
    } catch (e) {
      console.warn('[brain-tumor] overlay write failed:', e);
    }
    const doc = await this.brainMriRecordModel.create({
      patientId: new Types.ObjectId(pid),
      prediction: result.prediction,
      probability: result.probability,
      labelText: result.labelText || '',
      source: opts.source,
      createdByDoctorId: opts.doctorId ? String(opts.doctorId) : '',
      originalFilename: opts.originalname ? String(opts.originalname).slice(0, 500) : '',
      overlayRelativePath: rel,
    });
    return { id: String(doc._id) };
  }

  async listRecordsForPatient(patientId: string, limit = 30) {
    if (!Types.ObjectId.isValid(patientId)) {
      throw new BadRequestException('Identifiant patient invalide.');
    }
    const n = Math.min(50, Math.max(1, limit));
    const rows = await this.brainMriRecordModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .sort({ createdAt: -1 })
      .limit(n)
      .lean()
      .exec();
    return rows.map((r) => ({
      id: String(r._id),
      patientId: String(r.patientId),
      prediction: r.prediction,
      probability: r.probability,
      labelText: r.labelText,
      source: r.source,
      createdByDoctorId: r.createdByDoctorId || '',
      originalFilename: r.originalFilename || '',
      createdAt: (r as { createdAt?: Date }).createdAt,
      hasOverlay: !!(r as { overlayRelativePath?: string }).overlayRelativePath,
    }));
  }
}
