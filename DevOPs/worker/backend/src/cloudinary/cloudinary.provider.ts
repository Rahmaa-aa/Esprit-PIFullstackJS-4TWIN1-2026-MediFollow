import { v2 as Cloudinary } from 'cloudinary';

export const CLOUDINARY = 'CLOUDINARY';

export type CloudinaryClient = typeof Cloudinary;

/**
 * Normalise une valeur .env (espaces fins, quotes accidentelles).
 */
function trimCred(value: string | undefined): string {
  return String(value ?? '')
    .trim()
    .replace(/^[\s"']+|[\s"']+$/g, '');
}

/**
 * Configure le SDK Cloudinary à partir des variables d'environnement.
 *
 * Utiliser soit les trois variables, soit **`CLOUDINARY_URL`** (format
 * `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`), pas un mélange incohérent.
 */
export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (): CloudinaryClient => {
    const fromUrlRaw = trimCred(process.env.CLOUDINARY_URL);
    /** Réinitialise toute conf résiduelle (ex. ancienne CLOUDINARY_URL dans l’ENV système). */
    Cloudinary.config(true);

    if (fromUrlRaw && /^cloudinary:\/\//i.test(fromUrlRaw)) {
      process.env.CLOUDINARY_URL = fromUrlRaw;
      Cloudinary.config({ secure: true });
      console.log('[Cloudinary] Configuration chargée depuis CLOUDINARY_URL.');
      return Cloudinary;
    }

    const cloudName = trimCred(process.env.CLOUDINARY_CLOUD_NAME);
    const apiKey = trimCred(process.env.CLOUDINARY_API_KEY);
    const apiSecret = trimCred(process.env.CLOUDINARY_API_SECRET);

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn(
        '[Cloudinary] Variables manquantes (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET) ou utilisez CLOUDINARY_URL. Les uploads échoueront tant que la configuration n’est pas complétée.',
      );
    }

    Cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    return Cloudinary;
  },
};
