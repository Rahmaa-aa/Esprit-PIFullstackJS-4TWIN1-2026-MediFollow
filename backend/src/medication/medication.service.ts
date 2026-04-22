import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Medication } from './schemas/medication.schema';
import { Patient } from '../patient/schemas/patient.schema';
import { getSlotCountForFrequency } from './medication-slots.util';

const localDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

type JwtUser = {
  id: unknown;
  role: string;
  firstName?: string;
  lastName?: string;
  name?: string;
};

@Injectable()
export class MedicationService {
  constructor(
    @InjectModel(Medication.name) private medicationModel: Model<Medication>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
  ) {}

  private async assertAccessToPatient(patientId: string, user: JwtUser | undefined) {
    if (!user) throw new UnauthorizedException();
    const pid = String(patientId);
    const uid = String(user.id);
    if (user.role === 'patient') {
      if (uid !== pid) throw new ForbiddenException('Accès refusé');
      return;
    }
    if (user.role === 'doctor') {
      const patient = await this.patientModel.findById(pid).exec();
      if (!patient) throw new NotFoundException('Patient introuvable');
      if (String(patient.doctorId || '') !== uid) {
        throw new ForbiddenException('Ce patient n’est pas suivi par ce médecin');
      }
      return;
    }
    if (user.role === 'nurse') {
      const patient = await this.patientModel.findById(pid).exec();
      if (!patient) throw new NotFoundException('Patient introuvable');
      if (String(patient.nurseId || '') !== uid) {
        throw new ForbiddenException('Accès refusé');
      }
      return;
    }
    if (user.role === 'admin' || user.role === 'superadmin') return;
    if (user.role === 'carecoordinator') {
      const patient = await this.patientModel.findById(pid).exec();
      if (!patient) throw new NotFoundException('Patient introuvable');
      const coordDept = String((user as JwtUser & { department?: string }).department || '').trim();
      const pDept = String((patient as any).department || (patient as any).service || '').trim();
      if (!coordDept || coordDept !== pDept) {
        throw new ForbiddenException('Accès refusé');
      }
      return;
    }
    throw new ForbiddenException('Accès refusé');
  }

  private async getMedicationAndPatientId(medId: string) {
    const med = await this.medicationModel.findById(medId).exec();
    if (!med) throw new NotFoundException('Médicament introuvable');
    const patientId = String((med as any).patientId);
    return { med, patientId };
  }

  async create(data: Record<string, unknown>, user?: JwtUser) {
    if (!data.patientId) throw new BadRequestException('patientId requis');
    const patientId = String(data.patientId);
    await this.assertAccessToPatient(patientId, user);

    let prescribedBy = (data.prescribedBy as string) || '';
    if (user?.role === 'doctor') {
      const fn = user.firstName || '';
      const ln = user.lastName || '';
      prescribedBy = `${fn} ${ln}`.trim() || (user.name as string) || prescribedBy;
    }

    const { patientId: _omit, _id: __omit, isActive: _ia, ...rest } = data;
    const doc: Record<string, unknown> = {
      ...rest,
      patientId: new Types.ObjectId(patientId),
      prescribedBy: prescribedBy || undefined,
      isActive: true,
    };
    const created = await this.medicationModel.create(doc);
    return created;
  }

  async getByPatient(patientId: string, user?: JwtUser) {
    await this.assertAccessToPatient(patientId, user);
    const pid = Types.ObjectId.isValid(patientId) ? new Types.ObjectId(patientId) : patientId;
    const meds = await this.medicationModel
      .find({
        patientId: pid,
        isActive: { $ne: false },
      })
      .sort({ createdAt: -1 })
      .exec();
    return meds.map((m) => {
      const o = m.toObject() as unknown as Record<string, unknown>;
      o.takenSlotKeys = this.mergeLegacySlotKeys(m);
      o.takenSlotTimes = this.slotTimesToPlain(m);
      return o;
    });
  }

  private slotTimesToPlain(med: Medication): Record<string, string> {
    const t = (med as unknown as { takenSlotTimes?: unknown }).takenSlotTimes;
    if (!t || typeof t !== 'object') return {};
    if (t instanceof Map) return Object.fromEntries(t as Map<string, string>);
    return { ...(t as Record<string, string>) };
  }

