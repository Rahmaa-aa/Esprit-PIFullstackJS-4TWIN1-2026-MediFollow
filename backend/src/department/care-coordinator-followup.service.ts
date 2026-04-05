import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Patient } from '../patient/schemas/patient.schema';
import { Doctor } from '../doctor/schemas/doctor.schema';
import { Nurse } from '../nurse/schemas/nurse.schema';
import { HealthLog } from '../health-log/schemas/health-log.schema';
import { Medication } from '../medication/schemas/medication.schema';
import { Appointment } from '../appointment/schemas/appointment.schema';
import { getSlotCountForFrequency } from '../medication/medication-slots.util';

const WINDOW_DAYS = 7;

type JwtCoordinator = {
  id: unknown;
  role: string;
  department?: string;
};

function lastNLocalDates(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    out.push(`${y}-${m}-${day}`);
  }
  return out;
}

function hasVitals(v: Record<string, unknown> | undefined): boolean {
  if (!v || typeof v !== 'object') return false;
  const keys = [
    'bloodPressureSystolic',
    'bloodPressureDiastolic',
    'heartRate',
    'temperature',
    'oxygenSaturation',
    'weight',
  ];
  return keys.some((k) => {
    const x = v[k];
    return x != null && x !== '';
  });
}

function ymdFromLog(log: { date?: string; recordedAt?: Date; createdAt?: Date }): string | null {
  const d = log.date;
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.trim())) return d.trim();
  const iso = log.recordedAt || log.createdAt;
  if (iso) {
    const t = new Date(iso);
    if (!Number.isNaN(t.getTime())) {
      const y = t.getFullYear();
      const m = String(t.getMonth() + 1).padStart(2, '0');
      const day = String(t.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }
  return null;
}

function todayYmdLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDaysYmdLocal(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function mergeLegacySlotKeys(med: Record<string, unknown>): string[] {
  const m = med as Record<string, unknown>;
  const set = new Set<string>([...(Array.isArray(m.takenSlotKeys) ? m.takenSlotKeys : [])]);
  const n = getSlotCountForFrequency(String(m.frequency || ''));
  const legacy = Array.isArray(m.takenDates) ? m.takenDates : [];
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
  return [...set];
}

@Injectable()
export class CareCoordinatorFollowupService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
    @InjectModel(HealthLog.name) private healthLogModel: Model<HealthLog>,
    @InjectModel(Medication.name) private medicationModel: Model<Medication>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
  ) {}

  /** Aligné sur DepartmentService : department explicite ou repli sur service. */
  private patientDeptFilter(name: string) {
    return {
      $or: [
        { department: name },
        {
          $and: [
            { $or: [{ department: null }, { department: '' }, { department: { $exists: false } }] },
            { service: name },
          ],
        },
      ],
    };
  }

  private assertCoordinator(user: JwtCoordinator) {
    if (!user || user.role !== 'carecoordinator') {
      throw new ForbiddenException('Accès réservé aux coordinateurs de soins');
    }
    const dept = String(user.department || '').trim();
    if (!dept) {
      throw new ForbiddenException('Aucun département assigné à votre profil');
    }
    return dept;
  }

  private async assertPatientInCoordinatorDepartment(user: JwtCoordinator, patientId: string) {
    const dept = this.assertCoordinator(user);
    const pid = String(patientId).trim();
    const patient = await this.patientModel.findById(pid).select('department service').lean().exec();
    if (!patient) throw new NotFoundException('Patient introuvable');
    const pDept = String((patient as any).department || (patient as any).service || '').trim();
    if (pDept !== dept) {
      throw new ForbiddenException('Ce patient n’appartient pas à votre département');
    }
    return { dept, patientId: pid };
  }

  /**
   * Score 0–100 sur 7 jours glissants : moyenne des scores « constantes » et « médicaments planifiés ».
   * Sans médicament planifié : la partie médicaments = 100 % (rien à suivre).
   */
  async listMyDepartmentPatients(user: JwtCoordinator) {
    const dept = this.assertCoordinator(user);
    const patients = await this.patientModel
      .find(this.patientDeptFilter(dept))
      .select('-password')
      .sort({ lastName: 1, firstName: 1 })
      .lean()
      .exec();

    const dateWindow = lastNLocalDates(WINDOW_DAYS);
    const dateSet = new Set(dateWindow);
    const oldest = dateWindow[0];
    const since = new Date(`${oldest}T00:00:00.000Z`);

    const pids = patients.map((p: any) => p._id);

    const [logs, meds] = await Promise.all([
      this.healthLogModel
        .find({
          patientId: { $in: pids },
          $or: [{ createdAt: { $gte: since } }, { date: { $gte: oldest } }],
        })
        .select('patientId date recordedAt createdAt vitals')
        .lean()
        .exec(),
      this.medicationModel
        .find({ patientId: { $in: pids }, isActive: { $ne: false } })
        .select('patientId frequency startDate endDate takenSlotKeys takenDates')
        .lean()
        .exec(),
    ]);

    const vitalsDaysByPatient = new Map<string, Set<string>>();
    for (const l of logs as any[]) {
      const pid = String(l.patientId);
      if (!hasVitals(l.vitals)) continue;
      const ymd = ymdFromLog(l);
      if (!ymd || !dateSet.has(ymd)) continue;
      if (!vitalsDaysByPatient.has(pid)) vitalsDaysByPatient.set(pid, new Set());
      vitalsDaysByPatient.get(pid)!.add(ymd);
    }

    const medsByPatient = new Map<string, any[]>();
    for (const m of meds as any[]) {
      const pid = String(m.patientId);
      if (!medsByPatient.has(pid)) medsByPatient.set(pid, []);
      medsByPatient.get(pid)!.push(m);
    }

    const rows = patients.map((p: any) => {
      const id = String(p._id);
      const daysWithVitals = vitalsDaysByPatient.get(id)?.size ?? 0;
      const vitalsScore = Math.round((daysWithVitals / WINDOW_DAYS) * 100);

      const patientMeds = medsByPatient.get(id) || [];
      let expected = 0;
      let actual = 0;
      for (const med of patientMeds) {
        const slots = getSlotCountForFrequency(med.frequency);
        if (slots <= 0) continue;
        const start = med.startDate ? String(med.startDate).slice(0, 10) : '';
        const end = med.endDate ? String(med.endDate).slice(0, 10) : '';
        const keys = mergeLegacySlotKeys(med as Record<string, unknown>);
        for (const day of dateWindow) {
          if (start && day < start) continue;
          if (end && day > end) continue;
          expected += slots;
        }
        for (const k of keys) {
          const day = String(k).split('#')[0];
          if (!dateSet.has(day)) continue;
          if (start && day < start) continue;
          if (end && day > end) continue;
          actual += 1;
        }
      }

      let medicationScore = 100;
      if (expected > 0) {
        medicationScore = Math.min(100, Math.round((actual / expected) * 100));
      }

      const complianceScore = Math.round((vitalsScore + medicationScore) / 2);

      return {
        id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        department: p.department || p.service || '',
        doctorId: p.doctorId ? String(p.doctorId) : '',
        nurseId: p.nurseId ? String(p.nurseId) : '',
        isActive: p.isActive !== false,
        complianceScore,
        vitalsScore,
        medicationScore,
        windowDays: WINDOW_DAYS,
      };
    });

    return {
      department: dept,
      windowDays: WINDOW_DAYS,
      patients: rows,
    };
  }

  /**
   * Indicateurs agrégés pour le tableau de bord coordinateur (même périmètre que my-patients).
   */
  async getDashboardStats(user: JwtCoordinator) {
    const dept = this.assertCoordinator(user);
    const [list, doctorCount, nurseCount] = await Promise.all([
      this.listMyDepartmentPatients(user),
      this.doctorModel.countDocuments({ department: dept }).exec(),
      this.nurseModel.countDocuments({ department: dept }).exec(),
    ]);
    const patients = (list as { patients?: unknown[] }).patients || [];
    const patientCount = patients.length;
    const patientsNeedingAttention = (patients as { complianceScore?: number }[]).filter(
      (p) => (p.complianceScore ?? 100) < 50,
    ).length;

    const oidList: Types.ObjectId[] = [];
    for (const p of patients as { id?: string }[]) {
      const sid = String(p.id || '').trim();
      if (Types.ObjectId.isValid(sid)) oidList.push(new Types.ObjectId(sid));
    }

    const start = todayYmdLocal();
    const end = addDaysYmdLocal(7);

    let appointmentsNext7Days = 0;
    const appointmentsByDayDates: string[] = [];
    const appointmentsByDayCounts: number[] = [];
    for (let i = 0; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      appointmentsByDayDates.push(ymd);
    }

    if (oidList.length) {
      appointmentsNext7Days = await this.appointmentModel
        .countDocuments({
          patientId: { $in: oidList },
          date: { $gte: start, $lte: end },
          status: { $nin: ['cancelled'] },
        })
        .exec();

      const appts = await this.appointmentModel
        .find({
          patientId: { $in: oidList },
          date: { $gte: start, $lte: end },
          status: { $nin: ['cancelled'] },
        })
        .select('date')
        .lean()
        .exec();

      const perDay = new Map<string, number>();
      for (const ymd of appointmentsByDayDates) perDay.set(ymd, 0);
      for (const a of appts as { date?: string }[]) {
        const dt = String(a.date || '').slice(0, 10);
        if (perDay.has(dt)) perDay.set(dt, (perDay.get(dt) || 0) + 1);
      }
      for (const ymd of appointmentsByDayDates) {
        appointmentsByDayCounts.push(perDay.get(ymd) || 0);
      }
    } else {
      for (let i = 0; i < appointmentsByDayDates.length; i++) appointmentsByDayCounts.push(0);
    }

    const followUpBuckets = [0, 0, 0, 0];
    for (const p of patients as { complianceScore?: number }[]) {
      const s = Math.min(100, Math.max(0, Math.round(p.complianceScore ?? 0)));
      if (s < 25) followUpBuckets[0]++;
      else if (s < 50) followUpBuckets[1]++;
      else if (s < 75) followUpBuckets[2]++;
      else followUpBuckets[3]++;
    }

    return {
      department: dept,
      patientCount,
      doctorCount,
      nurseCount,
      appointmentsNext7Days,
      patientsNeedingAttention,
      followUpWindowDays: WINDOW_DAYS,
      charts: {
        teamCounts: [patientCount, doctorCount, nurseCount],
        followUpBuckets,
        appointmentsByDay: {
          dates: appointmentsByDayDates,
          counts: appointmentsByDayCounts,
        },
      },
    };
  }

  async getPatientHistory(user: JwtCoordinator, patientId: string) {
    await this.assertPatientInCoordinatorDepartment(user, patientId);

    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);
    since.setHours(0, 0, 0, 0);
    const sinceYmd = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, '0')}-${String(since.getDate()).padStart(2, '0')}`;

    const patient = await this.patientModel.findById(patientId).select('-password').lean().exec();
    if (!patient) throw new NotFoundException('Patient introuvable');

    const s = String(patientId).trim();
    const patientPart =
      !Types.ObjectId.isValid(s)
        ? { patientId: s }
        : { $or: [{ patientId: new Types.ObjectId(s) }, { patientId: s }] };

    const [healthLogs, medications] = await Promise.all([
      this.healthLogModel
        .find({
          $and: [
            patientPart,
            {
              $or: [{ createdAt: { $gte: since } }, { date: { $gte: sinceYmd } }],
            },
          ],
        })
        .sort({ createdAt: 1, _id: 1 })
        .limit(5000)
        .lean()
        .exec(),
      this.medicationModel
        .find({
          patientId: Types.ObjectId.isValid(s) ? new Types.ObjectId(s) : s,
          isActive: { $ne: false },
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
    ]);

    const medsOut = medications.map((m) => {
      const o = { ...m } as Record<string, unknown>;
      o.takenSlotKeys = mergeLegacySlotKeys(o);
      return o;
    });

    return {
      patient,
      healthLogs,
      medications: medsOut,
    };
  }
}
