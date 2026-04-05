import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { Doctor, DoctorSchema } from '../doctor/schemas/doctor.schema';
import { Nurse, NurseSchema } from '../nurse/schemas/nurse.schema';
import { MailMessage, MailMessageSchema } from './schemas/mail-message.schema';
import { MailUserState, MailUserStateSchema } from './schemas/mail-user-state.schema';
import { MailLabel, MailLabelSchema } from './schemas/mail-label.schema';
import { MailPolicyService } from './mail-policy.service';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [
    AuthModule,
    NotificationModule,
    MongooseModule.forFeature([
      { name: MailMessage.name, schema: MailMessageSchema },
      { name: MailUserState.name, schema: MailUserStateSchema },
      { name: MailLabel.name, schema: MailLabelSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Nurse.name, schema: NurseSchema },
    ]),
  ],
  controllers: [MailController],
  providers: [MailPolicyService, MailService],
  exports: [MailService],
})
export class MailModule {}
