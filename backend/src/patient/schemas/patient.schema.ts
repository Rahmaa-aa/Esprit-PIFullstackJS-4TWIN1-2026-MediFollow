import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Patient extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone: string;

  @Prop()
  dateOfBirth: string;

  @Prop()
  gender: string;

  @Prop()
  bloodType: string;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  country: string;

  @Prop()
  pinCode: string;

  @Prop({ default: '/assets/images/user/11.png' })
  profileImage: string;

  @Prop()
  alternateContact: string;

  @Prop()
  service: string;

  /** Service hospitalier / département (classification admin) */
  @Prop()
  department: string;

  @Prop({ default: 'patient' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  // ─── Care Team ───────────────────────────────────────────────────────────
  @Prop()
  doctorId: string;

  @Prop()
  nurseId: string;

  // ─── Discharge Info ──────────────────────────────────────────────────────
  @Prop()
  admissionDate: string;

  @Prop()
  dischargeDate: string;

  @Prop()
  diagnosis: string;

  @Prop()
  dischargeNotes: string; // Post-discharge care instructions

  // ─── Physical Stats ──────────────────────────────────────────────────────
  @Prop()
  weight: number;

  @Prop()
  height: number;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
