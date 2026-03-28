import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class HealthLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true, default: () => new Date().toISOString().split('T')[0] })
  date: string;

  @Prop({ type: Object, default: {} })
  vitals: {
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    weight?: number;
  };

  @Prop({ type: [String], default: [] })
  symptoms: string[];

  @Prop({ min: 0, max: 10, default: 0 })
  painLevel: number;

  @Prop({ enum: ['good', 'fair', 'poor'], default: 'good' })
  mood: string;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: 0 })
  riskScore: number;

  @Prop({ default: false })
  flagged: boolean;
}

export const HealthLogSchema = SchemaFactory.createForClass(HealthLog);
