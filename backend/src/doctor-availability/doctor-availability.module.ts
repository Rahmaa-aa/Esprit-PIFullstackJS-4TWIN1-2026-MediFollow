import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { DoctorAvailability, DoctorAvailabilitySchema } from './schemas/doctor-availability.schema';
import { Appointment, AppointmentSchema } from '../appointment/schemas/appointment.schema';
import { DoctorAvailabilityService } from './doctor-availability.service';
import { DoctorAvailabilityController } from './doctor-availability.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DoctorAvailability.name, schema: DoctorAvailabilitySchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    AuthModule,
  ],
  controllers: [DoctorAvailabilityController],
  providers: [DoctorAvailabilityService],
  exports: [DoctorAvailabilityService],
})
export class DoctorAvailabilityModule {}
