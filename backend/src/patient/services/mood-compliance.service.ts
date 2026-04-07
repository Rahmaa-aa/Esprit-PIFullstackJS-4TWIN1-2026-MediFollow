import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient } from '../schemas/patient.schema';

@Injectable()
export class MoodComplianceService {
  private readonly logger = new Logger(MoodComplianceService.name);

  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
  ) {}

  /**
   * Generates a new Mood Compliance Insight for the patient and pushes it to their dailyInsights
   */
  async generateDailyInsight(patientId: string) {
    const patient = await this.patientModel.findById(patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // MULTIMODAL MOCK/STUB CALCULATION
    // Future enhancement: these values would be queried from actual external services/schemas
    // 1. Emotion Score: Mocked fetching latest FER result
    const recentEmotions = ['happy', 'neutral', 'sad', 'angry'];
    const emotionLabel = recentEmotions[Math.floor(Math.random() * recentEmotions.length)];
    const emotionScore = emotionLabel === 'happy' ? 0.9 : emotionLabel === 'neutral' ? 0.7 : emotionLabel === 'sad' ? 0.3 : 0.1;

    // 2. Vital Trends: Mocked based on recent submissions
    const vitalTrendScore = Math.random() * 0.4 + 0.6; // 0.6 - 1.0

    // 3. Symptoms
    const symptomSeverityScore = Math.random() * 0.5; // 0.0 - 0.5 (lower is better usually, let's say higher = healthier for this score to align with "compliance")
    const invertedSymptomScore = 1.0 - symptomSeverityScore;

    // 4. Questionnaire Compliance
    const questionnaireCompliance = Math.floor(Math.random() * 20) + 80; // 80 - 100%

    // Weights for overall score
    const targetOverall = (
      (emotionScore * 0.3) + 
      (vitalTrendScore * 0.3) + 
      (invertedSymptomScore * 0.2) + 
      ((questionnaireCompliance / 100) * 0.2)
    ) * 100;

    const overallMoodScore = Math.min(100, Math.max(0, Math.round(targetOverall)));

    // Generate Natural Language Insight & Recommendation
    let insightSummary = '';
    let recommendation = '';
    let alertTriggered = false;

    if (overallMoodScore >= 80) {
      insightSummary = `Le patient présente une excellente observance et un état émotionnel positif récent (${emotionLabel}).`;
      recommendation = 'Continuer le traitement habituel ; maintenir ce niveau d\'engagement.';
    } else if (overallMoodScore >= 50) {
      insightSummary = `Observance modérée. L'état émotionnel est variable (${emotionLabel}). Certaines constantes fluctuent.`;
      recommendation = 'Une surveillance régulière est conseillée. Planifiez un appel de courtoisie si la tendance baisse.';
    } else {
      insightSummary = `Attention : score global bas. État émotionnel récent : ${emotionLabel}.`;
      recommendation = 'Intervention recommandée. L\'infirmier référent doit contacter le patient rapidement pour vérifier son état de santé.';
      alertTriggered = true;
    }

    if (emotionLabel === 'sad' || emotionLabel === 'angry') {
      alertTriggered = true;
      recommendation = `Alerte émotionnelle : le patient a signalé un état de tristesse ou de colère répétitif. ${recommendation}`;
    }

    const newInsight = {
      date: new Date(),
      emotionScore,
      emotionLabel,
      vitalTrendScore,
      symptomSeverityScore,
      questionnaireCompliance,
      overallMoodScore,
      insightSummary,
      recommendation,
      alertTriggered
    };

    // Keep only last 30 insights
    if (!patient.dailyInsights) {
        patient.dailyInsights = [];
    }
    
    patient.dailyInsights.push(newInsight as any);
    if (patient.dailyInsights.length > 30) {
      patient.dailyInsights.shift(); // Remove oldest
    }

    await patient.save();

    this.logger.log(`Generated new MoodComplianceInsight for patient ${patientId}. Score: ${overallMoodScore}`);
    
    return newInsight;
  }
}
