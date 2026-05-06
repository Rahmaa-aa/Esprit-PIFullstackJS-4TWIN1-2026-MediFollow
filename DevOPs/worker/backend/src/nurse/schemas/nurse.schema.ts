import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Nurse extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  specialty: string;

  @Prop()
  department: string;

  @Prop()
  phone: string;

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
  facebookUrl: string;

  @Prop()
  twitterUrl: string;

  @Prop()
  instagramUrl: string;

  @Prop()
  linkedinUrl: string;

  @Prop({ default: 'nurse' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const NurseSchema = SchemaFactory.createForClass(Nurse);
