import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from '../notification/notification.service';
import { BrainTumorService } from './brain-tumor.service';

const imageMime = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff', 'image/gif']);
const upload = memoryStorage();

type JwtReqUser = { role?: string; id?: string };

@Controller('brain-tumor')
export class BrainTumorController {
  constructor(
    private readonly brainTumorService: BrainTumorService,
    private readonly notificationService: NotificationService,
  ) {}

  /** Historique (query) — préféré pour éviter tout souci de routage avec les segments dynamiques. */
  @UseGuards(JwtAuthGuard)
  @Get('records')
  async listRecordsQuery(
    @Req() req: { user?: JwtReqUser },
    @Query('patientId') patientId: string,
    @Query('limit') limit?: string,
  ) {
    return this.runListRecords(req, patientId, limit);
  }

  /** Historique (path) — alias. */
  @UseGuards(JwtAuthGuard)
  @Get('patient/:patientId/records')
  async listRecordsPath(
    @Req() req: { user?: JwtReqUser },
    @Param('patientId') patientId: string,
    @Query('limit') limit?: string,
  ) {
    return this.runListRecords(req, patientId, limit);
  }

  private async runListRecords(
    req: { user?: JwtReqUser },
    patientId: string,
    limit?: string,
  ) {
    const role = req.user?.role;
    if (role !== 'doctor' && role !== 'patient') {
      throw new ForbiddenException();
    }
    if (!patientId || !String(patientId).trim()) {
      throw new BadRequestException('patientId requis.');
    }
    if (role === 'patient') {
      if (String(req.user?.id) !== String(patientId)) {
        throw new ForbiddenException();
      }
    } else {
      await this.brainTumorService.assertDoctorAssignedToPatient(String(req.user!.id), patientId);
    }
    const n = limit ? parseInt(limit, 10) : 30;
    return this.brainTumorService.listRecordsForPatient(patientId, Number.isFinite(n) ? n : 30);
  }

  /** Analyse IRM — médecins et patients (patient : notification à l’équipe soignante). */
  @UseGuards(JwtAuthGuard)
  @Post('predict')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: upload,
      limits: { fileSize: 16 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (imageMime.has(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Image requise (JPEG, PNG, WebP, etc.).') as never, false);
      },
    }),
  )
  async predict(
    @Req() req: { user?: JwtReqUser; body?: { patientId?: string } },
    @Query('patientId') patientIdFromQuery?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const role = req.user?.role;
    if (role !== 'doctor' && role !== 'patient') {
      throw new ForbiddenException('Réservé aux médecins et aux patients.');
    }
    if (!file?.buffer?.length) {
      throw new BadRequestException('Fichier image manquant.');
    }
    const result = await this.brainTumorService.predictFromBuffer(file.buffer, {
      mimetype: file.mimetype,
      originalname: file.originalname,
    });

    let recordId: string | undefined;

    if (role === 'patient' && req.user?.id) {
      const pid = String(req.user.id);
      try {
        const saved = await this.brainTumorService.persistAnalysis(pid, result, {
          source: 'patient',
          originalname: file.originalname,
        });
        recordId = saved.id;
      } catch (e) {
        console.error('[brain-tumor] persistAnalysis patient:', e);
      }
      try {
        await this.notificationService.notifyCareTeamBrainMriAnalysis({
          patientId: new Types.ObjectId(pid),
          prediction: result.prediction,
          probability: result.probability,
        });
      } catch (e) {
        console.error('[brain-tumor] notifyCareTeamBrainMriAnalysis:', e);
      }
    }

    if (role === 'doctor' && req.user?.id) {
      const raw = req.body?.patientId ?? patientIdFromQuery;
      const savePid = raw != null ? String(raw).trim() : '';
      if (savePid) {
        await this.brainTumorService.assertDoctorAssignedToPatient(String(req.user.id), savePid);
        try {
          const saved = await this.brainTumorService.persistAnalysis(savePid, result, {
            source: 'doctor',
            doctorId: String(req.user.id),
            originalname: file.originalname,
          });
          recordId = saved.id;
        } catch (e) {
          console.error('[brain-tumor] persistAnalysis doctor:', e);
        }
      }
    }

    return recordId ? { ...result, recordId } : result;
  }
}
