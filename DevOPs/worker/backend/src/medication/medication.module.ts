import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Medication, MedicationSchema } from './schemas/medication.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { PrescriptionFile, PrescriptionFileSchema } from './schemas/prescription-file.schema';
import { Doctor, DoctorSchema } from '../doctor/schemas/doctor.schema';
import { MedicationService } from './medication.service';
import { MedicationController } from './medication.controller';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Medication.name, schema: MedicationSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: PrescriptionFile.name, schema: PrescriptionFileSchema },
      { name: Doctor.name, schema: DoctorSchema },
    ]),
    AuthModule,
    NotificationModule,
  ],
  controllers: [MedicationController],
  providers: [MedicationService],
  exports: [MedicationService],
})
export class MedicationModule {}
