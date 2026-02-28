import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class LoginAttempt extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: false })
  used: boolean;

  @Prop({ required: true })
  expiresAt: Date;
}

export const LoginAttemptSchema = SchemaFactory.createForClass(LoginAttempt);
