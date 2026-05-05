import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ML_CNN_MODEL_IDS, MlCnnService } from './ml-cnn.service';

const imageMime = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/gif',
]);
const upload = memoryStorage();
const allowedRoles = new Set(['doctor', 'patient', 'nurse', 'admin', 'superadmin']);
type JwtReqUser = { role?: string };

@Controller('ml-cnn')
export class MlCnnController {
  constructor(private readonly mlCnn: MlCnnService) {}

  @UseGuards(JwtAuthGuard)
  @Get('models')
  listModels(@Req() req: { user?: JwtReqUser }) {
    if (!allowedRoles.has(String(req.user?.role))) {
      throw new ForbiddenException('Accès réservé au personnel médical et aux patients.');
    }
    return {
      configured: this.mlCnn.isConfigured(),
      models: this.mlCnn.models(),
      ...(this.mlCnn.isConfigured()
        ? {}
        : {
            message:
              'Configurer ML_SERVICE_URL (URL du service Render FastAPI ml-service) pour activer les prédictions CNN.',
          }),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('predict/:modelId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: upload,
      limits: { fileSize: 16 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (imageMime.has(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Image requise (JPEG, PNG, WebP, etc.)') as never, false);
      },
    }),
  )
  async predict(
    @Param('modelId') modelId: string,
    @Req() req: { user?: JwtReqUser },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!allowedRoles.has(String(req.user?.role))) {
      throw new ForbiddenException('Accès réservé au personnel médical et aux patients.');
    }
    if (!ML_CNN_MODEL_IDS.includes(modelId as never)) {
      throw new BadRequestException(`modelId doit être un de : ${ML_CNN_MODEL_IDS.join(', ')}`);
    }
    if (!file?.buffer?.length) {
      throw new BadRequestException('Fichier image manquant.');
    }

    const result = await this.mlCnn.predictFromBuffer(
      modelId,
      file.buffer,
      file.originalname || 'scan.jpg',
    );
    return result;
  }
}
