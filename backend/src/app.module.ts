import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { NurseModule } from './nurse/nurse.module';
import { HealthLogModule } from './health-log/health-log.module';
import { MedicationModule } from './medication/medication.module';
import { AppointmentModule } from './appointment/appointment.module';
import { DepartmentModule } from './department/department.module';
import { DoctorAvailabilityModule } from './doctor-availability/doctor-availability.module';
import { NotificationModule } from './notification/notification.module';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { ChatModule } from './chat/chat.module';
import { VoiceCallModule } from './voice-call/voice-call.module';
import { MailModule } from './mail/mail.module';
import { LabAnalysisModule } from './lab-analysis/lab-analysis.module';
import { AuditModule } from './audit/audit.module';
import { BrainTumorModule } from './brain-tumor/brain-tumor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/medifollow', {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    }),
    AuthModule,
    DoctorModule,
    PatientModule,
    NurseModule,
    HealthLogModule,
    MedicationModule,
    AppointmentModule,
    DepartmentModule,
    DoctorAvailabilityModule,
    NotificationModule,
    QuestionnaireModule,
    ChatModule,
    VoiceCallModule,
    MailModule,
    LabAnalysisModule,
    AuditModule,
    BrainTumorModule,
  ],
})
export class AppModule {}
