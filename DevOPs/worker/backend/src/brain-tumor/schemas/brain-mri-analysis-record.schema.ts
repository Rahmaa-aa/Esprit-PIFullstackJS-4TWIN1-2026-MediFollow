import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BrainMriAnalysisRecordDocument = HydratedDocument<BrainMriAnalysisRecord>;

@Schema({ timestamps: true })
export class BrainMriAnalysisRecord {
  /** Absent si analyse lancée par le médecin sans patient (page /doctor/brain-mri). */
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: false, default: null })
  patientId?: Types.ObjectId | null;

  @Prop({ type: Number, required: true })
  prediction: number;

  @Prop({ type: Number, required: true })
  probability: number;

  @Prop({ type: String, default: '' })
  labelText: string;

  @Prop({ type: String, enum: ['doctor', 'patient'], required: true })
  source: 'doctor' | 'patient';

  /**
   * `pending` : image envoyée par le patient, en attente d’inférence par le médecin.
   * `completed` : analyse terminée (rétrocompat : documents sans champ = traités comme complétés côté API).
   */
  @Prop({ type: String, enum: ['pending', 'completed'], default: 'completed' })
  analysisStatus: 'pending' | 'completed';

  /** Médecin ayant lancé l’analyse (si source = doctor, ou médecin ayant finalisé un dossier pending). */
  @Prop({ type: String, default: '' })
  createdByDoctorId: string;

  @Prop({ type: String, default: '' })
  originalFilename: string;

  /** Image brute patient (avant analyse) — chemin relatif sous uploads/brain-mri/. */
  @Prop({ type: String, default: '' })
  originalImageRelativePath: string;

  /** Chemin relatif sous uploads/brain-mri/ (ex. patientId/uuid.png) — overlay après prédiction. */
  @Prop({ type: String, default: '' })
  overlayRelativePath: string;
}

export const BrainMriAnalysisRecordSchema = SchemaFactory.createForClass(BrainMriAnalysisRecord);
BrainMriAnalysisRecordSchema.index({ patientId: 1, createdAt: -1 });
BrainMriAnalysisRecordSchema.index({ createdByDoctorId: 1, createdAt: -1 });
