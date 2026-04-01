import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffNotification, StaffNotificationSchema } from './schemas/notification.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StaffNotification.name, schema: StaffNotificationSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
    AuthModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
