import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MailService } from './mail.service';
import type { MailFolder } from './schemas/mail-user-state.schema';

type ReqUser = { user?: { id?: unknown; role?: string } };

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  private u(req: ReqUser) {
    const user = req.user;
    if (!user?.id) throw new ForbiddenException();
    return user as { id: unknown; role: string };
  }

  /** Destinataires autorisés selon le rôle (care team, même service, etc.). */
  @UseGuards(JwtAuthGuard)
  @Get('recipients')
  async recipients(@Req() req: ReqUser) {
    return this.mailService.getAllowedRecipients(this.u(req));
  }

  @UseGuards(JwtAuthGuard)
  @Get('storage')
  async storage(@Req() req: ReqUser) {
    return this.mailService.getStorageStats(this.u(req));
  }

  @UseGuards(JwtAuthGuard)
  @Get('counts')
  async counts(@Req() req: ReqUser) {
    return this.mailService.getFolderCounts(this.u(req));
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages')
  async list(
    @Req() req: ReqUser,
    @Query('folder') folder?: string,
    @Query('starred') starred?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.mailService.listMessages(this.u(req), {
      folder,
      starred: starred === 'true' || starred === '1',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 30,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages/:stateId')
  async one(@Req() req: ReqUser, @Param('stateId') stateId: string) {
    return this.mailService.getMessage(this.u(req), stateId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async send(
    @Req() req: ReqUser,
    @Body()
    body: {
      to: { role: 'patient' | 'doctor' | 'nurse'; id: string }[];
      subject: string;
      body: string;
      attachmentSizeBytes?: number;
    },
  ) {
    return this.mailService.send(this.u(req), body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('drafts')
  async draft(
    @Req() req: ReqUser,
    @Body()
    body: {
      to?: { role: 'patient' | 'doctor' | 'nurse'; id: string }[];
      subject?: string;
      body?: string;
      attachmentSizeBytes?: number;
    },
  ) {
    return this.mailService.saveDraft(this.u(req), body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('drafts/:messageId/send')
  async sendDraft(@Req() req: ReqUser, @Param('messageId') messageId: string) {
    return this.mailService.sendDraft(this.u(req), messageId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('drafts/:messageId')
  async getDraft(@Req() req: ReqUser, @Param('messageId') messageId: string) {
    return this.mailService.getDraft(this.u(req), messageId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('drafts/:messageId')
  async updateDraft(
    @Req() req: ReqUser,
    @Param('messageId') messageId: string,
    @Body()
    body: {
      to?: { role: 'patient' | 'doctor' | 'nurse'; id: string }[];
      subject?: string;
      body?: string;
      attachmentSizeBytes?: number;
    },
  ) {
    return this.mailService.updateDraft(this.u(req), messageId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('messages/:stateId/read')
  async markRead(
    @Req() req: ReqUser,
    @Param('stateId') stateId: string,
    @Body() body: { read?: boolean },
  ) {
    return this.mailService.markRead(this.u(req), stateId, body.read !== false);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('messages/:stateId/move')
  async move(
    @Req() req: ReqUser,
    @Param('stateId') stateId: string,
    @Body() body: { folder: MailFolder },
  ) {
    return this.mailService.moveFolder(this.u(req), stateId, body.folder);
  }

  /** Suppression : brouillon effacé ; corbeille/indésirables → définitif ; sinon → corbeille. */
  @UseGuards(JwtAuthGuard)
  @Delete('messages/:stateId')
  async deleteMessage(@Req() req: ReqUser, @Param('stateId') stateId: string) {
    return this.mailService.deleteMessage(this.u(req), stateId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('trash/empty')
  async emptyTrash(@Req() req: ReqUser) {
    return this.mailService.emptyTrash(this.u(req));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('messages/:stateId/star')
  async star(
    @Req() req: ReqUser,
    @Param('stateId') stateId: string,
    @Body() body: { starred: boolean },
  ) {
    return this.mailService.setStar(this.u(req), stateId, !!body.starred);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('messages/:stateId/snooze')
  async snooze(
    @Req() req: ReqUser,
    @Param('stateId') stateId: string,
    @Body() body: { until: string | null },
  ) {
    const until = body.until ? new Date(body.until) : null;
    return this.mailService.snooze(this.u(req), stateId, until);
  }

  @UseGuards(JwtAuthGuard)
  @Get('labels')
  async labels(@Req() req: ReqUser) {
    return this.mailService.listLabels(this.u(req));
  }

  @UseGuards(JwtAuthGuard)
  @Post('labels')
  async createLabel(
    @Req() req: ReqUser,
    @Body() body: { name: string; color?: string },
  ) {
    return this.mailService.createLabel(this.u(req), body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('labels/:labelId')
  async deleteLabel(@Req() req: ReqUser, @Param('labelId') labelId: string) {
    return this.mailService.deleteLabel(this.u(req), labelId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('messages/:stateId/labels/:labelId')
  async addLabel(
    @Req() req: ReqUser,
    @Param('stateId') stateId: string,
    @Param('labelId') labelId: string,
  ) {
    return this.mailService.addLabelToMessage(this.u(req), stateId, labelId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('messages/:stateId/labels/:labelId')
  async removeLabel(
    @Req() req: ReqUser,
    @Param('stateId') stateId: string,
    @Param('labelId') labelId: string,
  ) {
    return this.mailService.removeLabelFromMessage(this.u(req), stateId, labelId);
  }
}
