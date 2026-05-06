import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
export class AnswerItem {
  @Prop({ required: true })
  questionId: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  value: unknown;
}

@Schema({ timestamps: true })
export class QuestionnaireSubmission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'QuestionnaireTemplate', required: true })
  questionnaireTemplateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PatientProtocolAssignment' })
  assignmentId?: Types.ObjectId;

  @Prop()
  milestoneDayOffset?: number;

  @Prop({ type: Types.ObjectId, ref: 'QuestionnaireAddon' })
  addonId?: Types.ObjectId;

  @Prop({ type: [AnswerItem], default: [] })
  answers: AnswerItem[];
}

export const QuestionnaireSubmissionSchema = SchemaFactory.createForClass(QuestionnaireSubmission);
QuestionnaireSubmissionSchema.index({ patientId: 1, createdAt: -1 });
