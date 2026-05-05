import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';

export type LabAnalysisRecordDocument = HydratedDocument<LabAnalysisRecord>;

export type LabAnalysisStatus = 'normal' | 'anomaly' | 'indeterminate';

@Schema({ timestamps: true })
export class LabAnalysisRecord {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true, index: true })
  patientId: Types.ObjectId;

  @Prop({ type: String, enum: ['normal', 'anomaly', 'indeterminate'], required: true })
  status: LabAnalysisStatus;

  /** Confiance de la classification heuristique (0–100). */
  @Prop({ type: Number, required: true })
  classificationConfidence: number;

  @Prop({ type: Number, default: 0 })
  ocrConfidence: number;

  @Prop({ type: String, default: '' })
  method: string;

  @Prop({ type: String, default: '' })
  imageFilename: string;

  @Prop({ type: String, default: '' })
  textPreview: string;

  @Prop({ type: [String], default: [] })
  matchedAnomalyHints: string[];

  @Prop({ type: [String], default: [] })
  matchedNormalHints: string[];

  /** strong = mots-clés « nets » ; approximate = surtout limites / « anomalie » seule / à surveiller. */
  @Prop({ type: String, enum: ['strong', 'approximate', 'none'], default: 'none' })
  anomalyStrength: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  structuredFinding: { parameters?: unknown[]; conditionHints?: unknown[] } | null;
}

export const LabAnalysisRecordSchema = SchemaFactory.createForClass(LabAnalysisRecord);
