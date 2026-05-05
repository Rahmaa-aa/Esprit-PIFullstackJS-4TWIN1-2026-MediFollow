import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { Doctor, DoctorSchema } from './schemas/doctor.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { Appointment, AppointmentSchema } from '../appointment/schemas/appointment.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Doctor.name, schema: DoctorSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    AuthModule,
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports: [DoctorService],
})
export class DoctorModule {}
