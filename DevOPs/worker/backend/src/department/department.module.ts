import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { Doctor, DoctorSchema } from '../doctor/schemas/doctor.schema';
import { Nurse, NurseSchema } from '../nurse/schemas/nurse.schema';
import { HealthLog, HealthLogSchema } from '../health-log/schemas/health-log.schema';
import { Medication, MedicationSchema } from '../medication/schemas/medication.schema';
import { Appointment, AppointmentSchema } from '../appointment/schemas/appointment.schema';
import { DepartmentService } from './department.service';
import { CareCoordinatorFollowupService } from './care-coordinator-followup.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { DepartmentController } from './department.controller';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { DepartmentCatalog, DepartmentCatalogSchema } from './schemas/department-catalog.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Nurse.name, schema: NurseSchema },
      { name: HealthLog.name, schema: HealthLogSchema },
      { name: Medication.name, schema: MedicationSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: User.name, schema: UserSchema },
      { name: DepartmentCatalog.name, schema: DepartmentCatalogSchema },
    ]),
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService, CareCoordinatorFollowupService, AdminDashboardService],
})
export class DepartmentModule {}
