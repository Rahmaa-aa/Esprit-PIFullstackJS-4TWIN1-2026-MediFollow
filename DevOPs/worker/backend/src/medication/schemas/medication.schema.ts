import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Medication extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  dosage: string; // e.g. "500mg"

  @Prop()
  frequency: string; // "once daily", "twice daily", etc.

  @Prop()
  prescribedBy: string;

  @Prop()
  startDate: string;

  @Prop()
  endDate: string;

  @Prop()
  notes: string;

  @Prop({ default: true })
  isActive: boolean;

  /** @deprecated Préférer takenSlotKeys — conservé pour migration */
  @Prop({ type: [String], default: [] })
  takenDates: string[];

  /** Prises par créneau : "YYYY-MM-DD#0", "YYYY-MM-DD#1", … */
  @Prop({ type: [String], default: [] })
  takenSlotKeys: string[];

  /** Heure d'enregistrement (ISO) par cle de creneau — meme cle que takenSlotKeys */
  @Prop({ type: Object, default: {} })
  takenSlotTimes: Record<string, string>;
}

export const MedicationSchema = SchemaFactory.createForClass(Medication);
