import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('patients')
export class PatientController {
  constructor(private patientService: PatientService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: { user?: { role?: string; id?: unknown; department?: string } }, @Body() body: any) {
    return this.patientService.create(body, req.user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async findAll(@Req() req: { user?: { role?: string; id?: unknown; department?: string } }) {
    return this.patientService.findAll(req.user);
  }

  /** Avant :id — GET /api/patients/doctor/my-patients */
  @UseGuards(JwtAuthGuard)
  @Get('doctor/my-patients')
  async myPatientsForDoctor(@Req() req: { user?: { id: unknown; role: string } }) {
    const user = req.user;
    if (!user || user.role !== 'doctor') {
      throw new ForbiddenException('Accès réservé aux médecins');
    }
    return this.patientService.findByAssignedDoctorId(String(user.id));
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: { user?: { role?: string; id?: unknown; department?: string } }) {
    return this.patientService.findById(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Req() req: { user?: { role?: string; id?: unknown; department?: string } },
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.patientService.update(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Req() req: { user?: { role?: string; id?: unknown; department?: string } }, @Param('id') id: string) {
    return this.patientService.delete(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/toggle-active')
  async toggleActive(@Req() req: { user?: { role?: string; id?: unknown; department?: string } }, @Param('id') id: string) {
    return this.patientService.toggleActive(id, req.user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/care-team')
  async getCareTeam(@Param('id') id: string, @Req() req: { user?: { role?: string; id?: unknown; department?: string } }) {
    return this.patientService.getCareTeam(id, req.user);
  }
}
