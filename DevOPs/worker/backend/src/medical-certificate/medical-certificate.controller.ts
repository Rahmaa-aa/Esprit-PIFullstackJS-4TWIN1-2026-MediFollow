import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MedicalCertificateService } from './medical-certificate.service';

@Controller('medical-certificates')
export class MedicalCertificateController {
  constructor(private readonly medicalCertificateService: MedicalCertificateService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: { patientId?: string }, @Req() req: { user: any }) {
    return this.medicalCertificateService.createFromPatientMedications(body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  listMine(@Req() req: { user: any }) {
    return this.medicalCertificateService.listMineAsPatient(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctor/patient/:patientId')
  listForPatient(@Param('patientId') patientId: string, @Req() req: { user: any }) {
    return this.medicalCertificateService.listForPatientAsDoctor(patientId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Req() req: { user: any }, @Res() res: Response) {
    const buf = await this.medicalCertificateService.buildPdfBuffer(id, req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="medical-certificate-${encodeURIComponent(id)}.pdf"`,
    );
    res.send(buf);
  }
}
