import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/** Questionnaire complémentaire ajouté par le médecin pour un patient précis. */
@Schema({ timestamps: true })
export class QuestionnaireAddon extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true })
  doctorId: string;

  @Prop({ type: Types.ObjectId, ref: 'QuestionnaireTemplate', required: true })
  questionnaireTemplateId: Types.ObjectId;

  @Prop({ required: true })
  dueDate: string;

  @Prop({ required: true, enum: ['pending', 'completed', 'skipped'] })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'QuestionnaireSubmission' })
  submissionId?: Types.ObjectId;
}

export const QuestionnaireAddonSchema = SchemaFactory.createForClass(QuestionnaireAddon);
QuestionnaireAddonSchema.index({ patientId: 1, status: 1 });
