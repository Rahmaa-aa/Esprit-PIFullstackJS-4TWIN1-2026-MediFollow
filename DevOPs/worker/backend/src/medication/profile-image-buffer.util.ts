import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Charge une image de profil pour PDFKit : data URL, URL http(s), ou chemin relatif (uploads, public, monorepo front).
 */
export async function resolveProfileImageBufferForPdf(raw: string | undefined | null): Promise<Buffer | null> {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;

  if (s.startsWith('data:image')) {
    const i = s.indexOf('base64,');
    if (i === -1) return null;
    try {
      return Buffer.from(s.slice(i + 7), 'base64');
    } catch {
      return null;
    }
  }

  if (s.startsWith('http://') || s.startsWith('https://')) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(s, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }

  const rel = s.replace(/^\/+/, '');
  const roots = [
    join(process.cwd(), rel),
    join(process.cwd(), 'uploads', rel),
    join(process.cwd(), 'public', rel),
    join(process.cwd(), '..', 'Front_End', 'CODE-REACT', 'public', rel),
  ];
  for (const p of roots) {
    try {
      return await fs.readFile(p);
    } catch {
      /* try next */
    }
  }
  return null;
}
