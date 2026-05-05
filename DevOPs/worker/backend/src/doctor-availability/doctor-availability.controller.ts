import { Controller, Get, Put, Param, Body, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DoctorAvailabilityService } from './doctor-availability.service';

@Controller('doctor-availability')
@UseGuards(JwtAuthGuard)
export class DoctorAvailabilityController {
  constructor(private readonly doctorAvailabilityService: DoctorAvailabilityService) {}

  @Get('me/:yearMonth')
  getMine(@Req() req: { user?: { id?: string; role?: string } }, @Param('yearMonth') yearMonth: string) {
    if (req.user?.role !== 'doctor') {
      throw new ForbiddenException('Accès réservé aux médecins');
    }
    const ym = String(yearMonth || '').trim();
    return this.doctorAvailabilityService.getMonth(String(req.user.id), ym);
  }

  @Put('me/:yearMonth')
  setMine(
    @Req() req: { user?: { id?: string; role?: string } },
    @Param('yearMonth') yearMonth: string,
    @Body() body: { slots?: { date: string; times?: string[]; ranges?: { from: string; to: string }[] }[] },
  ) {
    if (req.user?.role !== 'doctor') {
      throw new ForbiddenException('Accès réservé aux médecins');
    }
    const ym = String(yearMonth || '').trim();
    return this.doctorAvailabilityService.setMonth(String(req.user.id), ym, body?.slots || []);
  }
}
