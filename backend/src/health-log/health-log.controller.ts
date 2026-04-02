import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Get('nurse/pending-alerts')
  async nursePendingAlerts(@Request() req: any) {
    return this.healthLogService.listOpenAlertsForNurse(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctor/nurse-escalations')
  async doctorNurseEscalations(@Request() req: any, @Query('status') status?: string) {
    return this.healthLogService.listDoctorNurseEscalations(req.user, status);
  }

  // GET endpoints do NOT require auth — patientId is in the URL
  // Routes les plus spécifiques en premier (évite tout conflit de matching).
  @Get('patient/:id/latest-doctor-consigne')
  async getLatestDoctorConsigne(@Param('id') id: string) {
    return this.healthLogService.getLatestDoctorResolutionNote(id);
  }

  @Get('patient/:id/latest')
  async getLatest(@Param('id') id: string) {
    // Returns most recent log (not strictly UTC today)
    const log = await this.healthLogService.getLatest(id);
    return log ?? null;
  }

  @Get('patient/:id')
  async getHistory(@Param('id') id: string) {
    return this.healthLogService.getHistory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/escalate-to-doctor')
  async escalateToDoctor(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { note?: string },
  ) {
    return this.healthLogService.escalateToDoctor(req.user, id, body?.note);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/resolve')
  async resolveEscalation(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { resolutionNote?: string },
  ) {
    return this.healthLogService.resolveEscalation(req.user, id, body?.resolutionNote);
  }
}
