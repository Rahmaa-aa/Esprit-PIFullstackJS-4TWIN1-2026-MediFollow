import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BrainMriAnalysisRecordDocument = HydratedDocument<BrainMriAnalysisRecord>;

@Schema({ timestamps: true })
export class BrainMriAnalysisRecord {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true, index: true })
  patientId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  prediction: number;

  @Prop({ type: Number, required: true })
  probability: number;

  @Prop({ type: String, default: '' })
  labelText: string;

  @Prop({ type: String, enum: ['doctor', 'patient'], required: true })
  source: 'doctor' | 'patient';

  /** Médecin ayant lancé l’analyse (si source = doctor). */
  @Prop({ type: String, default: '' })
  createdByDoctorId: string;

  @Prop({ type: String, default: '' })
  originalFilename: string;

  /** Chemin relatif sous uploads/brain-mri/ (ex. patientId/uuid.png). */
  @Prop({ type: String, default: '' })
  overlayRelativePath: string;
}

export const BrainMriAnalysisRecordSchema = SchemaFactory.createForClass(BrainMriAnalysisRecord);
BrainMriAnalysisRecordSchema.index({ patientId: 1, createdAt: -1 });
