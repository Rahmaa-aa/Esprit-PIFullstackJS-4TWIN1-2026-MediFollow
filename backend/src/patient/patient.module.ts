import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { Patient, PatientSchema } from './schemas/patient.schema';
import { Doctor, DoctorSchema } from '../doctor/schemas/doctor.schema';
import { Nurse, NurseSchema } from '../nurse/schemas/nurse.schema';
import { AuthModule } from '../auth/auth.module';
import { DepartmentModule } from '../department/department.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Nurse.name, schema: NurseSchema },
    ]),
    AuthModule,
    DepartmentModule,
  ],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
