import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class HealthLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true, default: () => new Date().toISOString().split('T')[0] })
  date: string;

  /** Moment de la saisie (plusieurs relevés possibles le même jour) */
  @Prop({ type: Date })
  recordedAt?: Date;

  @Prop({ type: Object, default: {} })
  vitals: {
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    /** Fréquence respiratoire (resp/min) — dictionnaire clinique */
    respiratoryRate?: number;
    weight?: number;
  };

  /**
   * Subjectif structuré (scores int + présence bool) — pas de texte libre pour l’analyse.
   * Les entrées `symptoms` (ids) sont dérivées à l’enregistrement pour compatibilité affichage.
   */
  @Prop({ type: Object, default: {} })
  symptomStructured?: {
    fatigue?: number;
    chestPain?: number;
    shortBreath?: number;
    nausea?: number;
    feltFever?: boolean;
    palpitations?: boolean;
    cough?: boolean;
    dizzinessConfusion?: boolean;
  };

  @Prop({ type: [String], default: [] })
  symptoms: string[];

  @Prop({ min: 0, max: 10, default: 0 })
  painLevel: number;

  @Prop({ enum: ['good', 'fair', 'poor'], default: 'good' })
  mood: string;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: 0 })
  riskScore: number;

  @Prop({ default: false })
  flagged: boolean;

  /** Chaîne d’escalade : alerte auto → infirmier → (optionnel) médecin → clôture */
  @Prop({
    enum: ['none', 'alert_sent', 'escalated_to_doctor', 'resolved'],
    default: 'none',
  })
  escalationStatus: 'none' | 'alert_sent' | 'escalated_to_doctor' | 'resolved';

  @Prop({ type: Date })
  escalatedAt?: Date;

  @Prop()
  escalatedByNurseId?: string;

  /** Note libre de l’infirmier lors de l’escalade */
  @Prop({ default: '' })
  escalationNote?: string;

  @Prop({ type: Date })
  resolvedAt?: Date;

  @Prop()
  resolvedByDoctorId?: string;

  /** Consigne / solution rédigée par le médecin à l’envoi au patient lors de la clôture */
  @Prop({ default: '' })
  doctorResolutionNote?: string;
}

export const HealthLogSchema = SchemaFactory.createForClass(HealthLog);
HealthLogSchema.index({ patientId: 1, escalationStatus: 1, createdAt: -1 });
