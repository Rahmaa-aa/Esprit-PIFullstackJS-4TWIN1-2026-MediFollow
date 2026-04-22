import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoMeeting, VideoMeetingSchema } from './schemas/video-meeting.schema';
import { VideoMeetingService } from './video-meeting.service';
import { VideoMeetingController } from './video-meeting.controller';

import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { Nurse, NurseSchema } from '../nurse/schemas/nurse.schema';
import { StaffNotification, StaffNotificationSchema } from '../notification/schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoMeeting.name, schema: VideoMeetingSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Nurse.name, schema: NurseSchema },
      { name: StaffNotification.name, schema: StaffNotificationSchema },
    ]),
  ],
  controllers: [VideoMeetingController],
  providers: [VideoMeetingService],
  exports: [VideoMeetingService],
})
export class VideoMeetingModule {}
