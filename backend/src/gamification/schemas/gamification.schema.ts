import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Gamification extends Document {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true, enum: ['patient', 'doctor', 'nurse', 'admin'] })
  role: string;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  streak: number;

  @Prop({ default: null })
  lastActivityDate: Date;

  @Prop({ type: [{ name: String, icon: String, description: String, dateEarned: Date }], default: [] })
  badges: Array<{ name: string; icon: string; description: string; dateEarned: Date }>;

  @Prop({ type: [{ action: String, points: Number, date: Date }], default: [] })
  history: Array<{ action: string; points: number; date: Date }>;
}

export const GamificationSchema = SchemaFactory.createForClass(Gamification);
