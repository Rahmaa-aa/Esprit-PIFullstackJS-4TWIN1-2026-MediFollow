import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { Gamification, GamificationSchema } from './schemas/gamification.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gamification.name, schema: GamificationSchema }]),
  ],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
