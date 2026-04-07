import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { VoiceCallGateway } from './voice-call.gateway';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'medifollow-secret-key-change-in-production',
    }),
  ],
  providers: [VoiceCallGateway],
})
export class VoiceCallModule {}

