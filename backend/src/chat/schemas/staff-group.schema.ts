import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/** Groupe de discussion : personnel + patients invités. */
@Schema({ timestamps: true })
export class StaffGroup extends Document {
  @Prop({ required: true, maxlength: 120, trim: true })
  name: string;

  @Prop({
    type: [
      {
        role: { type: String, enum: ['doctor', 'nurse', 'patient'], required: true },
        id: { type: String, required: true },
      },
    ],
    required: true,
  })
  members: { role: 'doctor' | 'nurse' | 'patient'; id: string }[];

  @Prop({ required: true, enum: ['doctor', 'nurse'] })
  createdByRole: 'doctor' | 'nurse';

  @Prop({ required: true })
  createdById: string;
}

export const StaffGroupSchema = SchemaFactory.createForClass(StaffGroup);
