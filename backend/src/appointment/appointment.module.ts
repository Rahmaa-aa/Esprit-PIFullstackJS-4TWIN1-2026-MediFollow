import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { DoctorAvailabilityModule } from '../doctor-availability/doctor-availability.module';
import { NotificationModule } from '../notification/notification.module';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
    AuthModule,
    DoctorAvailabilityModule,
    NotificationModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
