import type { AuditActionType } from './schemas/audit-log.schema';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'access_token',
  'refresh_token',
  'descriptor',
  'authorization',
  'smtp_pass',
  'secret',
]);

export function getClientIp(req: { ip?: string; socket?: { remoteAddress?: string }; headers?: Record<string, unknown> }): string {
  const xf = req.headers?.['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  if (Array.isArray(xf) && xf[0]) return String(xf[0]).split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || '';
}

export function deriveActionType(method: string, url: string, status: number): AuditActionType {
  const u = url.toLowerCase();
  const loginLike =
    u.includes('/auth/login') ||
    u.includes('/auth/staff-login') ||
    u.includes('/auth/doctor-login') ||
    u.includes('/auth/patient-login') ||
    u.includes('/auth/nurse-login') ||
    u.includes('/auth/face/login') ||
    u.includes('/auth/confirm-login') ||
    u.includes('/auth/passkey/auth/verify') ||
    u.includes('/auth/passkey/register/verify');

  if (method === 'POST' && loginLike) {
    if (status >= 400) return 'LOGIN_FAILED';
    return 'LOGIN';
  }

  if (method === 'DELETE') return 'DELETE';
  if (method === 'POST') return 'CREATE';
  if (method === 'PUT' || method === 'PATCH') return 'UPDATE';
  if (method === 'GET') return 'READ';
  return 'OTHER';
}

export function resourceTypeFromPath(url: string): string {
  const u = url.toLowerCase();
  if (u.includes('/patients')) return 'patient';
  if (u.includes('/doctors')) return 'doctor';
  if (u.includes('/nurses')) return 'nurse';
  if (u.includes('/health-logs')) return 'vitals';
  if (u.includes('/medications')) return 'medication';
  if (u.includes('/lab-analysis')) return 'lab';
  if (u.includes('/brain-tumor')) return 'brain_mri';
  if (u.includes('/auth')) return 'auth';
  if (u.includes('/appointments')) return 'appointment';
  if (u.includes('/questionnaires')) return 'questionnaire';
  if (u.includes('/chat')) return 'chat';
  if (u.includes('/notifications')) return 'notification';
  if (u.includes('/mail')) return 'mail';
  if (u.includes('/departments')) return 'department';
  if (u.includes('/users') || u.includes('/auditors') || u.includes('/care-coordinators')) return 'admin_user';
  return 'other';
}

export function resourceLabelFromPath(url: string): string {
  const parts = url.split('?')[0].split('/').filter(Boolean);
  const apiIdx = parts.indexOf('api');
  const rest = apiIdx >= 0 ? parts.slice(apiIdx + 1) : parts;
  if (rest.length === 0) return '';
  const resource = rest[0];
  const id = rest.length > 1 ? rest[rest.length - 1] : '';
  if (id && /^[a-f\d]{24}$/i.test(id)) return `${resource} · ${id.slice(0, 8)}…`;
  if (id) return `${resource} · ${id}`;
  return resource;
}

export function sanitizeBodyForAudit(body: unknown, maxLen = 8000): Record<string, unknown> | undefined {
  if (body == null || typeof body !== 'object') return undefined;
  try {
    const clone = deepRedact(body as Record<string, unknown>) as Record<string, unknown>;
    const s = JSON.stringify(clone);
    if (s.length > maxLen) return { _truncated: true, preview: s.slice(0, maxLen) + '…' };
    return clone;
  } catch {
    return { _error: 'unserializable_body' };
  }
}

function deepRedact(val: unknown, depth = 0): unknown {
  if (depth > 8) return '[max-depth]';
  if (val == null) return val;
  if (typeof val !== 'object') return val;
  if (Array.isArray(val)) return val.map((v) => deepRedact(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    const key = k.toLowerCase();
    if (SENSITIVE_KEYS.has(key) || key.includes('password')) out[k] = '[redacted]';
    else out[k] = deepRedact(v, depth + 1);
  }
  return out;
}
