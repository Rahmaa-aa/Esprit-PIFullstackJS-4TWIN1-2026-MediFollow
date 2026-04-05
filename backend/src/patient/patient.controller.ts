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

@Controller('patients')
export class PatientController {
  constructor(private patientService: PatientService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any) {
    return this.patientService.create(body);
  }

  @Get()
  async findAll() {
    return this.patientService.findAll();
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.patientService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.patientService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.patientService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    return this.patientService.toggleActive(id);
  }

  @Get(':id/care-team')
  async getCareTeam(@Param('id') id: string) {
    return this.patientService.getCareTeam(id);
  }
}
