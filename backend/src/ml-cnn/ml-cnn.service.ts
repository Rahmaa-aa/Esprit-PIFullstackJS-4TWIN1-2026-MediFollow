import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Clés correspondant aux fichiers backend/models/*.keras */
export const ML_CNN_MODEL_IDS = [
  'bone_break',
  'brain_tumor',
  'lung_cancer',
  'renal',
  'skin_lesions',
] as const;

export type MlCnnModelId = (typeof ML_CNN_MODEL_IDS)[number];

export type MlCnnPredictResult = {
  modelKey: string;
  numClasses: number;
  probabilities: number[];
  classIndex: number;
  label: string;
  labels: string[];
};

@Injectable()
export class MlCnnService {
  constructor(private readonly config: ConfigService) {}

  /** URL Render du service FastAPI (ex. https://xxx.onrender.com), sans slash final */
  baseUrl(): string | undefined {
    const raw = this.config.get<string>('ML_SERVICE_URL');
    const u = raw?.trim();
    return u ? u.replace(/\/$/, '') : undefined;
  }

  models(): string[] {
    return [...ML_CNN_MODEL_IDS];
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl());
  }

  async predictFromBuffer(
    modelId: string,
    buffer: Buffer,
    filename = 'upload.jpg',
  ): Promise<MlCnnPredictResult> {
    if (!ML_CNN_MODEL_IDS.includes(modelId as MlCnnModelId)) {
      throw new BadRequestException(
        `Modèle invalide. Utiliser: ${ML_CNN_MODEL_IDS.join(', ')}`,
      );
    }

    const base = this.baseUrl();
    if (!base) {
      throw new ServiceUnavailableException(
        'Service ML non configuré. Définir ML_SERVICE_URL (URL Render du ml-service FastAPI).',
      );
    }

    const fd = new FormData();
    fd.append('file', new Blob([new Uint8Array(buffer)]), filename);

    const apiKey = this.config.get<string>('ML_INTERNAL_API_KEY')?.trim();
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['X-Internal-Key'] = apiKey;
    }

    const url = `${base}/predict/${encodeURIComponent(modelId)}`;
    let res: Response;
    try {
      res = await fetch(url, { method: 'POST', body: fd, headers });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new BadGatewayException(`Connexion ML service impossible: ${msg}`);
    }

    const text = await res.text();
    let body: Record<string, unknown>;
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      throw new BadGatewayException(`Réponse ML invalide (HTTP ${res.status}): ${text.slice(0, 200)}`);
    }

    if (!res.ok) {
      const detail = typeof body['detail'] === 'string' ? body['detail'] : text.slice(0, 400);
      throw new BadGatewayException(`ML service erreur HTTP ${res.status}: ${detail}`);
    }

    const modelKey = String(body['modelKey'] ?? '');
    const numClasses = Number(body['numClasses']);
    const probs = body['probabilities'];
    const classIndex = Number(body['classIndex']);
    const label = String(body['label'] ?? '');
    const labels = Array.isArray(body['labels']) ? (body['labels'] as string[]) : [];

    if (!Number.isFinite(numClasses) || !Array.isArray(probs)) {
      throw new BadGatewayException('Réponse ML incomplète.');
    }

    return {
      modelKey,
      numClasses,
      probabilities: probs.map((p) => Number(p)),
      classIndex,
      label,
      labels,
    };
  }

  /** Health distant (optionnel pour admin / probes) */
  async remoteHealth(): Promise<{ ok: boolean; url?: string; status?: number; body?: string }> {
    const base = this.baseUrl();
    if (!base) {
      return { ok: false };
    }
    try {
      const res = await fetch(`${base}/health`, { method: 'GET', signal: AbortSignal.timeout(10_000) });
      const t = await res.text();
      return { ok: res.ok, url: `${base}/health`, status: res.status, body: t };
    } catch {
      return { ok: false, url: `${base}/health` };
    }
  }
}
