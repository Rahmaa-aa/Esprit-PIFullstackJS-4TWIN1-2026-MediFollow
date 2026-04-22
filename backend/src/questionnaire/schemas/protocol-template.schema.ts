import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class ProtocolMilestoneDef {
  @Prop({ required: true })
  dayOffset: number;

  @Prop({ type: Types.ObjectId, ref: 'QuestionnaireTemplate', required: true })
  questionnaireTemplateId: Types.ObjectId;
}

/** Protocole standard : jalons J+3, J+7, etc. pour un département. */
@Schema({ timestamps: true })
export class ProtocolTemplate extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  department: string;

  @Prop({ type: [ProtocolMilestoneDef], default: [] })
  milestones: ProtocolMilestoneDef[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ProtocolTemplateSchema = SchemaFactory.createForClass(ProtocolTemplate);
ProtocolTemplateSchema.index({ department: 1, isActive: 1 });
