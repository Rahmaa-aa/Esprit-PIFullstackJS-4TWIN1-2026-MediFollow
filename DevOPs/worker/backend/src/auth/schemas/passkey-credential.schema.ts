import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PasskeyCredential extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: ['doctor', 'patient', 'nurse'], index: true })
  role: string;

  @Prop({ required: true, unique: true, index: true })
  credentialId: string;

  @Prop({ required: true })
  publicKey: string;

  @Prop({ default: 0 })
  counter: number;

  @Prop({ type: [String], default: [] })
  transports: string[];

  @Prop()
  deviceLabel?: string;
}

export const PasskeyCredentialSchema = SchemaFactory.createForClass(PasskeyCredential);
