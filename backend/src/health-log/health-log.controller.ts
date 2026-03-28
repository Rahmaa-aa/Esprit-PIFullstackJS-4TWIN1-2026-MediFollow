import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { HealthLogService } from './health-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('health-logs')
export class HealthLogController {
  constructor(private healthLogService: HealthLogService) {}

  // POST requires auth to identify the submitting patient
  @UseGuards(JwtAuthGuard)
  @Post()
  async submit(@Request() req: any, @Body() body: any) {
    const patientId = body.patientId || req.user?.sub || req.user?.id;
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
