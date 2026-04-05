import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Appointment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop()
  doctorId: string;

  @Prop()
  doctorName: string;

  @Prop({ required: true })
  title: string; // e.g. "Follow-up Cardiology"

  @Prop({ required: true })
  date: string; // ISO date string "2026-04-15"

  @Prop()
  time: string; // "10:30"

  @Prop()
  location: string;

  @Prop({ default: 'checkup' })
  type: string; // checkup | lab | specialist | imaging

  /** pending = demande patient ; confirmed = validé admin (date/heure finales) ; scheduled = ancien schéma (= confirmé) */
  @Prop({ default: 'pending' })
  status: string;

  /** Souhait initial du patient (avant validation admin) */
  @Prop()
  requestedDate: string;

  @Prop()
  requestedTime: string;

  @Prop()
  patientMessage: string;

  /** Message admin (ex. autre créneau proposé) */
  @Prop()
  adminNotes: string;

  @Prop()
  notes: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
