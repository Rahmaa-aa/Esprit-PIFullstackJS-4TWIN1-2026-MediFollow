import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class MedicalCertificateItem {
  @Prop({ required: true })
  name: string;

  @Prop()
  dosage: string;

  @Prop()
  frequency: string;
}

export const MedicalCertificateItemSchema = SchemaFactory.createForClass(MedicalCertificateItem);

@Schema({ timestamps: true })
export class MedicalCertificate extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctorId: Types.ObjectId;

  @Prop()
  doctorDisplayName: string;

  @Prop({ type: Date, default: () => new Date() })
  issuedAt: Date;

  @Prop({ type: [MedicalCertificateItemSchema], default: [] })
  items: MedicalCertificateItem[];
}

export const MedicalCertificateSchema = SchemaFactory.createForClass(MedicalCertificate);
