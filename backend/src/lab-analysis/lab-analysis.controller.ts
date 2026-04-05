import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LabAnalysisService } from './lab-analysis.service';

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

const imageMime = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const labUpload = memoryStorage();

@Controller('lab-analysis')
export class LabAnalysisController {
  constructor(private labAnalysisService: LabAnalysisService) {}

  @UseGuards(JwtAuthGuard)
  @Post('analyze')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: labUpload,
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (imageMime.has(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Image requise (JPEG, PNG ou WebP).') as any, false);
      },
    }),
  )
  async analyze(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (req.user?.role !== 'patient') {
      throw new ForbiddenException('Réservé aux patients.');
    }
    const patientId = userIdToString(req.user?.id);
    if (!patientId || patientId === 'undefined') {
      throw new BadRequestException('Identifiant patient invalide');
    }
    if (!file?.buffer?.length) {
      throw new BadRequestException('Fichier image manquant.');
    }
    const { record, outcome } = await this.labAnalysisService.analyzeImageBuffer(
      file.buffer,
      file.mimetype,
      patientId,
    );
    return {
      id: String(record._id),
      status: outcome.status,
      classificationConfidence: outcome.classificationConfidence,
      ocrConfidence: outcome.ocrConfidence,
      method: outcome.method,
      textPreview: outcome.textPreview,
      anomalyStrength: outcome.anomalyStrength,
      matchedAnomalyHints: outcome.matchedAnomalyHints,
      matchedNormalHints: outcome.matchedNormalHints,
      parametersCompared: outcome.parametersCompared,
      conditionHints: outcome.conditionHints,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-history')
  async myHistory(
    @Req() req: { user?: { id?: unknown; role?: string } },
    @Query('limit') limit?: string,
  ) {
    if (req.user?.role !== 'patient') {
      throw new ForbiddenException('Réservé aux patients.');
    }
    const patientId = userIdToString(req.user?.id);
    if (!patientId || patientId === 'undefined') {
      throw new BadRequestException('Identifiant patient invalide');
    }
    const n = limit ? parseInt(limit, 10) : 20;
    const rows = await this.labAnalysisService.listForPatient(patientId, Number.isFinite(n) ? n : 20);
    return rows.map((r) => {
      const sf = (r as { structuredFinding?: { parameters?: unknown[]; conditionHints?: unknown[] } })
        .structuredFinding;
      return {
        id: String(r._id),
        status: r.status,
        classificationConfidence: r.classificationConfidence,
        ocrConfidence: r.ocrConfidence,
        method: r.method,
        textPreview: r.textPreview,
        createdAt: (r as { createdAt?: Date }).createdAt,
        anomalyStrength: (r as { anomalyStrength?: string }).anomalyStrength ?? 'none',
        matchedAnomalyHints: (r as { matchedAnomalyHints?: string[] }).matchedAnomalyHints ?? [],
        matchedNormalHints: (r as { matchedNormalHints?: string[] }).matchedNormalHints ?? [],
        parametersCompared: Array.isArray(sf?.parameters) ? sf.parameters : [],
        conditionHints: Array.isArray(sf?.conditionHints) ? sf.conditionHints : [],
      };
    });
  }
}
