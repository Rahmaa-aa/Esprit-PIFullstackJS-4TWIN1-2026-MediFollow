/** Combine date YYYY-MM-DD et heure HH:mm (heure locale serveur). */
export function appointmentDateTimeLocal(dateStr: string, timeStr: string): Date | null {
  const d = String(dateStr || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const raw = String(timeStr || '09:00').trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(raw);
  const hh = m ? parseInt(m[1], 10) : 9;
  const mm = m ? parseInt(m[2], 10) : 0;
  const [y, mo, day] = d.split('-').map(Number);
  return new Date(y, mo - 1, day, hh, mm, 0, 0);
}

/**
 * Rappel « sous 24 h » : affiché pendant toute la dernière journée avant le RDV
 * (entre 0 et 24 h avant), pas seulement dans une fenêtre de 2 h autour de T−24h.
 */
export function isIn24hReminderWindow(apptAt: Date, now = new Date()): boolean {
  const msUntil = apptAt.getTime() - now.getTime();
  const h24 = 24 * 60 * 60 * 1000;
  return msUntil > 0 && msUntil <= h24;
}

export function formatApptLineFr(dateStr: string, timeStr: string): string {
  const d = String(dateStr || '').slice(0, 10);
  const t = String(timeStr || '').trim() || '—';
  try {
    const [y, mo, da] = d.split('-').map(Number);
    const dt = new Date(y, mo - 1, da);
    const ds = dt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    return `${ds} · ${t}`;
  } catch {
    return `${d} · ${t}`;
  }
}

export function normalizeDoctorIdForQuery(id: unknown): string {
  return String(id ?? '').trim();
}

export function appointmentIdString(id: unknown): string {
  if (id == null) return '';
  if (typeof id === 'object' && id !== null && '_id' in id) return String((id as { _id: unknown })._id);
  return String(id);
}
