import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Patient extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone: string;

  @Prop()
  dateOfBirth: string;

  @Prop()
  gender: string;

  @Prop()
  bloodType: string;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  country: string;

  @Prop()
  pinCode: string;

  @Prop({ default: '/assets/images/user/11.png' })
  profileImage: string;

  @Prop()
  alternateContact: string;

  @Prop()
  service: string;

  @Prop({ default: 'patient' })
  role: string;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
