import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class StaffNotification extends Document {
  /** Destinataire : id du médecin ou de l'infirmier (string, aligné sur patient.doctorId / nurseId) */
  @Prop({ required: true })
  recipientId: string;

  @Prop({ required: true, enum: ['doctor', 'nurse', 'patient', 'admin', 'carecoordinator'] })
  recipientRole: 'doctor' | 'nurse' | 'patient' | 'admin' | 'carecoordinator';

  @Prop({ default: 'risk_alert' })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  appointmentId?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  /** Présent pour la plupart des alertes ; optionnel pour messagerie pair (sans fil patient). */
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: false })
  patientId?: Types.ObjectId;

  @Prop()
  patientName?: string;

  @Prop({ type: Types.ObjectId, ref: 'HealthLog' })
  healthLogId?: Types.ObjectId;

  @Prop({ default: false })
  read: boolean;

  /** Données structurées pour affichage localisé côté client (titres/corps ne sont plus figés FR). */
  @Prop({ type: Object, required: false })
  meta?: Record<string, unknown>;
}

export const StaffNotificationSchema = SchemaFactory.createForClass(StaffNotification);
StaffNotificationSchema.index({ recipientId: 1, createdAt: -1 });
StaffNotificationSchema.index({ recipientId: 1, read: 1 });
