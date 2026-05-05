import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Readable } from 'stream';
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { CLOUDINARY, CloudinaryClient } from './cloudinary.provider';
import { cloudinaryUploadAgent } from './cloudinary-upload-agent';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  resourceType?: string;
}

function isLikelyTransientNetworkError(message: string): boolean {
  const m = String(message || '');
  return /socket|TLS|ECONNRESET|ETIMEDOUT|EPIPE|EAI_AGAIN|ENOTFOUND|disconnected|network|timed out|ECONNREFUSED|EHOSTUNREACH|ENETUNREACH|certificate|_SSL_|ssl/i.test(
    m,
  );
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(@Inject(CLOUDINARY) private readonly cloudinary: CloudinaryClient) {}

  /** Une tentative d’upload (sans retry). Pour les erreurs on rejette avec l’Error Cloudinary brute. */
  private uploadBufferOnce(
    buffer: Buffer,
    folder: string,
    options: UploadApiOptions = {},
  ): Promise<CloudinaryUploadResult> {
    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          ...options,
          ...(!options.agent && cloudinaryUploadAgent ? { agent: cloudinaryUploadAgent } : {}),
        },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(error ?? new Error('Réponse Cloudinary vide.'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            resourceType: result.resource_type,
          });
        },
      );

      Readable.from(buffer).pipe(stream);
    });
  }

  /**
   * Upload un buffer vers Cloudinary.
   * @param buffer Données binaires du fichier
   * @param folder Dossier de destination (ex: "medifollow/avatars")
   * @param options Options Cloudinary additionnelles (transformations, public_id, etc.)
   */
  async uploadBuffer(
    buffer: Buffer,
    folder: string,
    options: UploadApiOptions = {},
  ): Promise<CloudinaryUploadResult> {
    if (!buffer?.length) {
      throw new BadRequestException('Fichier vide.');
    }

    const maxAttempts = 3;
    let lastMsg = '';
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.uploadBufferOnce(buffer, folder, options);
      } catch (err: unknown) {
        lastMsg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message?: string }).message)
            : String(err);
        const transient = isLikelyTransientNetworkError(lastMsg);

        if (attempt < maxAttempts && transient) {
          const delayMs = 400 * attempt * attempt;
          this.logger.warn(
            `Upload Cloudinary tentative ${attempt}/${maxAttempts} échouée (${lastMsg}) — nouvel essai dans ${delayMs} ms…`,
          );
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }

        this.logger.error(`Upload Cloudinary échoué (définitif): ${lastMsg}`);

        let userHint = '';
        if (/\b403\b|\b401\b|unexpected status code - 403|unexpected status code - 401|Unauthorized|invalid.*signature/i.test(lastMsg)) {
          userHint =
            ' Diagnostic fréquent : `api.ping()` fonctionne mais l’upload renvoie 403 → la clé API utilise souvent des droits restreints (upload non autorisé). Dans la console Cloudinary → Settings / Security / API keys : utiliser une clé avec droits d’écriture (Upload / Admin), ou en créer une nouvelle. Voir aussi Security → restrictions d’upload.';
        } else if (isLikelyTransientNetworkError(lastMsg)) {
          userHint =
            ' Erreur réseau ou TLS vers api.cloudinary.com : vérifiez la connexion Internet, désactivez le VPN ou testez hors pare-feu/antivirus intrusifs, ou configurez HTTPS_PROXY si vous êtes derrière un proxy d’entreprise.';
        }

        throw new InternalServerErrorException(
          `${lastMsg || 'Échec de l’upload sur Cloudinary.'}${userHint}`,
        );
      }
    }
  }

  /**
   * Upload une image avec normalisation (taille max + qualité auto).
   * Idéal pour les photos de profil.
   */
  uploadImage(buffer: Buffer, folder: string, publicId?: string): Promise<CloudinaryUploadResult> {
    /** Upload léger sans pipeline « transformation » imbriqué : certains comptes / politiques peuvent rejeter avec 403. */
    return this.uploadBuffer(buffer, folder, {
      resource_type: 'image',
      public_id: publicId,
      overwrite: true,
      invalidate: true,
      width: 1024,
      height: 1024,
      crop: 'limit',
    });
  }

  /** Supprime une ressource (image/vidéo) à partir de son public_id. */
  async deleteResource(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
    if (!publicId) return;
    try {
      await this.cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
    } catch (e) {
      this.logger.warn(`Suppression Cloudinary échouée (${publicId}): ${(e as Error).message}`);
    }
  }

  /**
   * Tente d'extraire le public_id d'une URL Cloudinary stockée dans la base
   * (utile pour supprimer l'ancienne image quand on en upload une nouvelle).
   * Retourne null si l'URL n'est pas une URL Cloudinary reconnaissable.
   */
  extractPublicIdFromUrl(url: string): string | null {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    if (!match) return null;
    return match[1];
  }
}
