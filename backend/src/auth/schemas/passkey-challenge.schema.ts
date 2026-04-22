import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PasskeyChallenge extends Document {
  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true, enum: ['registration', 'authentication'], index: true })
  type: string;

  @Prop({ required: true })
  challenge: string;

  @Prop({ required: true, enum: ['doctor', 'patient', 'nurse'] })
  role: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, index: true })
  expiresAt: Date;
}

export const PasskeyChallengeSchema = SchemaFactory.createForClass(PasskeyChallenge);
