import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class MailLabel extends Document {
  @Prop({ type: String, enum: ['patient', 'doctor', 'nurse'], required: true })
  ownerRole: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  /** Couleur CSS / hex (ex. #00bcd4). */
  @Prop({ default: '#6c757d' })
  color: string;
}

export const MailLabelSchema = SchemaFactory.createForClass(MailLabel);

MailLabelSchema.index({ ownerId: 1, ownerRole: 1, name: 1 }, { unique: true });
