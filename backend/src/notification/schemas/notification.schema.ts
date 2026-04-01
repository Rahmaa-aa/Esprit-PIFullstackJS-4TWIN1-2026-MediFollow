import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class StaffNotification extends Document {
  /** Destinataire : id du médecin ou de l'infirmier (string, aligné sur patient.doctorId / nurseId) */
  @Prop({ required: true })
  recipientId: string;

  @Prop({ required: true, enum: ['doctor', 'nurse'] })
  recipientRole: 'doctor' | 'nurse';

  @Prop({ default: 'risk_alert' })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop()
  patientName?: string;

  @Prop({ type: Types.ObjectId, ref: 'HealthLog' })
  healthLogId?: Types.ObjectId;

  @Prop({ default: false })
  read: boolean;
}

export const StaffNotificationSchema = SchemaFactory.createForClass(StaffNotification);
StaffNotificationSchema.index({ recipientId: 1, createdAt: -1 });
StaffNotificationSchema.index({ recipientId: 1, read: 1 });