  private parseRecordedAt(input: unknown): string | null {
    if (typeof input !== 'string' || !input.trim()) return null;
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  private parseYmd(s: string | undefined): string | null {
    if (!s || typeof s !== 'string') return null;
    const t = s.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
    return t;
  }

  /**
   * Fusion legacy takenDates → clés par créneau.
   * Si takenSlotKeys contient déjà au moins une clé `date#n` pour un jour, on n’expand pas
   * takenDates pour ce jour (sinon une seule prise cochée ré-ouvrirait toute la journée).
   */
  private mergeLegacySlotKeys(med: Medication): string[] {
    const set = new Set<string>([...(med.takenSlotKeys || [])]);
    const n = getSlotCountForFrequency(med.frequency);
    const legacy = med.takenDates || [];
    for (const d of legacy) {
      const base = String(d).slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(base)) continue;
      if (n <= 0) continue;
      const hasSlotKeyForDate = [...set].some((k) => String(k).startsWith(`${base}#`));
      if (hasSlotKeyForDate) continue;
      for (let i = 0; i < n; i++) {
        set.add(`${base}#${i}`);
      }
    }
    return [...set].sort();
  }

  async toggleTakenToday(
    id: string,
    user?: JwtUser,
    body?: { localDate?: string; slotIndex?: number; recordedAt?: string },
  ) {
    const { patientId } = await this.getMedicationAndPatientId(id);
    await this.assertAccessToPatient(patientId, user);
    const med = await this.medicationModel.findById(id).exec();
    if (!med) throw new NotFoundException('Médicament introuvable');

    const clientDate = this.parseYmd(body?.localDate);
    const dateStr = clientDate || localDateString();

    const start = med.startDate ? String(med.startDate).slice(0, 10) : '';
    const end = med.endDate ? String(med.endDate).slice(0, 10) : '';
    if (start && dateStr < start) {
      throw new BadRequestException(
        'Impossible de marquer ce médicament comme pris avant la date de début du traitement.',
      );
    }
    if (end && dateStr > end) {
      throw new BadRequestException(
        'La période de traitement est terminée (date de fin dépassée).',
      );
    }

    const maxSlots = getSlotCountForFrequency(med.frequency);
    if (maxSlots === 0) {
      throw new BadRequestException('Ce médicament ne comporte pas de prise planifiée (si besoin).');
    }

    let slotIndex = typeof body?.slotIndex === 'number' ? Math.floor(body.slotIndex) : 0;
    if (slotIndex < 0 || slotIndex >= maxSlots) {
      throw new BadRequestException('Créneau de prise invalide.');
    }

    const slotKey = `${dateStr}#${slotIndex}`;
    let keys = this.mergeLegacySlotKeys(med);
    const times = this.slotTimesToPlain(med);
    const alreadyTaken = keys.includes(slotKey);
    if (alreadyTaken) {
      keys = keys.filter((k) => k !== slotKey);
      delete times[slotKey];
    } else {
      keys = [...new Set([...keys, slotKey])].sort();
      const recorded = this.parseRecordedAt(body?.recordedAt) || new Date().toISOString();
      times[slotKey] = recorded;
    }

    await this.medicationModel.updateOne(
      { _id: id },
      {
        $set: { takenSlotKeys: keys, takenDates: [], takenSlotTimes: times },
      },
    );

    const updated = await this.medicationModel.findById(id).exec();
    return {
      taken: !alreadyTaken,
      date: dateStr,
      slotIndex,
      takenSlotKeys: updated?.takenSlotKeys || keys,
      takenSlotTimes: updated ? this.slotTimesToPlain(updated as Medication) : times,
    };
  }

  async update(id: string, data: Record<string, unknown>, user?: JwtUser) {
    const { patientId } = await this.getMedicationAndPatientId(id);
    await this.assertAccessToPatient(patientId, user);
    const updateData = { ...data };
    delete updateData._id;
    delete updateData.patientId;
    return this.medicationModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }

  async remove(id: string, user?: JwtUser) {
    const { patientId } = await this.getMedicationAndPatientId(id);
    await this.assertAccessToPatient(patientId, user);
    return this.medicationModel.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true }).exec();
  }
}
