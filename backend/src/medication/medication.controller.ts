import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { MedicationService } from './medication.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('medications')
export class MedicationController {
  constructor(private medicationService: MedicationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: Record<string, unknown>, @Req() req: { user: any }) {
    return this.medicationService.create(body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('patient/:id')
  getByPatient(@Param('id') id: string, @Req() req: { user: any }) {
    return this.medicationService.getByPatient(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/toggle-taken')
  toggleTaken(
    @Param('id') id: string,
    @Body() body: { localDate?: string; slotIndex?: number; recordedAt?: string },
    @Req() req: { user: any },
  ) {
    return this.medicationService.toggleTakenToday(id, req.user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() req: { user: any }) {
    return this.medicationService.update(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: any }) {
    return this.medicationService.remove(id, req.user);
  }
}
