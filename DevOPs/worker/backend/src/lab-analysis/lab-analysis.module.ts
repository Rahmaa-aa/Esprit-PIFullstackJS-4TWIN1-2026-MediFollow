import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { LabAnalysisRecord, LabAnalysisRecordSchema } from './schemas/lab-analysis-record.schema';
import { LabAnalysisService } from './lab-analysis.service';
import { LabAnalysisController } from './lab-analysis.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LabAnalysisRecord.name, schema: LabAnalysisRecordSchema }]),
    AuthModule,
    NotificationModule,
  ],
  controllers: [LabAnalysisController],
  providers: [LabAnalysisService],
})
export class LabAnalysisModule {}
