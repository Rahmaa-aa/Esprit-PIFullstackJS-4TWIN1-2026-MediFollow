import {
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from './notification.service';

function staffId(req: { user?: { id?: unknown; role?: string } }) {
  const u = req.user;
  if (!u?.id) return '';
  return String(u.id);
}

/** JWT admin / superadmin → rôle stocké `admin` pour les notifications. */
function notifRole(req: { user?: { role?: string } }): 'doctor' | 'nurse' | 'patient' | 'admin' | null {
  const r = req.user?.role;
  if (r === 'superadmin' || r === 'admin') return 'admin';
  if (r === 'doctor' || r === 'nurse' || r === 'patient') return r;
  return null;
}

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myNotifications(@Request() req: { user?: { id?: unknown; role?: string } }) {
    const role = notifRole(req);
    if (!role) {
      throw new ForbiddenException('Non autorisé');
    }
    const id = staffId(req);
    return this.notificationService.getMergedNotifications(id, role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  async markAll(@Request() req: { user?: { id?: unknown; role?: string } }) {
    const role = notifRole(req);
    if (!role) {
      throw new ForbiddenException();
    }
    await this.notificationService.markAllRead(staffId(req), role);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('all')
  async deleteAll(@Request() req: { user?: { id?: unknown; role?: string } }) {
    const role = notifRole(req);
    if (!role) {
      throw new ForbiddenException();
    }
    await this.notificationService.deleteAllForUser(staffId(req), role);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteOne(
    @Request() req: { user?: { id?: unknown; role?: string } },
    @Param('id') id: string,
  ) {
    const role = notifRole(req);
    if (!role) {
      throw new ForbiddenException();
    }
    if (String(id).startsWith('virt-')) {
      return { ok: true, skipped: true };
    }
    return this.notificationService.deleteOne(id, staffId(req), role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markOne(
    @Request() req: { user?: { id?: unknown; role?: string } },
    @Param('id') id: string,
  ) {
    const role = notifRole(req);
    if (!role) {
      throw new ForbiddenException();
    }
    if (String(id).startsWith('virt-')) {
      return { ok: true, skipped: true };
    }
    return this.notificationService.markRead(id, staffId(req), role);
  }
}
