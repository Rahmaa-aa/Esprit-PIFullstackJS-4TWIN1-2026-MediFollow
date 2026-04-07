import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { MoodComplianceService } from './services/mood-compliance.service';
import { Patient, PatientSchema } from './schemas/patient.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
    AuthModule,
  ],
  controllers: [PatientController],
  providers: [PatientService, MoodComplianceService],
  exports: [PatientService, MoodComplianceService],
})
export class PatientModule {}
