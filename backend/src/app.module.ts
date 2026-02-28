import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { NurseModule } from './nurse/nurse.module';

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
  ],
})
export class AppModule {}
