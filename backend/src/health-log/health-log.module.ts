import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthLog, HealthLogSchema } from './schemas/health-log.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { Nurse, NurseSchema } from '../nurse/schemas/nurse.schema';
import { HealthLogService } from './health-log.service';
import { HealthLogController } from './health-log.controller';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HealthLog.name, schema: HealthLogSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Nurse.name, schema: NurseSchema },
    ]),
    AuthModule,
    NotificationModule,
    ChatModule,
  ],
  controllers: [HealthLogController],
  providers: [HealthLogService],
  exports: [HealthLogService],
})
export class HealthLogModule {}
