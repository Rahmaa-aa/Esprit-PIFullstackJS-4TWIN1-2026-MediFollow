import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffNotification, StaffNotificationSchema } from './schemas/notification.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { Appointment, AppointmentSchema } from '../appointment/schemas/appointment.schema';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Doctor, DoctorSchema } from '../doctor/schemas/doctor.schema';
import { Nurse, NurseSchema } from '../nurse/schemas/nurse.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StaffNotification.name, schema: StaffNotificationSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: User.name, schema: UserSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Nurse.name, schema: NurseSchema },
    ]),
    AuthModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
