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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuestionnaireService } from './questionnaire.service';

function isAdmin(role?: string) {
  return role === 'admin' || role === 'superadmin';
}

@Controller('questionnaires')
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  // ─── Admin ───────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('admin/templates')
  async adminTemplates(@Req() req: { user?: { role?: string } }) {
    if (!isAdmin(req.user?.role)) throw new ForbiddenException();
    return this.questionnaireService.adminListTemplates();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/templates')
  async adminCreateTemplate(@Req() req: { user?: { role?: string } }, @Body() body: any) {
    if (!isAdmin(req.user?.role)) throw new ForbiddenException();
    return this.questionnaireService.adminCreateTemplate(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/templates/:id')
  async adminUpdateTemplate(
    @Req() req: { user?: { role?: string } },
    @Param('id') id: string,
    @Body() body: any,
  ) {
    if (!isAdmin(req.user?.role)) throw new ForbiddenException();
    return this.questionnaireService.adminUpdateTemplate(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/templates/:id')
  async adminDeleteTemplate(@Req() req: { user?: { role?: string } }, @Param('id') id: string) {
    if (!isAdmin(req.user?.role)) throw new ForbiddenException();
    return this.questionnaireService.adminDeleteTemplate(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/protocols')
  async adminProtocols(@Req() req: { user?: { role?: string } }) {
    if (!isAdmin(req.user?.role)) throw new ForbiddenException();
    return this.questionnaireService.adminListProtocols();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/protocols')
  async adminCreateProtocol(@Req() req: { user?: { role?: string } }, @Body() body: any) {
    if (!isAdmin(req.user?.role)) throw new ForbiddenException();
    return this.questionnaireService.adminCreateProtocol(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/protocols/:id')
  async adminUpdateProtocol(
    @Req() req: { user?: { role?: string } },
    @Param('id') id: string,
    @Body() body: any,
  ) {
    if (!isAdmin(req.user?.role)) throw new ForbiddenException();
    return this.questionnaireService.adminUpdateProtocol(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/protocols/:id')
  async adminDeleteProtocol(@Req() req: { user?: { role?: string } }, @Param('id') id: string) {
    if (!isAdmin(req.user?.role)) throw new ForbiddenException();
    return this.questionnaireService.adminDeleteProtocol(id);
  }

  // ─── Doctor ───────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post('doctor/assign-protocol')
  async doctorAssign(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Body() body: { patientId: string; protocolTemplateId: string; dischargeDate: string },
  ) {
    if (req.user?.role !== 'doctor') throw new ForbiddenException();
    return this.questionnaireService.doctorAssignProtocol(String(req.user.id), body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('doctor/add-addon')
  async doctorAddon(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Body() body: { patientId: string; questionnaireTemplateId: string; dueDate?: string },
  ) {
    if (req.user?.role !== 'doctor') throw new ForbiddenException();
    return this.questionnaireService.doctorAddAddon(String(req.user.id), body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctor/patient/:patientId/summary')
  async doctorSummary(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Param('patientId') patientId: string,
  ): Promise<Record<string, unknown>> {
    if (req.user?.role !== 'doctor') throw new ForbiddenException();
    return this.questionnaireService.doctorPatientSummary(String(req.user.id), patientId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctor/patient/:patientId/submission/:submissionId')
  async doctorSubmissionDetail(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Param('patientId') patientId: string,
    @Param('submissionId') submissionId: string,
  ): Promise<Record<string, unknown>> {
    if (req.user?.role !== 'doctor') throw new ForbiddenException();
    return this.questionnaireService.doctorGetSubmissionDetail(String(req.user.id), patientId, submissionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctor/patient/:patientId/protocols')
  async doctorProtocols(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Param('patientId') patientId: string,
  ) {
    if (req.user?.role !== 'doctor') throw new ForbiddenException();
    return this.questionnaireService.doctorProtocolsForPatientDepartment(String(req.user.id), patientId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctor/patient/:patientId/templates')
  async doctorTemplates(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Param('patientId') patientId: string,
  ) {
    if (req.user?.role !== 'doctor') throw new ForbiddenException();
    return this.questionnaireService.doctorTemplatesForPatientDepartment(String(req.user.id), patientId);
  }

  // ─── Patient ───────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('me/pending')
  async patientPending(@Req() req: { user?: { id?: unknown; role?: string } }) {
    if (req.user?.role !== 'patient') throw new ForbiddenException();
    return this.questionnaireService.patientPending(String(req.user.id));
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/schedule')
  async patientSchedule(@Req() req: { user?: { id?: unknown; role?: string } }) {
    if (req.user?.role !== 'patient') throw new ForbiddenException();
    return this.questionnaireService.patientSchedule(String(req.user.id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/submit')
  async patientSubmit(@Req() req: { user?: { id?: unknown; role?: string } }, @Body() body: any) {
    if (req.user?.role !== 'patient') throw new ForbiddenException();
    return this.questionnaireService.patientSubmit(String(req.user.id), body);
  }
}
