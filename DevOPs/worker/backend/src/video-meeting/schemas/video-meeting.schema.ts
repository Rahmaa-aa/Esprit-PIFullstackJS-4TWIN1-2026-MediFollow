import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class VideoMeeting extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  scheduledAt: Date;

  @Prop({ default: 30 })
  duration: number; // minutes

  @Prop({ required: true })
  createdBy: string; // userId

  @Prop()
  creatorName: string;

  @Prop()
  creatorRole: string; // doctor | admin | superadmin

  @Prop({
    type: [
      {
        userId: String,
        name: String,
        role: String,
        joinedAt: Date,
      },
    ],
    default: [],
  })
  participants: { userId: string; name: string; role: string; joinedAt?: Date }[];

  @Prop({ unique: true, required: true })
  meetingCode: string;

  @Prop({ default: 'scheduled' })
  status: string; // scheduled | in-progress | completed | cancelled

  @Prop({
    type: [
      {
        userId: String,
        name: String,
        role: String,
      },
    ],
    default: [],
  })
  invitedUsers: { userId: string; name: string; role: string }[];

  @Prop()
  notes: string;
}

export const VideoMeetingSchema = SchemaFactory.createForClass(VideoMeeting);
