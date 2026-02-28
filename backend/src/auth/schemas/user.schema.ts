import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop()
  name: string;

  @Prop()
  profileImage: string;

  @Prop()
  alternateEmail: string;

  @Prop({ type: [String], default: [] })
  languages: string[];

  @Prop({ type: Object, default: {} })
  socialMedia: {
    facebook?: string;
    twitter?: string;
    google?: string;
    instagram?: string;
    youtube?: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
