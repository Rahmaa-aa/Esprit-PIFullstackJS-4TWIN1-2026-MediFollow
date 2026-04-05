import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type MailSenderRole = 'patient' | 'doctor' | 'nurse';

@Schema({ timestamps: true })
export class MailMessage extends Document {
  @Prop({ type: String, enum: ['patient', 'doctor', 'nurse'], required: true })
  senderRole: MailSenderRole;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  senderId: Types.ObjectId;

  @Prop({
    type: [
      {
        role: { type: String, enum: ['patient', 'doctor', 'nurse'], required: true },
        id: { type: MongooseSchema.Types.ObjectId, required: true },
      },
    ],
    default: [],
  })
  recipients: { role: 'patient' | 'doctor' | 'nurse'; id: Types.ObjectId }[];

  @Prop({ default: '' })
  subject: string;

  @Prop({ default: '' })
  body: string;

  /** Taille pièces jointes (octets) — pour quota. */
  @Prop({ default: 0 })
  attachmentSizeBytes: number;

  /** Taille totale estimée (corps + sujet + PJ) pour quota. */
  @Prop({ default: 0 })
  totalSizeBytes: number;

  @Prop({ default: false })
  isDraft: boolean;
}

export const MailMessageSchema = SchemaFactory.createForClass(MailMessage);
