import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class MilestoneInstance {
  @Prop({ required: true })
  dayOffset: number;

  @Prop({ type: Types.ObjectId, ref: 'QuestionnaireTemplate', required: true })
  questionnaireTemplateId: Types.ObjectId;

  @Prop({ required: true })
  dueDate: string;

  @Prop({ required: true, enum: ['pending', 'completed', 'skipped'] })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'QuestionnaireSubmission' })
  submissionId?: Types.ObjectId;
}

/** Instance protocole assignée à un patient (ancrage = date de sortie). */
@Schema({ timestamps: true })
export class PatientProtocolAssignment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true })
  doctorId: string;

  @Prop({ type: Types.ObjectId, ref: 'ProtocolTemplate', required: true })
  protocolTemplateId: Types.ObjectId;

  @Prop({ required: true })
  dischargeDate: string;

  @Prop({ type: [MilestoneInstance], default: [] })
  milestones: MilestoneInstance[];

  @Prop({ default: true })
  isActive: boolean;
}

export const PatientProtocolAssignmentSchema = SchemaFactory.createForClass(PatientProtocolAssignment);
PatientProtocolAssignmentSchema.index({ patientId: 1, isActive: 1 });
