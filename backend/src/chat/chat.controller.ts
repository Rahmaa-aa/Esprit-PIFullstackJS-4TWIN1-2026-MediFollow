import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

const chatUploadDir = join(process.cwd(), 'uploads', 'chat');
const chatVoiceStorage = diskStorage({
  destination: (_req, _file, cb) => {
    mkdirSync(chatUploadDir, { recursive: true });
    cb(null, chatUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname) || '.webm';
    cb(null, `${randomUUID()}${ext}`);
  },
});
const chatMediaStorage = diskStorage({
  destination: (_req, _file, cb) => {
    mkdirSync(chatUploadDir, { recursive: true });
    cb(null, chatUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname) || '.bin';
    cb(null, `${randomUUID()}${ext}`);
  },
});

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('department-contacts')
  async departmentContacts(@Req() req: { user?: { id?: unknown; role?: string } }) {
    const u = req.user;
    if (!u?.id) throw new ForbiddenException();
    return this.chatService.getDepartmentContacts({ id: u.id, role: String(u.role || '') });
  }

  /** Groupes staff : médecin / infirmier uniquement. */
  @UseGuards(JwtAuthGuard)
  @Get('groups')
  async listGroups(@Req() req: { user?: { id?: unknown; role?: string } }) {
    const u = req.user;
    if (!u?.id) throw new ForbiddenException();
    return this.chatService.listStaffGroups({ id: u.id, role: String(u.role || '') });
  }

  @UseGuards(JwtAuthGuard)
  @Post('groups')
  async createGroup(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Body() body: { name?: string; members?: { role: 'doctor' | 'nurse' | 'patient'; id: string }[] },
  ) {
    const u = req.user;
    if (!u?.id) throw new ForbiddenException();
    return this.chatService.createStaffGroup(
      { id: u.id, role: String(u.role || '') },
      { name: String(body?.name || ''), members: body?.members || [] },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async conversations(@Req() req: { user?: { id?: unknown; role?: string } }) {
    const u = req.user;
    if (!u?.id) throw new ForbiddenException();
    return this.chatService.getConversations({ id: u.id, role: String(u.role || '') });
  }

  /** GET /api/chat/messages?patientId= | ?peerRole=doctor&peerId= */
  @UseGuards(JwtAuthGuard)
  @Get('messages')
  async messagesQuery(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Query('patientId') patientId?: string,
    @Query('peerRole') peerRole?: string,
    @Query('peerId') peerId?: string,
    @Query('groupId') groupId?: string,
    @Query('before') before?: string,
    @Query('limit') limit?: string,
  ) {
    const u = req.user;
    if (!u?.id) throw new ForbiddenException();
    const lim = limit ? parseInt(limit, 10) : 50;
    if (groupId) {
      return this.chatService.getMessagesGroup({ id: u.id, role: String(u.role || '') }, groupId, before, lim);
    }
    if (peerRole && peerId) {
      if (peerRole !== 'doctor' && peerRole !== 'nurse') {
        throw new BadRequestException('peerRole invalide');
      }
      if (String(u.role) === 'patient') {
        return this.chatService.getMessagesPatientStaff(
          { id: u.id, role: String(u.role || '') },
          peerRole,
          peerId,
          before,
          lim,
        );
      }
      return this.chatService.getMessagesPeer({ id: u.id, role: String(u.role || '') }, peerRole, peerId, before, lim);
    }
    if (patientId) {
      return this.chatService.getMessages({ id: u.id, role: String(u.role || '') }, patientId, before, lim);
    }
    throw new BadRequestException('Paramètre patientId ou peerRole+peerId requis');
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages/:patientId')
  async messages(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Param('patientId') patientId: string,
    @Query('before') before?: string,
    @Query('limit') limit?: string,
  ) {
    const u = req.user;
    if (!u?.id) throw new ForbiddenException();
    return this.chatService.getMessages(
      { id: u.id, role: String(u.role || '') },
      patientId,
      before,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('messages')
  async post(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Body()
    body: {
      patientId?: string;
      body?: string;
      kind?: 'text' | 'call';
      peerRole?: 'doctor' | 'nurse';
      peerId?: string;
      groupId?: string;
    },
  ) {
    const u = req.user;
    if (!u?.id) throw new ForbiddenException();
    return this.chatService.postMessage(
      { id: u.id, role: String(u.role || '') },
      {
        text: body.body ?? '',
        body: body.body,
        kind: body.kind,
        patientId: body.patientId,
        peerRole: body.peerRole,
        peerId: body.peerId,
        groupId: body.groupId,
      },
    );
  }

  /** POST multipart : champ file (audio) + patientId et/ou peerRole + peerId (même logique que POST messages JSON). */
  @UseGuards(JwtAuthGuard)
  @Post('messages/voice')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: chatVoiceStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async postVoice(
    @Req() req: { user?: { id?: unknown; role?: string }; body?: Record<string, string> },
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    const u = req.user;
    if (!u?.id) throw new ForbiddenException();
    if (!file?.filename) throw new BadRequestException('Fichier audio requis');
    return this.chatService.postVoiceMessage(
      { id: u.id, role: String(u.role || '') },
      file,
      {
        patientId: req.body?.patientId,
        peerRole: req.body?.peerRole,
        peerId: req.body?.peerId,
      },
    );
  }

  /** Photo, vidéo ou document : multipart file + category (image|video|document) + caption optionnel + routage comme POST messages. */
  @UseGuards(JwtAuthGuard)
  @Post('messages/media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: chatMediaStorage,
      limits: { fileSize: 40 * 1024 * 1024 },
    }),
  )
  async postMedia(
    @Req() req: { user?: { id?: unknown; role?: string }; body?: Record<string, string> },
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    const u = req.user;
    if (!u?.id) throw new ForbiddenException();
    if (!file?.filename) throw new BadRequestException('Fichier requis');
    return this.chatService.postMediaMessage(
      { id: u.id, role: String(u.role || '') },
      file,
      {
        category: req.body?.category || '',
        caption: req.body?.caption,
        patientId: req.body?.patientId,
        peerRole: req.body?.peerRole,
        peerId: req.body?.peerId,
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read/:patientId')
  async read(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Param('patientId') patientId: string,
  ) {
    const u = req.user;
    if (!u?.id) throw new ForbiddenException();
    return this.chatService.markRead({ id: u.id, role: String(u.role || '') }, patientId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-patient-staff')
  async readPatientStaff(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Query('peerRole') peerRole?: string,
    @Query('peerId') peerId?: string,
  ) {
    const u = req.user;
    if (!u?.id) throw new ForbiddenException();
    if (!peerRole || !peerId || (peerRole !== 'doctor' && peerRole !== 'nurse')) {
      throw new BadRequestException('peerRole et peerId requis');
    }
    return this.chatService.markReadPatientStaff({ id: u.id, role: String(u.role || '') }, peerRole, peerId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-peer')
  async readPeer(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Query('peerRole') peerRole?: string,
    @Query('peerId') peerId?: string,
  ) {
    const u = req.user;
    if (!u?.id) throw new ForbiddenException();
    if (!peerRole || !peerId || (peerRole !== 'doctor' && peerRole !== 'nurse')) {
      throw new BadRequestException('peerRole et peerId requis');
    }
    return this.chatService.markReadPeer({ id: u.id, role: String(u.role || '') }, peerRole, peerId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-group/:groupId')
  async readGroup(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Param('groupId') groupId: string,
  ) {
    const u = req.user;
    if (!u?.id) throw new ForbiddenException();
    return this.chatService.markReadGroup({ id: u.id, role: String(u.role || '') }, groupId);
  }
}
