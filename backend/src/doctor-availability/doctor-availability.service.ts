import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DoctorAvailability } from './schemas/doctor-availability.schema';
import { Appointment } from '../appointment/schemas/appointment.schema';

export function normalizeTime(t: string): string {
  if (!t || typeof t !== 'string') return '';
  const parts = t.trim().split(':');
  if (parts.length < 2) return t.trim();
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return t.trim();
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Évite les échecs 2026-4-9 vs 2026-04-09 entre calendrier médecin et champ date patient. */
export function normalizeDateString(d: string | undefined): string {
  if (!d || typeof d !== 'string') return '';
  const part = d.trim().split('T')[0];
  const segs = part.split('-');
  if (segs.length !== 3) return part;
  const y = segs[0];
  const m = segs[1].padStart(2, '0');
  const day = segs[2].padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function normalizeDoctorId(id: unknown): string {
  if (id == null || id === '') return '';
  if (typeof id === 'object' && id !== null && '$oid' in (id as object)) {
    return String((id as { $oid: string }).$oid);
  }
  return String(id).trim();
}

function localTodayYmd(): string {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const d = String(t.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Anciennes lignes peuvent avoir date "2026-4-9" au lieu de "2026-04-09". */
function legacyDateVariants(nd: string): string[] {
  const segs = nd.split('-');
  if (segs.length !== 3) return [nd];
  const loose = `${segs[0]}-${parseInt(segs[1], 10)}-${parseInt(segs[2], 10)}`;
  return loose === nd ? [nd] : [nd, loose];
}

function timeToMinutes(t: string): number {
  const n = normalizeTime(t);
  const [h, m] = n.split(':').map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return -1;
  return h * 60 + m;
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Découpe chaque plage [from, to) en créneaux de stepMinutes (ex. 30 min) pour les demandes patient. */
export function expandRangesToTimes(ranges: { from: string; to: string }[], stepMinutes = 30): string[] {
  const out: string[] = [];
  for (const r of ranges || []) {
    const from = normalizeTime(String(r.from || ''));
    const to = normalizeTime(String(r.to || ''));
    if (!from || !to) continue;
    let cur = timeToMinutes(from);
    const end = timeToMinutes(to);
    if (end <= cur) continue;
    while (cur < end) {
      out.push(minutesToTime(cur));
      cur += stepMinutes;
    }
  }
  return [...new Set(out)].sort((a, b) => a.localeCompare(b));
}

function expandYearMonths(anchorDate: string, count: number): string[] {
  const segs = anchorDate.split('-');
  if (segs.length < 2) return [];
  let yy = parseInt(segs[0], 10);
  let mm = parseInt(segs[1], 10);
  if (Number.isNaN(yy) || Number.isNaN(mm)) return [];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(`${String(yy).padStart(4, '0')}-${String(mm).padStart(2, '0')}`);
    mm += 1;
    if (mm > 12) {
      mm = 1;
      yy += 1;
    }
  }
  return out;
}

@Injectable()
export class DoctorAvailabilityService {
  constructor(
    @InjectModel(DoctorAvailability.name) private availabilityModel: Model<DoctorAvailability>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
  ) {}

  async getMonth(doctorId: string, yearMonth: string) {
    const id = normalizeDoctorId(doctorId);
    const doc = await this.availabilityModel.findOne({ doctorId: id, yearMonth }).lean().exec();
    return doc || { doctorId: id, yearMonth, slots: [] };
  }

  async setMonth(
    doctorId: string,
    yearMonth: string,
    slots: { date: string; times?: string[]; ranges?: { from: string; to: string }[] }[],
  ) {
    const id = normalizeDoctorId(doctorId);
    const ymPrefix = yearMonth;
    const cleaned = (slots || [])
      .map((s) => {
        const date = normalizeDateString(String(s.date || '').trim());
        const ranges = (s.ranges || [])
          .map((r) => ({
            from: normalizeTime(String(r?.from || '')),
            to: normalizeTime(String(r?.to || '')),
          }))
          .filter((r) => r.from && r.to && r.from < r.to);
        const fromRanges = expandRangesToTimes(ranges, 30);
        const fromManual = (s.times || []).map((t) => normalizeTime(String(t))).filter(Boolean);
        const times = [...new Set([...fromRanges, ...fromManual])].sort((a, b) => a.localeCompare(b));
        return { date, times, ranges };
      })
      .filter((s) => s.date.startsWith(ymPrefix) && s.times.length > 0);

    return this.availabilityModel
      .findOneAndUpdate(
        { doctorId: id, yearMonth },
        { $set: { slots: cleaned } },
        { new: true, upsert: true },
      )
      .lean()
      .exec();
  }

  async isSlotInCalendar(doctorId: string, date: string, time: string): Promise<boolean> {
    const id = normalizeDoctorId(doctorId);
    const nd = normalizeDateString(date);
    const nt = normalizeTime(time);
    if (!nd || !nt) return false;
    const ym = nd.slice(0, 7);
    const doc = await this.availabilityModel.findOne({ doctorId: id, yearMonth: ym }).lean().exec();
    if (!doc?.slots?.length) return false;
    const day = doc.slots.find((s) => normalizeDateString(s.date) === nd);
    if (!day?.times?.length) return false;
    return day.times.map((t) => normalizeTime(t)).includes(nt);
  }

  async isSlotOccupiedByAppointment(doctorId: string, date: string, time: string): Promise<boolean> {
    const id = normalizeDoctorId(doctorId);
    const nd = normalizeDateString(date);
    const nt = normalizeTime(time);
    if (!nd || !nt) return true;
    const rows = await this.appointmentModel
      .find({
        doctorId: id,
        date: { $in: legacyDateVariants(nd) },
        status: { $in: ['pending', 'confirmed', 'scheduled'] },
      })
      .select('time date')
      .lean()
      .exec();
    return rows.some((a) => {
      const row = a as { time?: string; date?: string };
      const rowDate = normalizeDateString(String(row.date || ''));
      return rowDate === nd && normalizeTime(String(row.time || '')) === nt;
    });
  }

  /** Créneau offert au calendrier et non déjà réservé par une demande / RDV. */
  async isSlotAvailableForRequest(doctorId: string, date: string, time: string): Promise<boolean> {
    const inCal = await this.isSlotInCalendar(doctorId, date, time);
    if (!inCal) return false;
    const occupied = await this.isSlotOccupiedByAppointment(doctorId, date, time);
    return !occupied;
  }

  async findSuggestedSlots(doctorId: string, anchorDate: string, limit: number): Promise<{ date: string; time: string }[]> {
    const id = normalizeDoctorId(doctorId);
    const anchorNorm = normalizeDateString(anchorDate);
    const yms = expandYearMonths(anchorNorm || anchorDate, 3);
    const candidates: { date: string; time: string }[] = [];
    const seen = new Set<string>();
    for (const ym of yms) {
      const doc = await this.availabilityModel.findOne({ doctorId: id, yearMonth: ym }).lean().exec();
      if (!doc?.slots?.length) continue;
      for (const day of doc.slots) {
        const dNorm = normalizeDateString(day.date);
        for (const t of day.times || []) {
          const nt = normalizeTime(t);
          if (dNorm && nt) {
            const key = `${dNorm}|${nt}`;
            if (seen.has(key)) continue;
            seen.add(key);
            candidates.push({ date: dNorm, time: nt });
          }
        }
      }
    }
    candidates.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    const today = localTodayYmd();
    const out: { date: string; time: string }[] = [];
    for (const c of candidates) {
      if (c.date < today) continue;
      // eslint-disable-next-line no-await-in-loop
      const ok = await this.isSlotAvailableForRequest(id, c.date, c.time);
      if (ok) {
        out.push(c);
        if (out.length >= limit) break;
      }
    }
    return out;
  }
}
