import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalCertificate, MedicalCertificateSchema } from './schemas/medical-certificate.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { Medication, MedicationSchema } from '../medication/schemas/medication.schema';
import { MedicalCertificateService } from './medical-certificate.service';
import { MedicalCertificateController } from './medical-certificate.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MedicalCertificate.name, schema: MedicalCertificateSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Medication.name, schema: MedicationSchema },
    ]),
    AuthModule,
  ],
  controllers: [MedicalCertificateController],
  providers: [MedicalCertificateService],
})
export class MedicalCertificateModule {}
