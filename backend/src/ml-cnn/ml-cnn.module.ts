import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MlCnnController } from './ml-cnn.controller';
import { MlCnnService } from './ml-cnn.service';

@Module({
  imports: [AuthModule],
  controllers: [MlCnnController],
  providers: [MlCnnService],
  exports: [MlCnnService],
})
export class MlCnnModule {}
