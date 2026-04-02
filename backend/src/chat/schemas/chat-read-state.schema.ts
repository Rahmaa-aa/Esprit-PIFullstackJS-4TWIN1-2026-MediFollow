import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/** Dernière lecture par participant — fil patient OU fil pair (même département). */
@Schema({ timestamps: true })
export class ChatReadState extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: false })
  patientId?: Types.ObjectId;

  @Prop({ required: false })
  peerThreadKey?: string;

  @Prop({ required: true })
  readerId: string;

  @Prop({ required: true, enum: ['patient', 'doctor', 'nurse'] })
  readerRole: 'patient' | 'doctor' | 'nurse';

  @Prop({ type: Date, required: true })
  lastReadAt: Date;
}

export const ChatReadStateSchema = SchemaFactory.createForClass(ChatReadState);
ChatReadStateSchema.index(
  { patientId: 1, readerId: 1, readerRole: 1 },
  { unique: true, partialFilterExpression: { patientId: { $exists: true, $ne: null } } },
);
ChatReadStateSchema.index(
  { peerThreadKey: 1, readerId: 1, readerRole: 1 },
  { unique: true, partialFilterExpression: { peerThreadKey: { $exists: true, $ne: null } } },
);
