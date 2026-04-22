import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { JwtStrategy } from './jwt.strategy';
import { User, UserSchema } from './schemas/user.schema';
import { LoginAttempt, LoginAttemptSchema } from './schemas/login-attempt.schema';
import { Doctor, DoctorSchema } from '../doctor/schemas/doctor.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { Nurse, NurseSchema } from '../nurse/schemas/nurse.schema';
import { PasskeyCredential, PasskeyCredentialSchema } from './schemas/passkey-credential.schema';
import { PasskeyChallenge, PasskeyChallengeSchema } from './schemas/passkey-challenge.schema';
import { FaceLoginProfile, FaceLoginProfileSchema } from './schemas/face-login-profile.schema';
import { DepartmentCatalog, DepartmentCatalogSchema } from '../department/schemas/department-catalog.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: LoginAttempt.name, schema: LoginAttemptSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Nurse.name, schema: NurseSchema },
      { name: PasskeyCredential.name, schema: PasskeyCredentialSchema },
      { name: PasskeyChallenge.name, schema: PasskeyChallengeSchema },
      { name: FaceLoginProfile.name, schema: FaceLoginProfileSchema },
      { name: DepartmentCatalog.name, schema: DepartmentCatalogSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'medifollow-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, SmsService, JwtStrategy],
  exports: [AuthService, EmailService, SmsService, JwtModule, PassportModule, JwtStrategy],
})
export class AuthModule {}
