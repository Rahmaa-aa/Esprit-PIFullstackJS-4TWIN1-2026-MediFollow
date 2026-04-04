import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Post()
  create(@Body() body: any) {
    return this.appointmentService.create(body);
  }

  /** Demandes en attente de validation (admin / superadmin) */
  @UseGuards(JwtAuthGuard)
  @Get('admin/pending')
  getPending(@Req() req: { user?: { role?: string } }) {
    const role = req.user?.role;
    if (!role || !['admin', 'superadmin'].includes(role)) {
      throw new ForbiddenException('Accès administrateur requis');
    }
    return this.appointmentService.findPending();
  }

  /** RDV confirmés à venir (admin / superadmin) */
  @UseGuards(JwtAuthGuard)
  @Get('admin/confirmed')
  getAdminConfirmed(@Req() req: { user?: { role?: string } }) {
    const role = req.user?.role;
    if (!role || !['admin', 'superadmin'].includes(role)) {
      throw new ForbiddenException('Accès administrateur requis');
    }
    return this.appointmentService.findConfirmedUpcomingForAdmin();
  }

  /** RDV confirmés à venir pour le médecin connecté */
  @UseGuards(JwtAuthGuard)
  @Get('doctor/upcoming')
  getDoctorUpcoming(@Req() req: { user?: { id?: string; role?: string } }) {
    if (req.user?.role !== 'doctor') {
      throw new ForbiddenException('Accès réservé aux médecins');
    }
    return this.appointmentService.findUpcomingByDoctor(String(req.user.id));
  }

  /** RDV confirmés pour le mois affiché (calendrier médecin) — param YYYY-MM */
  @UseGuards(JwtAuthGuard)
  @Get('doctor/month/:yearMonth')
  getDoctorMonth(@Req() req: { user?: { id?: string; role?: string } }, @Param('yearMonth') yearMonth: string) {
    if (req.user?.role !== 'doctor') {
      throw new ForbiddenException('Accès réservé aux médecins');
    }
    return this.appointmentService.findConfirmedByDoctorForMonth(String(req.user.id), yearMonth);
  }

  /** RDV des patients du même département que le coordinateur (JWT carecoordinator). */
  @UseGuards(JwtAuthGuard)
  @Get('coordinator/my-department')
  getCoordinatorDepartmentAppointments(@Req() req: { user?: { role?: string; department?: string } }) {
    if (req.user?.role !== 'carecoordinator') {
      throw new ForbiddenException('Accès réservé aux coordinateurs de soins');
    }
    const dept = String(req.user?.department || '').trim();
    if (!dept) {
      throw new BadRequestException('Aucun département assigné à votre profil');
    }
    return this.appointmentService.findForCoordinatorDepartment(dept);
  }

  @Get('patient/:id')
  getByPatient(@Param('id') id: string) {
    return this.appointmentService.getByPatient(id);
  }

  @Get('patient/:id/upcoming')
  getUpcoming(@Param('id') id: string) {
    return this.appointmentService.getUpcoming(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.appointmentService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(id);
  }
}
