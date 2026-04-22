import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { BrainTumorController } from './brain-tumor.controller';
import { BrainTumorService } from './brain-tumor.service';
import { BrainMriAnalysisRecord, BrainMriAnalysisRecordSchema } from './schemas/brain-mri-analysis-record.schema';

@Module({
  imports: [
    AuthModule,
    NotificationModule,
    MongooseModule.forFeature([
      { name: BrainMriAnalysisRecord.name, schema: BrainMriAnalysisRecordSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
  ],
  controllers: [BrainTumorController],
  providers: [BrainTumorService],
})
export class BrainTumorModule {}
