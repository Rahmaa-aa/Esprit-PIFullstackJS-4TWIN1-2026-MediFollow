import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HealthLog } from './schemas/health-log.schema';
import { Patient } from '../patient/schemas/patient.schema';
import { Nurse } from '../nurse/schemas/nurse.schema';
import { NotificationService } from '../notification/notification.service';
import { ChatService } from '../chat/chat.service';
import { GamificationService } from '../gamification/gamification.service';

function num(v: unknown): number | null {
  if (v === '' || v == null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/** Dérive les ids `symptoms` à partir du subjectif structuré (photo 5). */
function deriveSymptomsFromStructured(s: any): string[] {
  if (!s || typeof s !== 'object') return [];
  const out: string[] = [];
  if ((num(s.fatigue) ?? 0) > 0) out.push('fatigue');
  if ((num(s.chestPain) ?? 0) > 0) out.push('chestPain');
  if ((num(s.shortBreath) ?? 0) > 0) out.push('shortBreath');
  if ((num(s.nausea) ?? 0) > 0) out.push('nausea');
  if (s.feltFever) out.push('fever');
  if (s.palpitations) out.push('palpitations');
  if (s.cough) out.push('cough');
  if (s.dizzinessConfusion) out.push('dizziness');
  return out;
}

function symptomStructuredIsActive(s: any): boolean {
  if (!s || typeof s !== 'object') return false;
  return (
    (num(s.fatigue) ?? 0) > 0 ||
    (num(s.chestPain) ?? 0) > 0 ||
    (num(s.shortBreath) ?? 0) > 0 ||
    (num(s.nausea) ?? 0) > 0 ||
    !!s.feltFever ||
    !!s.palpitations ||
    !!s.cough ||
    !!s.dizzinessConfusion
  );
}

/** Dictionnaire vitaux / symptômes (seuils critiques document projet). */
const computeRiskScore = (
  data: any,
  opts?: { previousWeightKg?: number | null },
): { score: number; flagged: boolean } => {
  let score = 0;

  const hr = num(data.vitals?.heartRate);
  if (hr != null && (hr < 50 || hr > 120)) score += 20;

  const sys = num(data.vitals?.bloodPressureSystolic);
  const dia = num(data.vitals?.bloodPressureDiastolic);
  if (sys != null && dia != null) {
    if ((sys >= 180 && dia >= 120) || sys < 90 || dia < 60) score += 25;
  } else {
    if (sys != null && (sys >= 180 || sys < 90)) score += 15;
    if (dia != null && (dia >= 120 || dia < 60)) score += 15;
  }

  const o2 = num(data.vitals?.oxygenSaturation);
  if (o2 != null) {
    if (o2 < 90) score += 25;
    else if (o2 < 95) score += 10;
  }

  const temp = num(data.vitals?.temperature);
  if (temp != null && (temp >= 38.5 || temp < 35)) score += 15;

  const rr = num(data.vitals?.respiratoryRate);
  if (rr != null && (rr > 30 || rr < 8)) score += 20;

  const newW = num(data.vitals?.weight);
  const prevW = num(opts?.previousWeightKg);
  if (newW != null && prevW != null && prevW > 0) {
    const delta = Math.abs(newW - prevW) / prevW;
    if (delta >= 0.05) score += 15;
  }

  const s = data.symptomStructured;
  if (symptomStructuredIsActive(s)) {
    const fatigue = num(s.fatigue) ?? 0;
    if (fatigue >= 3) score += 8;
    if (fatigue >= 5) score += 5;
    const chestPain = num(s.chestPain) ?? 0;
    if (chestPain >= 3) score += 20;
    if (chestPain >= 7) score += 10;
    const shortBreath = num(s.shortBreath) ?? 0;
    if (shortBreath >= 2) score += 15;
    if (shortBreath >= 4) score += 5;
    const nausea = num(s.nausea) ?? 0;
    if (nausea >= 3) score += 8;
    if (s.feltFever) score += 10;
    if (s.palpitations) score += 10;
    if (s.cough) score += 8;
    if (s.dizzinessConfusion) score += 12;
  } else {
    const ids = new Set((data.symptoms || []).map((x: string) => String(x).toLowerCase()));
    if ([...ids].some((id) => id === 'shortbreath' || String(id).includes('shortness'))) score += 15;
    if ([...ids].some((id) => id === 'chestpain' || String(id).includes('chest pain'))) score += 20;
    if (ids.has('fatigue')) score += 5;
    if (ids.has('fever')) score += 10;
    if (ids.has('palpitations')) score += 10;
    if (ids.has('nausea')) score += 5;
    if (ids.has('dizziness')) score += 8;
    if (ids.has('cough')) score += 8;
  }

  const pain = num(data.painLevel) ?? 0;
  if (pain >= 7) score += 15;
  else if (pain >= 5) score += 8;

  if (data.mood === 'poor') score += 10;

  return { score: Math.min(score, 100), flagged: score >= 50 };
};

function buildVitalAlertMessageFr(patientName: string, log: any): string {
  const v = log.vitals || {};
  const lines: string[] = [
    '🚨 ALERTE CONSTANTES VITALES — action prioritaire',
    '',
    `Patient : ${patientName}`,
    `Score de risque : ${log.riskScore}/100`,
    `Date du relevé : ${
      log.recordedAt ? new Date(log.recordedAt).toLocaleString('fr-FR') : log.date || '—'
    }`,
    '',
    'Constantes mesurées :',
  ];
  if (v.heartRate != null) lines.push(`• Fréquence cardiaque : ${v.heartRate} bpm`);
  if (v.bloodPressureSystolic != null) {
    lines.push(`• Tension : ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic ?? '—'} mmHg`);
  }
  if (v.oxygenSaturation != null) lines.push(`• SpO₂ : ${v.oxygenSaturation} %`);
  if (v.temperature != null && v.temperature !== '') lines.push(`• Température : ${v.temperature} °C`);
  if (v.respiratoryRate != null && v.respiratoryRate !== '') lines.push(`• Respiration : ${v.respiratoryRate} /min`);
  if (v.weight != null && v.weight !== '') lines.push(`• Poids : ${v.weight} kg`);
  const sym = Array.isArray(log.symptoms) ? log.symptoms : [];
  if (sym.length) lines.push('', `Symptômes déclarés : ${sym.join(', ')}`);
  const ss = log.symptomStructured;
  if (ss && typeof ss === 'object' && symptomStructuredIsActive(ss)) {
    const parts: string[] = [];
    if ((num(ss.fatigue) ?? 0) > 0) parts.push(`fatigue ${ss.fatigue}/5`);
    if ((num(ss.chestPain) ?? 0) > 0) parts.push(`douleur thoracique ${ss.chestPain}/10`);
    if ((num(ss.shortBreath) ?? 0) > 0) parts.push(`essoufflement ${ss.shortBreath}/5`);
    if ((num(ss.nausea) ?? 0) > 0) parts.push(`nausée ${ss.nausea}/5`);
    if (ss.feltFever) parts.push('fièvre ressentie');
    if (ss.palpitations) parts.push('palpitations');
    if (ss.cough) parts.push('toux');
    if (ss.dizzinessConfusion) parts.push('vertiges / confusion');
    if (parts.length) lines.push('', `Subjectif (scores) : ${parts.join(' · ')}`);
  }
  lines.push(`Douleur : ${log.painLevel ?? 0}/10`, `Ressenti : ${log.mood || '—'}`);
  lines.push(
    '',
    'Merci d’analyser en priorité, de conseiller le patient (messagerie ou appel), et d’escalader au médecin si le cas est complexe.',
  );
  return lines.join('\n');
}

function buildEscalationBodyFr(
  patientName: string,
  log: any,
  nurseNote: string,
  nurseName: string,
): string {
  return [
    '⚠️ ESCALADE INFIRMIER → MÉDECIN',
    '',
    `Patient : ${patientName}`,
    `Score de risque du relevé : ${log.riskScore}/100`,
    `Référence relevé : ${String(log._id)}`,
    '',
    `Infirmier(ère) : ${nurseName}`,
    '',
    'Contexte / demande :',
    nurseNote || '(non précisé)',
    '',
    'Merci d’indiquer le plan de soins et de clôturer l’alerte une fois la situation résolue.',
  ].join('\n');
}

type JwtLike = { id?: unknown; role?: string };

@Injectable()
export class HealthLogService {
  constructor(
    @InjectModel(HealthLog.name) private healthLogModel: Model<HealthLog>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private gamificationService: GamificationService,
  ) {}

  private toPatientObjectId(patientId: string) {
    const s = String(patientId).trim();
    if (!s || !Types.ObjectId.isValid(s)) {
      throw new BadRequestException('Identifiant patient invalide');
    }
    return new Types.ObjectId(s);
  }

  private uid(u: JwtLike): string {
    return String(u.id ?? '');
  }

  private patientIdFilter(patientId: string) {
    const s = String(patientId).trim();
    if (!Types.ObjectId.isValid(s)) return { patientId: s };
    const oid = new Types.ObjectId(s);
    return { $or: [{ patientId: oid }, { patientId: s }] };
  }

  async submit(patientId: string, data: any) {
    const pid = this.toPatientObjectId(patientId);
    const date = data.localDate || new Date().toISOString().split('T')[0];
    let recordedAt = data.recordedAt ? new Date(data.recordedAt) : new Date();
    if (Number.isNaN(recordedAt.getTime())) recordedAt = new Date();

    const prevLog = await this.healthLogModel
      .findOne({ patientId: pid })
      .sort({ recordedAt: -1 })
      .lean()
      .exec();
    const previousWeightKg =
      prevLog?.vitals?.weight != null && (prevLog.vitals as any).weight !== ''
        ? Number((prevLog.vitals as any).weight)
        : null;

    const structured =
      data.symptomStructured && typeof data.symptomStructured === 'object' ? data.symptomStructured : {};
    const derived = deriveSymptomsFromStructured(structured);
    const symptoms =
      derived.length > 0 ? derived : Array.isArray(data.symptoms) ? data.symptoms : [];

    const mergedForScore = { ...data, symptomStructured: structured, symptoms };
    const { score, flagged } = computeRiskScore(mergedForScore, { previousWeightKg });

    const payload = {
      patientId: pid,
      date,
      recordedAt,
      vitals: data.vitals || {},
      symptomStructured: structured,
      symptoms,
      painLevel: data.painLevel ?? 0,
      mood: data.mood || 'good',
      notes: data.notes || '',
      riskScore: score,
      flagged,
      escalationStatus: 'none' as const,
    };

    const doc = await this.healthLogModel.create(payload);
    const docObj = doc.toObject ? doc.toObject() : doc;

    if (flagged) {
      const patient = await this.patientModel
        .findById(pid)
        .select('firstName lastName nurseId doctorId')
        .lean()
        .exec();
      const patientName =
        `${(patient as any)?.firstName || ''} ${(patient as any)?.lastName || ''}`.trim() || 'Patient';
      const nurseId = (patient as any)?.nurseId ? String((patient as any).nurseId) : '';
      const doctorId = (patient as any)?.doctorId ? String((patient as any).doctorId) : '';

      try {
        if (nurseId) {
          const msg = buildVitalAlertMessageFr(patientName, docObj);
          await this.chatService.insertVitalAlertPatientToNurse(
            String(patientId),
            nurseId,
            msg,
            doc._id as Types.ObjectId,
          );
          await this.healthLogModel.updateOne(
            { _id: doc._id },
            { $set: { escalationStatus: 'alert_sent' } },
          );
        }
        await this.notificationService.createRiskAlertsForPatient({
          patientId: pid,
          healthLogId: doc._id as Types.ObjectId,
          riskScore: score,
          hasAssignedNurse: !!nurseId,
        });
      } catch (e) {
        console.error('[HealthLog] Alerte / messagerie:', e);
      }
    }

    await this.gamificationService.awardPoints(String(pid), 'patient', 'health_log');
    return doc;
  }

  /** Infirmier : escalade au médecin référent (messagerie + notification). */
  async escalateToDoctor(user: JwtLike, healthLogId: string, note?: string) {
    if (String(user.role) !== 'nurse') throw new ForbiddenException();
    const uid = this.uid(user);
    const log = await this.healthLogModel.findById(healthLogId).lean().exec();
    if (!log) throw new NotFoundException('Relevé introuvable');
    const st = (log as any).escalationStatus as string;
    if (st === 'resolved') throw new BadRequestException('Ce relevé est déjà clôturé');
    if (st === 'escalated_to_doctor') throw new BadRequestException('Déjà escaladé au médecin');
    if (!(log as any).flagged) {
      throw new BadRequestException('Ce relevé n’est pas marqué comme urgent');
    }

    const patient = await this.patientModel
      .findById((log as any).patientId)
      .select('doctorId nurseId firstName lastName')
      .lean()
      .exec();
    if (!patient) throw new NotFoundException('Patient introuvable');
    if (String((patient as any).nurseId || '') !== uid) {
      throw new ForbiddenException('Vous n’êtes pas l’infirmier référent de ce patient');
    }
    const doctorId = String((patient as any).doctorId || '');
    if (!doctorId) throw new BadRequestException('Aucun médecin référent pour ce patient');

    const nurseDoc = await this.nurseModel.findById(uid).select('firstName lastName').lean().exec();
    const nurseName = nurseDoc
      ? `${(nurseDoc as any).firstName || ''} ${(nurseDoc as any).lastName || ''}`.trim()
      : 'Infirmier(ère)';
    const patientName =
      `${(patient as any).firstName || ''} ${(patient as any).lastName || ''}`.trim() || 'Patient';

    const body = buildEscalationBodyFr(patientName, log, String(note || '').slice(0, 2000), nurseName);
    const pid = String((log as any).patientId);

    await this.chatService.insertEscalationNurseToDoctor(
      pid,
      doctorId,
      uid,
      body,
      new Types.ObjectId(healthLogId),
    );

    await this.healthLogModel.updateOne(
      { _id: new Types.ObjectId(healthLogId) },
      {
        $set: {
          escalationStatus: 'escalated_to_doctor',
          escalatedAt: new Date(),
          escalatedByNurseId: uid,
          escalationNote: String(note || '').slice(0, 2000),
        },
      },
    );

    await this.notificationService.notifyDoctorVitalEscalation({
      doctorId,
      patientId: new Types.ObjectId(pid),
      healthLogId: new Types.ObjectId(healthLogId),
      patientName,
      nurseName,
    });

    await this.gamificationService.awardPoints(uid, 'nurse', 'nurse_escalation');
    return { ok: true };
  }

  /** Médecin référent : clôture l’alerte (message au patient avec la consigne du médecin). */
  async resolveEscalation(user: JwtLike, healthLogId: string, resolutionNote?: string) {
    if (String(user.role) !== 'doctor') throw new ForbiddenException();
    const uid = this.uid(user);
    const note = String(resolutionNote ?? '')
      .trim()
      .slice(0, 4000);
    if (!note) {
      throw new BadRequestException(
        'Rédigez une consigne ou une solution pour le patient avant de clôturer cette alerte.',
      );
    }

    const log = await this.healthLogModel.findById(healthLogId).lean().exec();
    if (!log) throw new NotFoundException('Relevé introuvable');

    const patient = await this.patientModel
      .findById((log as any).patientId)
      .select('doctorId firstName lastName')
      .lean()
      .exec();
    if (!patient) throw new NotFoundException('Patient introuvable');
    if (String((patient as any).doctorId || '') !== uid) {
      throw new ForbiddenException('Vous n’êtes pas le médecin référent de ce patient');
    }

    const st = (log as any).escalationStatus as string;
    if (st === 'resolved') return { ok: true, alreadyResolved: true };
    if (!(log as any).flagged) {
      throw new BadRequestException('Seuls les relevés urgents peuvent être clôturés ainsi');
    }

    const patientName =
      `${(patient as any).firstName || ''} ${(patient as any).lastName || ''}`.trim() || 'Patient';
    const pid = String((log as any).patientId);
    const recorded = (log as any).recordedAt
      ? new Date((log as any).recordedAt).toLocaleString('fr-FR')
      : String((log as any).date || '—');

    const cloture = [
      '✅ Alerte constantes — consigne de votre médecin',
      '',
      `Bonjour ${patientName},`,
      '',
      note,
      '',
      '—',
      `Relevé concerné : ${recorded} (réf. ${healthLogId}).`,
      'Cette alerte est clôturée dans votre dossier. En cas de nouveau symptôme inquiétant, contactez l’équipe soignante ou les urgences.',
    ].join('\n');

    await this.chatService.insertDoctorResolutionCloture(pid, uid, cloture, new Types.ObjectId(healthLogId));

    await this.healthLogModel.updateOne(
      { _id: new Types.ObjectId(healthLogId) },
      {
        $set: {
          escalationStatus: 'resolved',
          resolvedAt: new Date(),
          resolvedByDoctorId: uid,
          doctorResolutionNote: note,
        },
      },
    );

    await this.gamificationService.awardPoints(uid, 'doctor', 'doctor_resolution');
    return { ok: true };
  }

  /**
   * Médecin : historique des escalades infirmier → médecin (tous les patients suivis).
   * `status` : all | pending | resolved
   */
  async listDoctorNurseEscalations(user: JwtLike, statusFilter?: string) {
    if (String(user.role) !== 'doctor') throw new ForbiddenException();
    const uid = this.uid(user);
    const patients = await this.patientModel
      .find({ doctorId: uid })
      .select('firstName lastName')
      .lean()
      .exec();
    if (!patients.length) return [];

    const pids = patients.map((p: any) => p._id);

    const nameByPid = new Map<string, string>();
    for (const p of patients as any[]) {
      nameByPid.set(String(p._id), `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient');
    }

    const match: Record<string, unknown> = {
      patientId: { $in: pids },
      escalatedByNurseId: { $exists: true, $nin: [null, ''] },
    };

    const sf = String(statusFilter || 'all').toLowerCase();
    if (sf === 'pending') {
      match.escalationStatus = 'escalated_to_doctor';
    } else if (sf === 'resolved') {
      match.escalationStatus = 'resolved';
    } else {
      match.escalationStatus = { $in: ['escalated_to_doctor', 'resolved'] };
    }

    const logs = await this.healthLogModel
      .find(match)
      .sort({ escalatedAt: -1, createdAt: -1 })
      .limit(500)
      .lean()
      .exec();

    const nurseIds = [...new Set(logs.map((l: any) => l.escalatedByNurseId).filter(Boolean))];
    const nurseIdOids = nurseIds
      .filter((id) => Types.ObjectId.isValid(String(id)))
      .map((id) => new Types.ObjectId(String(id)));
    const nurseDocs = nurseIdOids.length
      ? await this.nurseModel.find({ _id: { $in: nurseIdOids } }).select('firstName lastName').lean().exec()
      : [];
    const nurseNameById = new Map<string, string>();
    for (const n of nurseDocs as any[]) {
      nurseNameById.set(String(n._id), `${n.firstName || ''} ${n.lastName || ''}`.trim() || 'Infirmier(ère)');
    }

    return logs.map((l: any) => ({
      id: String(l._id),
      patientId: String(l.patientId),
      patientName: nameByPid.get(String(l.patientId)) || 'Patient',
      riskScore: l.riskScore,
      recordedAt: l.recordedAt,
      escalatedAt: l.escalatedAt,
      resolvedAt: l.resolvedAt,
      escalationStatus: l.escalationStatus,
      escalationNote: l.escalationNote || '',
      escalatedByNurseId: l.escalatedByNurseId || '',
      escalatedByNurseName: nurseNameById.get(String(l.escalatedByNurseId)) || '—',
      vitals: l.vitals || {},
      symptoms: Array.isArray(l.symptoms) ? l.symptoms : [],
    }));
  }

  /** Liste des alertes vitales ouvertes pour l’infirmier connecté. */
  /**
   * Super admin : nombre d'alertes vitales encore ouvertes (tous services) + derniers relevés.
   */
  async getPlatformOpenVitalsSummary() {
    const match = {
      flagged: true,
      escalationStatus: { $in: ['alert_sent', 'escalated_to_doctor'] },
    };
    const [openCount, recent] = await Promise.all([
      this.healthLogModel.countDocuments(match).exec(),
      this.healthLogModel
        .find(match)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('patientId recordedAt riskScore escalationStatus')
        .lean()
        .exec(),
    ]);
    const pids = [...new Set(recent.map((r: { patientId?: unknown }) => String(r.patientId)).filter(Boolean))];
    const oids = pids.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
    const patients = oids.length
      ? await this.patientModel.find({ _id: { $in: oids } }).select('firstName lastName').lean().exec()
      : [];
    const nameById = new Map(
      (patients as { _id: unknown; firstName?: string; lastName?: string }[]).map((p) => [
        String(p._id),
        `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient',
      ]),
    );
    return {
      openCount,
      recent: recent.map((l: Record<string, unknown>) => ({
        id: String(l._id),
        patientId: String(l.patientId),
        patientName: nameById.get(String(l.patientId)) || 'Patient',
        recordedAt: l.recordedAt,
        riskScore: l.riskScore,
        escalationStatus: l.escalationStatus,
      })),
    };
  }

  async listOpenAlertsForNurse(user: JwtLike) {
    if (String(user.role) !== 'nurse') throw new ForbiddenException();
    const uid = this.uid(user);
    const patients = await this.patientModel
      .find({ nurseId: uid })
      .select('firstName lastName')
      .lean()
      .exec();
    const pids = patients.map((p: any) => p._id);

    const logs = await this.healthLogModel
      .find({
        patientId: { $in: pids },
        flagged: true,
        escalationStatus: { $in: ['alert_sent', 'escalated_to_doctor'] },
      })
      .sort({ createdAt: -1 })
      .limit(80)
      .lean()
      .exec();

    const nameByPid = new Map<string, string>();
    for (const p of patients as any[]) {
      const n = `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient';
      nameByPid.set(String(p._id), n);
    }

    return logs.map((l: any) => ({
      id: String(l._id),
      patientId: String(l.patientId),
      patientName: nameByPid.get(String(l.patientId)) || 'Patient',
      riskScore: l.riskScore,
      recordedAt: l.recordedAt,
      escalationStatus: l.escalationStatus,
      vitals: l.vitals || {},
    }));
  }

  async getHistory(patientId: string) {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    since.setHours(0, 0, 0, 0);
    const sinceYmd = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, '0')}-${String(since.getDate()).padStart(2, '0')}`;

    const patientPart = this.patientIdFilter(patientId);
    /** Inclure aussi les relevés plus anciens s’ils portent une consigne médecin (dashboard patient). */
    return this.healthLogModel
      .find({
        $and: [
          patientPart,
          {
            $or: [
              { createdAt: { $gte: since } },
              { date: { $gte: sinceYmd } },
              {
                doctorResolutionNote: { $exists: true, $nin: [null, ''] },
              },
            ],
          },
        ],
      })
      .sort({ createdAt: 1, _id: 1 })
      .limit(2000)
      .lean()
      .exec();
  }

  async getLatest(patientId: string) {
    return this.healthLogModel.findOne(this.patientIdFilter(patientId)).sort({ createdAt: -1 }).exec();
  }

  /** Dernière consigne écrite par le médecin lors de la clôture d’une alerte (affichage dashboard patient). */
  async getLatestDoctorResolutionNote(patientId: string) {
    const patientPart = this.patientIdFilter(patientId);
    const docs = await this.healthLogModel
      .find({
        $and: [
          patientPart,
          {
            doctorResolutionNote: { $exists: true, $nin: [null, ''] },
          },
        ],
      })
      .sort({ resolvedAt: -1, createdAt: -1 })
      .limit(5)
      .lean()
      .exec();
    const doc = docs.find((d: any) => String(d?.doctorResolutionNote || '').trim());
    if (!doc) return null;
    const note = String((doc as any).doctorResolutionNote || '').trim();
    if (!note) return null;
    return {
      note,
      resolvedAt: (doc as any).resolvedAt ?? null,
      healthLogId: String((doc as any)._id),
    };
  }
}
