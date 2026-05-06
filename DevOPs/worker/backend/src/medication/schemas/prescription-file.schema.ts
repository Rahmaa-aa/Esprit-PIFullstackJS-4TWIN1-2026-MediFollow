import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/** Métadonnées d’un PDF d’ordonnance stocké sur disque (accès JWT patient / médecin prescripteur). */
@Schema({ timestamps: true })
export class PrescriptionFile extends Document {
  @Prop({ required: true, unique: true })
  storageKey: string;

  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctorId: Types.ObjectId;
}

export const PrescriptionFileSchema = SchemaFactory.createForClass(PrescriptionFile);
PrescriptionFileSchema.index({ patientId: 1, createdAt: -1 });
