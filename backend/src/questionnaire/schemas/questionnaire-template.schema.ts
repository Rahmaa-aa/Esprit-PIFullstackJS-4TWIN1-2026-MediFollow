import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionType = 'yes_no' | 'scale_10' | 'text';

@Schema({ _id: false })
export class QuestionItem {
  @Prop({ required: true })
  qid: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true, enum: ['yes_no', 'scale_10', 'text'] })
  type: QuestionType;

  @Prop({ default: 0 })
  order: number;
}

/** Banque : questionnaire clinique rattaché à un département (saisi par l’admin, questions validées cliniquement). */
@Schema({ timestamps: true })
export class QuestionnaireTemplate extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  /** Aligné sur Patient.department / service (nom du département). */
  @Prop({ required: true })
  department: string;

  @Prop({ type: [QuestionItem], default: [] })
  questions: QuestionItem[];

  @Prop({ default: true })
  isActive: boolean;
}

export const QuestionnaireTemplateSchema = SchemaFactory.createForClass(QuestionnaireTemplate);
QuestionnaireTemplateSchema.index({ department: 1, isActive: 1 });
