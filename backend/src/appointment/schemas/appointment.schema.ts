import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Appointment extends Document {
  @Prop({ type: Types.ObjectId, required: true })
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

  @Prop({ default: 'scheduled' })
  status: string; // scheduled | completed | cancelled

  @Prop()
  notes: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
