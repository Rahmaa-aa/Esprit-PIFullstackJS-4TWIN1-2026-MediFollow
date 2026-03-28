import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  async submit(patientId: string, data: any) {
    // Use the date sent by the client (local timezone), fallback to UTC date
    const date = data.localDate || new Date().toISOString().split('T')[0];

    // One entry per day — update if already exists
    const existing = await this.healthLogModel.findOne({ patientId, date }).exec();
    const { score, flagged } = computeRiskScore(data);

    const payload = {
      patientId,
      date,
      vitals: data.vitals || {},
      symptoms: data.symptoms || [],
      painLevel: data.painLevel ?? 0,
      mood: data.mood || 'good',
      notes: data.notes || '',
      riskScore: score,
      flagged,
    };

    if (existing) {
      return this.healthLogModel.findByIdAndUpdate(existing._id, { $set: payload }, { new: true }).exec();
    }
    return this.healthLogModel.create(payload);
  }

  async getHistory(patientId: string) {
    return this.healthLogModel
      .find({ patientId })
      .sort({ date: -1 })
      .limit(30)
      .exec();
  }

  async getLatest(patientId: string) {
    // Return most recent log regardless of date — let frontend check if it's today
    return this.healthLogModel
      .findOne({ patientId })
      .sort({ date: -1 })
      .exec();
  }
}
