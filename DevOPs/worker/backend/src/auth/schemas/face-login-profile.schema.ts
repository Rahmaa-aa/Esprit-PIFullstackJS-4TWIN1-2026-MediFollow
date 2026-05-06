import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class FaceLoginProfile extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: ['doctor', 'patient', 'nurse'], index: true })
  role: string;

  @Prop({ required: true, index: true })
  email: string;

  @Prop({ type: [Number], required: true })
  descriptor: number[];

  @Prop({ default: true, index: true })
  enabled: boolean;
}

export const FaceLoginProfileSchema = SchemaFactory.createForClass(FaceLoginProfile);
FaceLoginProfileSchema.index({ userId: 1, role: 1 }, { unique: true });
