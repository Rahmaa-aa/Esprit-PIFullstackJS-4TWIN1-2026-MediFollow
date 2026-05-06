import { BadRequestException } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

/** Détecte et décode une image data URL (JPEG/PNG/WebP/GIF), max 5 Mo. */
export function parseDataUrlProfileImage(dataUrl: string): { buffer: Buffer; mimetype: string } | null {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(String(dataUrl || '').trim());
  if (!m) return null;
  const mimetype = m[1].toLowerCase();
  const allowed = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);
  if (!allowed.has(mimetype)) return null;
  try {
    const buffer = Buffer.from(m[2], 'base64');
    if (!buffer.length || buffer.length > MAX_PROFILE_IMAGE_BYTES) return null;
    return { buffer, mimetype };
  } catch {
    return null;
  }
}

/**
 * Si `profileImage` est une data URL, upload Cloudinary et renvoie l’URL https.
 * Sinon renvoie la valeur inchangée (chemins /assets, URLs déjà Cloudinary, etc.).
 */
export async function resolveProfileImageDataUrlIfNeeded(
  cloudinary: CloudinaryService,
  opts: {
    profileImage: string | undefined;
    previousUrl: string | undefined;
    /** ex. `medifollow/avatars/doctor` */
    folder: string;
    /** ex. `doctor_673a...` (public_id relatif au folder Cloudinary) */
    publicIdForUpload: string;
  },
): Promise<string | undefined> {
  const { profileImage, previousUrl, folder, publicIdForUpload } = opts;
  if (profileImage == null || profileImage === '') return profileImage;
  const trimmed = String(profileImage).trim();
  if (!trimmed.startsWith('data:')) {
    return profileImage;
  }
  const parsed = parseDataUrlProfileImage(trimmed);
  if (!parsed) {
    throw new BadRequestException(
      'Image de profil invalide ou trop volumineuse (JPEG, PNG, WebP ou GIF, max 5 Mo).',
    );
  }
  const upload = await cloudinary.uploadImage(parsed.buffer, folder, publicIdForUpload);
  const prev = previousUrl?.trim();
  if (prev && prev !== upload.url && prev.includes('res.cloudinary.com')) {
    const prevId = cloudinary.extractPublicIdFromUrl(prev);
    if (prevId?.startsWith('medifollow/')) {
      await cloudinary.deleteResource(prevId, 'image');
    }
  }
  return upload.url;
}
