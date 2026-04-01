import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HealthLog } from './schemas/health-log.schema';

const computeRiskScore = (data: any): { score: number; flagged: boolean } => {
  let score = 0;

  const hr = data.vitals?.heartRate;
  if (hr && (hr < 50 || hr > 110)) score += 20;

  const sys = data.vitals?.bloodPressureSystolic;
  if (sys && (sys < 90 || sys > 160)) score += 20;

  const o2 = data.vitals?.oxygenSaturation;
  if (o2 && o2 < 94) score += 25;

  const temp = data.vitals?.temperature;
  if (temp && (temp < 36 || temp > 38.5)) score += 15;

  const highRiskSymptoms = ['shortness of breath', 'chest pain', 'fainting', 'severe headache'];
  const symptomHits = (data.symptoms || []).filter((s: string) =>
    highRiskSymptoms.some(h => s.toLowerCase().includes(h.toLowerCase()))
  ).length;
  score += symptomHits * 15;

  if (data.painLevel >= 7) score += 15;
  else if (data.painLevel >= 5) score += 8;

  if (data.mood === 'poor') score += 10;

  return { score: Math.min(score, 100), flagged: score >= 50 };
};

@Injectable()
export class HealthLogService {
  constructor(@InjectModel(HealthLog.name) private healthLogModel: Model<HealthLog>) {}

  private toPatientObjectId(patientId: string) {
    const s = String(patientId).trim();
    if (!s || !Types.ObjectId.isValid(s)) {
      throw new BadRequestException('Identifiant patient invalide');
    }
    return new Types.ObjectId(s);
  }

  private patientIdFilter(patientId: string) {
    const s = String(patientId).trim();
    if (!Types.ObjectId.isValid(s)) return { patientId: s };
    const oid = new Types.ObjectId(s);
    return { $or: [{ patientId: oid }, { patientId: s }] };
  }

  async submit(patientId: string, data: any) {
    const pid = this.toPatientObjectId(patientId);
    const date = data.localDate || new Date().toISOString().split('T')[0];
    let recordedAt = data.recordedAt ? new Date(data.recordedAt) : new Date();
    if (Number.isNaN(recordedAt.getTime())) recordedAt = new Date();

    const { score, flagged } = computeRiskScore(data);

    const payload = {
      patientId: pid,
      date,
      recordedAt,
      vitals: data.vitals || {},
      symptoms: data.symptoms || [],
      painLevel: data.painLevel ?? 0,
      mood: data.mood || 'good',
      notes: data.notes || '',
      riskScore: score,
      flagged,
    };

    return this.healthLogModel.create(payload);
  }

  /** Derniers 30 jours, tous les relevés (plusieurs par jour), du plus ancien au plus récent */
  async getHistory(patientId: string) {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    since.setHours(0, 0, 0, 0);
    const sinceYmd = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, '0')}-${String(since.getDate()).padStart(2, '0')}`;

    const patientPart = this.patientIdFilter(patientId);
    return this.healthLogModel
      .find({
        $and: [
          patientPart,
          { $or: [{ createdAt: { $gte: since } }, { date: { $gte: sinceYmd } }] },
        ],
      })
      .sort({ createdAt: 1, _id: 1 })
      .limit(2000)
      .exec();
  }

  async getLatest(patientId: string) {
    return this.healthLogModel.findOne(this.patientIdFilter(patientId)).sort({ createdAt: -1 }).exec();
  }
}
