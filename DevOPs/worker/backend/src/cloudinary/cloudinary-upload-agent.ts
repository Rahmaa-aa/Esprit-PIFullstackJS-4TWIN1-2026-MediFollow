import * as https from 'https';

/**
 * Agent HTTPS avec IPv4 forcé : sur Windows (et certains FAI), les échecs TLS
 * « socket disconnected before secure TLS connection was established » peuvent venir
 * d’une mauvaise route IPv6 ou d’une résolution DNS instable. Cloudinary n’injecte
 * pas cet agent par défaut.
 *
 * Désactiver : CLOUDINARY_FORCE_IPV4=0 dans .env
 */
export const cloudinaryUploadAgent =
  process.env.CLOUDINARY_FORCE_IPV4 === '0'
    ? undefined
    : new https.Agent({
        family: 4,
        keepAlive: true,
        maxSockets: 10,
      });
