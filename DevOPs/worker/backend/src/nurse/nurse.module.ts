import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NurseController } from './nurse.controller';
import { NurseService } from './nurse.service';
import { Nurse, NurseSchema } from './schemas/nurse.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Nurse.name, schema: NurseSchema }]),
    AuthModule,
  ],
  controllers: [NurseController],
  providers: [NurseService],
  exports: [NurseService],
})
export class NurseModule {}
