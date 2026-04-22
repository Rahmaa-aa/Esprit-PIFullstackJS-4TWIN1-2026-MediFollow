import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Medication, MedicationSchema } from './schemas/medication.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { MedicationService } from './medication.service';
import { MedicationController } from './medication.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Medication.name, schema: MedicationSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
    AuthModule,
  ],
  controllers: [MedicationController],
  providers: [MedicationService],
  exports: [MedicationService],
})
export class MedicationModule {}
