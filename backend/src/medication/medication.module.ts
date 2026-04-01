import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Medication, MedicationSchema } from './schemas/medication.schema';
import { MedicationService } from './medication.service';
import { MedicationController } from './medication.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Medication.name, schema: MedicationSchema }])],
  controllers: [MedicationController],
  providers: [MedicationService],
  exports: [MedicationService],
})
export class MedicationModule {}
