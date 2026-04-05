import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CareMessage, CareMessageSchema } from './schemas/care-message.schema';
import { StaffGroup, StaffGroupSchema } from './schemas/staff-group.schema';
import { ChatReadState, ChatReadStateSchema } from './schemas/chat-read-state.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { Doctor, DoctorSchema } from '../doctor/schemas/doctor.schema';
import { Nurse, NurseSchema } from '../nurse/schemas/nurse.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { ChatController } from './chat.controller';
import { ChatMessageCryptoService } from './chat-message-crypto.service';
import { ChatService } from './chat.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    MongooseModule.forFeature([
      { name: CareMessage.name, schema: CareMessageSchema },
      { name: StaffGroup.name, schema: StaffGroupSchema },
      { name: ChatReadState.name, schema: ChatReadStateSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Nurse.name, schema: NurseSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatMessageCryptoService, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
