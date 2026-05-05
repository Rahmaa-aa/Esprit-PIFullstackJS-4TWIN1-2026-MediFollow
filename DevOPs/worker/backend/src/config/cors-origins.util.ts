/**
 * Origines autorisées pour CORS HTTP et Socket.IO (appels vocaux / vidéo).
 * FRONTEND_URL : une URL ou plusieurs séparées par des virgules (ex. prod Vercel + preview).
 */
export function resolveCorsOrigins(): string[] {
  const raw = process.env.FRONTEND_URL?.trim();
  if (!raw) {
    return ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
  }
  const list = raw
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  return list.length > 0 ? list : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
}
