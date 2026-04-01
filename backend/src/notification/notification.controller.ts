import { Controller, Get, Patch, Param, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from './notification.service';

function staffId(req: { user?: { id?: unknown; role?: string } }) {
  const u = req.user;
  if (!u?.id) return '';
  return String(u.id);
}

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myNotifications(@Request() req: { user?: { id?: unknown; role?: string } }) {
    const role = req.user?.role;
    if (role !== 'doctor' && role !== 'nurse') {
      throw new ForbiddenException('Réservé au personnel soignant');
    }
    const id = staffId(req);
    const items = await this.notificationService.listForStaff(id, role);
    const unread = await this.notificationService.countUnread(id, role);
    return { items, unread };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  async markAll(@Request() req: { user?: { id?: unknown; role?: string } }) {
    const role = req.user?.role;
    if (role !== 'doctor' && role !== 'nurse') {
      throw new ForbiddenException();
    }
    await this.notificationService.markAllRead(staffId(req), role);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markOne(
    @Request() req: { user?: { id?: unknown; role?: string } },
    @Param('id') id: string,
  ) {
    const role = req.user?.role;
    if (role !== 'doctor' && role !== 'nurse') {
      throw new ForbiddenException();
    }
    return this.notificationService.markRead(id, staffId(req), role);
  }
}
