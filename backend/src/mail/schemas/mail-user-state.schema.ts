import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type MailFolder =
  | 'inbox'
  | 'sent'
  | 'drafts'
  | 'trash'
  | 'spam'
  | 'snoozed'
  | 'important';

@Schema({ timestamps: true })
export class MailUserState extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MailMessage', required: true })
  messageId: Types.ObjectId;

  @Prop({ type: String, enum: ['patient', 'doctor', 'nurse'], required: true })
  userRole: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['inbox', 'sent', 'drafts', 'trash', 'spam', 'snoozed', 'important'],
    required: true,
  })
  folder: MailFolder;

  @Prop({ type: Date, default: null })
  readAt: Date | null;

  @Prop({ default: false })
  starred: boolean;

  @Prop({ type: Date, default: null })
  snoozedUntil: Date | null;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'MailLabel' }], default: [] })
  labelIds: Types.ObjectId[];

  /** Copie côté expéditeur (dossier Envoyés). */
  @Prop({ default: false })
  isOutgoing: boolean;
}

export const MailUserStateSchema = SchemaFactory.createForClass(MailUserState);

MailUserStateSchema.index({ messageId: 1, userId: 1, userRole: 1 }, { unique: true });
MailUserStateSchema.index({ userId: 1, userRole: 1, folder: 1, createdAt: -1 });
