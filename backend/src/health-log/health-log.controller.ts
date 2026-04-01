import { BadRequestException, Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { HealthLogService } from './health-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

function userIdToString(raw: unknown): string | undefined {
  if (raw == null) return undefined;
  if (typeof raw === 'object' && raw !== null && '$oid' in (raw as object)) {
    return String((raw as { $oid: string }).$oid);
  }
  if (typeof raw === 'object' && raw !== null && 'toString' in raw) {
    const s = (raw as { toString: () => string }).toString();
    if (s && s !== '[object Object]') return s;
  }
  return String(raw);
}

@Controller('health-logs')
export class HealthLogController {
  constructor(private healthLogService: HealthLogService) {}

  // POST requires auth — pour un patient connecté, l’ID vient toujours du JWT (pas du body)
  @UseGuards(JwtAuthGuard)
  @Post()
  async submit(@Request() req: any, @Body() body: any) {
    let patientId: string | undefined;
    if (req.user?.role === 'patient') {
      patientId = userIdToString(req.user?.id ?? req.user?.sub);
    } else {
      patientId = userIdToString(body.patientId ?? req.user?.id ?? req.user?.sub);
    }
    if (!patientId || patientId === 'undefined') {
      throw new BadRequestException('Identifiant patient invalide');
    }
    return this.healthLogService.submit(patientId, body);
  }

  // GET endpoints do NOT require auth — patientId is in the URL
  @Get('patient/:id')
  async getHistory(@Param('id') id: string) {
    return this.healthLogService.getHistory(id);
  }

  @Get('patient/:id/latest')
  async getLatest(@Param('id') id: string) {
    // Returns most recent log (not strictly UTC today)
    const log = await this.healthLogService.getLatest(id);
    return log ?? null;
  }
}
