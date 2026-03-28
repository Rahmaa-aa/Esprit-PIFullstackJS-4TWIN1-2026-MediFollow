import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthLog, HealthLogSchema } from './schemas/health-log.schema';
import { HealthLogService } from './health-log.service';
import { HealthLogController } from './health-log.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HealthLog.name, schema: HealthLogSchema }]),
    AuthModule,
  ],
  controllers: [HealthLogController],
  providers: [HealthLogService],
  exports: [HealthLogService],
})
export class HealthLogModule {}
