import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StaffNotification } from './schemas/notification.schema';
import { Patient } from '../patient/schemas/patient.schema';
import { Appointment } from '../appointment/schemas/appointment.schema';
import { User } from '../auth/schemas/user.schema';
import { Doctor } from '../doctor/schemas/doctor.schema';
import { Nurse } from '../nurse/schemas/nurse.schema';
import {
  appointmentDateTimeLocal,
  formatApptLineFr,
  isIn24hReminderWindow,
  normalizeDoctorIdForQuery,
  appointmentIdString,
} from './notification-appointments.helper';

type RecipientRole = 'doctor' | 'nurse' | 'patient' | 'admin' | 'carecoordinator';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(StaffNotification.name) private notificationModel: Model<StaffNotification>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
  ) {}

  /**
   * Alerte constantes : priorité infirmier assigné (pas le médecin en parallèle).
   * Si pas d’infirmier, notification au médecin référent uniquement.
   */
  async createRiskAlertsForPatient(params: {
    patientId: Types.ObjectId;
    healthLogId: Types.ObjectId;
    riskScore: number;
    hasAssignedNurse: boolean;
  }) {
    const patient = await this.patientModel.findById(params.patientId).exec();
    if (!patient) return;

    const p = patient as Patient & { _id: Types.ObjectId };
    const patientName =
      `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email || 'Patient';
    const title = `Urgence constantes — ${patientName}`;
    const body = `Score ${params.riskScore}/100 · relevé urgent · voir aussi la messagerie.`;

    if (params.hasAssignedNurse && p.nurseId) {
      await this.notificationModel.create({
        recipientId: String(p.nurseId),
        recipientRole: 'nurse',
        type: 'risk_alert',
        title,
        body,
        patientId: params.patientId,
        patientName,
        healthLogId: params.healthLogId,
        read: false,
        meta: { kind: 'risk_alert', riskScore: params.riskScore, patientName },
      });
      return;
    }

    if (p.doctorId) {
      await this.notificationModel.create({
        recipientId: String(p.doctorId),
        recipientRole: 'doctor',
        type: 'risk_alert',
        title,
        body,
        patientId: params.patientId,
        patientName,
        healthLogId: params.healthLogId,
        read: false,
        meta: { kind: 'risk_alert', riskScore: params.riskScore, patientName },
      });
    }
  }

  /**
   * Analyse photo de bilan avec statut « anomalie » : notifie l’équipe soignante
   * (médecin référent et infirmier assigné, sans doublon si le même id apparaît deux fois).
   */
  async notifyCareTeamLabAnalysisAnomaly(params: {
    patientId: Types.ObjectId;
    labAnalysisRecordId: Types.ObjectId;
    classificationConfidence: number;
    anomalyStrength?: string;
  }) {
    const patient = await this.patientModel
      .findById(params.patientId)
      .select('firstName lastName email doctorId nurseId')
      .lean()
      .exec();
    if (!patient) return;

    const p = patient as {
      firstName?: string;
      lastName?: string;
      email?: string;
      doctorId?: string;
      nurseId?: string;
    };
    const patientName =
      `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email || 'Patient';
    const recordIdStr = String(params.labAnalysisRecordId);
    const title = `Analyse de bilan — signal à surveiller · ${patientName}`;
    const body = `Photo d’analyses avec résultat « anomalie possible » (confiance ${params.classificationConfidence}%). À examiner dans le dossier patient.`;

    const meta: Record<string, unknown> = {
      kind: 'lab_analysis_anomaly',
      patientName,
      labAnalysisRecordId: recordIdStr,
      classificationConfidence: params.classificationConfidence,
      anomalyStrength: params.anomalyStrength ?? 'none',
    };

    const notifiedRecipientIds = new Set<string>();

    const sendTo = async (recipientId: string | undefined, recipientRole: 'doctor' | 'nurse') => {
      if (recipientId == null || !String(recipientId).trim()) return;
      const rid = String(recipientId);
      if (notifiedRecipientIds.has(rid)) return;
      notifiedRecipientIds.add(rid);

      const dup = await this.notificationModel
        .findOne({
          recipientId: rid,
          recipientRole,
          type: 'lab_analysis_anomaly',
          'meta.labAnalysisRecordId': recordIdStr,
        })
        .exec();
      if (dup) return;

      await this.notificationModel.create({
        recipientId: rid,
        recipientRole,
        type: 'lab_analysis_anomaly',
        title,
        body,
        patientId: params.patientId,
        patientName,
        read: false,
        meta,
      });
    };

    await sendTo(p.nurseId, 'nurse');
    await sendTo(p.doctorId, 'doctor');
  }

  /**
   * Patient : analyse IRM assistée (upload) — notifie médecin référent et infirmier assigné.
   */
  async notifyCareTeamBrainMriAnalysis(params: {
    patientId: Types.ObjectId;
    prediction: number;
    probability: number;
  }) {
    const patient = await this.patientModel
      .findById(params.patientId)
      .select('firstName lastName email doctorId nurseId')
      .lean()
      .exec();
    if (!patient) return;

    const p = patient as {
      firstName?: string;
      lastName?: string;
      email?: string;
      doctorId?: string;
      nurseId?: string;
    };
    const patientName =
      `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email || 'Patient';
    const pct = Math.round(params.probability * 1000) / 10;
    const screening =
      params.prediction === 1
        ? 'Dépistage positif (classe tumeur) — à confirmer cliniquement.'
        : 'Pas de signal positif au seuil du modèle.';
    const title = `Analyse IRM cérébrale — ${patientName}`;
    const body = `${patientName} a effectué une analyse d’assistance IRM. ${screening} Score modèle : ${pct} %.`;

    const meta: Record<string, unknown> = {
      kind: 'brain_mri_patient_analysis',
      patientName,
      prediction: params.prediction,
      probability: params.probability,
    };

    const notifiedRecipientIds = new Set<string>();

    const sendTo = async (recipientId: string | undefined, recipientRole: 'doctor' | 'nurse') => {
      if (recipientId == null || !String(recipientId).trim()) return;
      const rid = String(recipientId);
      if (notifiedRecipientIds.has(rid)) return;
      notifiedRecipientIds.add(rid);

      await this.notificationModel.create({
        recipientId: rid,
        recipientRole,
        type: 'brain_mri_patient_analysis',
        title,
        body,
        patientId: params.patientId,
        patientName,
        read: false,
        meta,
      });
    };

    await sendTo(p.nurseId, 'nurse');
    await sendTo(p.doctorId, 'doctor');
  }

  /** Escalade infirmier → médecin (messagerie + notification médecin). */
  async notifyDoctorVitalEscalation(params: {
    doctorId: string;
    patientId: Types.ObjectId;
    healthLogId: Types.ObjectId;
    patientName: string;
    nurseName: string;
  }) {
    const title = `Escalade infirmier — ${params.patientName}`;
    const body = `${params.nurseName} sollicite votre avis pour un cas de constantes vitales critiques.`;
    await this.notificationModel.create({
      recipientId: params.doctorId,
      recipientRole: 'doctor',
      type: 'vital_escalation',
      title,
      body,
      patientId: params.patientId,
      patientName: params.patientName,
      healthLogId: params.healthLogId,
      read: false,
      meta: {
        kind: 'vital_escalation',
        nurseName: params.nurseName,
        patientName: params.patientName,
      },
    });
  }

  /** Nouveau RDV confirmé / ajouté à l’agenda du médecin. */
  async notifyDoctorNewAppointment(appt: {
    _id: Types.ObjectId;
    patientId: Types.ObjectId;
    doctorId?: string;
    title?: string;
    date?: string;
    time?: string;
  }) {
    const doctorId = normalizeDoctorIdForQuery(appt.doctorId);
    if (!doctorId) return;

    const dup = await this.notificationModel
      .findOne({
        recipientId: doctorId,
        recipientRole: 'doctor',
        type: 'appointment_new',
        appointmentId: appt._id,
      })
      .exec();
    if (dup) return;

    const patient = await this.patientModel.findById(appt.patientId).select('firstName lastName email').lean().exec();
    const patientName = patient
      ? `${(patient as any).firstName || ''} ${(patient as any).lastName || ''}`.trim() || (patient as any).email || 'Patient'
      : 'Patient';

    const title = appt.title || 'Consultation';
    const line = formatApptLineFr(String(appt.date || ''), String(appt.time || ''));

    await this.notificationModel.create({
      recipientId: doctorId,
      recipientRole: 'doctor',
      type: 'appointment_new',
      title: `Nouveau rendez-vous — ${patientName}`,
      body: `${title} · ${line}`,
      patientId: appt.patientId,
      patientName,
      appointmentId: appt._id,
      read: false,
      meta: {
        kind: 'appointment_new',
        appointmentTitle: title,
        date: String(appt.date || ''),
        time: String(appt.time || ''),
        patientName,
      },
    });
  }

  /** Demande de RDV patient (statut pending) — notifie tous les admins / super-admins actifs. */
  async notifyAdminsAppointmentRequest(appt: {
    _id: Types.ObjectId;
    patientId: Types.ObjectId;
    doctorId?: string;
    doctorName?: string;
    title?: string;
    date?: string;
    time?: string;
    requestedDate?: string;
    requestedTime?: string;
  }) {
    const admins = await this.userModel
      .find({ role: { $in: ['admin', 'superadmin'] }, isActive: true })
      .select('_id')
      .lean()
      .exec();
    if (!admins.length) return;

    const patient = await this.patientModel.findById(appt.patientId).select('firstName lastName email').lean().exec();
    const patientName = patient
      ? `${(patient as any).firstName || ''} ${(patient as any).lastName || ''}`.trim() || (patient as any).email || 'Patient'
      : 'Patient';

    const titleMed = appt.title || 'Demande de rendez-vous';
    const line = formatApptLineFr(
      String(appt.requestedDate || appt.date || ''),
      String(appt.requestedTime || appt.time || ''),
    );
    const rawDn = String(appt.doctorName || '')
      .trim()
      .replace(/^Dr\.?\s+/i, '');
    const doctorLine = rawDn ? ` · Dr. ${rawDn}` : '';

    for (const a of admins) {
      const rid = String((a as { _id: Types.ObjectId })._id);
      const dup = await this.notificationModel
        .findOne({
          recipientId: rid,
          recipientRole: 'admin',
          type: 'appointment_request',
          appointmentId: appt._id,
        })
        .exec();
      if (dup) continue;

      await this.notificationModel.create({
        recipientId: rid,
        recipientRole: 'admin',
        type: 'appointment_request',
        title: `Nouvelle demande de RDV — ${patientName}`,
        body: `${titleMed} · ${line}${doctorLine}`,
        patientId: appt.patientId,
        patientName,
        appointmentId: appt._id,
        read: false,
        meta: {
          kind: 'appointment_request',
          appointmentTitle: titleMed,
          date: String(appt.requestedDate || appt.date || ''),
          time: String(appt.requestedTime || appt.time || ''),
          patientName,
          doctorName: rawDn || undefined,
        },
      });
    }
  }

  private localTodayYmd(): string {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }

  /** Rappels virtuels J-24h (pas stockés en base). */
  private async buildAppointment24hVirtuals(
    userId: string,
    role: RecipientRole,
  ): Promise<
    {
      _id: string;
      virtual: boolean;
      type: string;
      title: string;
      body: string;
      read: boolean;
      createdAt: Date;
      sortAt: Date;
      patientId: unknown;
      patientName?: string;
      appointmentId: unknown;
      meta?: Record<string, unknown>;
    }[]
  > {
    const today = this.localTodayYmd();
    const now = new Date();
    const q: Record<string, unknown> = {
      status: { $in: ['confirmed', 'scheduled'] },
      date: { $gte: today },
    };

    if (role === 'patient') {
      if (!Types.ObjectId.isValid(userId)) return [];
      q.patientId = new Types.ObjectId(userId);
    } else if (role === 'doctor') {
      q.doctorId = normalizeDoctorIdForQuery(userId);
    } else {
      return [];
    }

    const rows = await this.appointmentModel.find(q).sort({ date: 1, time: 1 }).limit(80).lean().exec();

    const out: {
      _id: string;
      virtual: boolean;
      type: string;
      title: string;
      body: string;
      read: boolean;
      createdAt: Date;
      sortAt: Date;
      patientId: unknown;
      patientName?: string;
      appointmentId: unknown;
      meta?: Record<string, unknown>;
    }[] = [];

    for (const row of rows) {
      const apptAt = appointmentDateTimeLocal(String(row.date || ''), String(row.time || ''));
      if (!apptAt || !isIn24hReminderWindow(apptAt, now)) continue;

      const aid = row._id;
      const pid = row.patientId;
      let patientName = '';
      if (pid) {
        const p = await this.patientModel.findById(pid).select('firstName lastName email').lean().exec();
        patientName = p
          ? `${(p as any).firstName || ''} ${(p as any).lastName || ''}`.trim() || (p as any).email || ''
          : '';
      }
      const titleMed = String(row.title || 'Rendez-vous');
      const line = formatApptLineFr(String(row.date || ''), String(row.time || ''));
      const idStr = appointmentIdString(aid);

      out.push({
        _id: `virt-apt-${idStr}`,
        virtual: true,
        type: 'appointment_reminder_24h',
        title:
          role === 'patient'
            ? 'Rappel : rendez-vous à venir'
            : `Rappel : RDV avec ${patientName || 'patient'}`,
        body: `${titleMed} · ${line}`,
        read: false,
        createdAt: now,
        sortAt: apptAt,
        patientId: pid,
        patientName: patientName || undefined,
        appointmentId: aid,
        meta: {
          kind: 'appointment_reminder_24h',
          reminderRole: role === 'patient' ? 'patient' : 'doctor',
          appointmentTitle: titleMed,
          date: String(row.date || ''),
          time: String(row.time || ''),
          patientName: patientName || '',
        },
      });
    }

    return out;
  }

  async listForUser(recipientId: string, recipientRole: RecipientRole, limit = 50) {
    const rid = String(recipientId).trim();
    return this.notificationModel
      .find({ recipientId: rid, recipientRole })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  async countUnread(recipientId: string, recipientRole: RecipientRole) {
    const rid = String(recipientId).trim();
    return this.notificationModel.countDocuments({ recipientId: rid, recipientRole, read: false }).exec();
  }

  async markRead(id: string, recipientId: string, recipientRole: RecipientRole) {
    if (String(id).startsWith('virt-')) return null;
    if (!Types.ObjectId.isValid(id)) return null;
    return this.notificationModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), recipientId: String(recipientId), recipientRole },
        { read: true },
        { new: true },
      )
      .exec();
  }

  async markAllRead(recipientId: string, recipientRole: RecipientRole) {
    return this.notificationModel
      .updateMany({ recipientId: String(recipientId), recipientRole, read: false }, { read: true })
      .exec();
  }

  async deleteOne(id: string, recipientId: string, recipientRole: RecipientRole) {
    if (String(id).startsWith('virt-')) return { deleted: false };
    if (!Types.ObjectId.isValid(id)) return { deleted: false };
    const res = await this.notificationModel
      .deleteOne({
        _id: new Types.ObjectId(id),
        recipientId: String(recipientId),
        recipientRole,
      })
      .exec();
    return { deleted: res.deletedCount > 0 };
  }

  async deleteAllForUser(recipientId: string, recipientRole: RecipientRole): Promise<any> {
    return this.notificationModel
      .deleteMany({ recipientId: String(recipientId), recipientRole })
      .exec();
  }

  async getMergedNotifications(userId: string, role: RecipientRole) {
    const withVirtuals = role === 'doctor' || role === 'patient';
    const [dbItems, virtuals, unreadDb] = await Promise.all([
      this.listForUser(userId, role),
      withVirtuals ? this.buildAppointment24hVirtuals(userId, role) : Promise.resolve([]),
      this.countUnread(userId, role),
    ]);

    const merged = [...virtuals, ...dbItems].sort((a, b) => {
      const ta = new Date((a as any).sortAt || (a as any).createdAt || 0).getTime();
      const tb = new Date((b as any).sortAt || (b as any).createdAt || 0).getTime();
      return tb - ta;
    });

    const unread = unreadDb + virtuals.length;
    return { items: merged, unread };
  }

  /** Rôle du compte (JWT sub) pour les notifications. */
  async resolveRecipientRoleForId(
    id: string,
  ): Promise<'doctor' | 'nurse' | 'patient' | 'admin' | null> {
    const s = String(id).trim();
    if (!Types.ObjectId.isValid(s)) return null;
    const oid = new Types.ObjectId(s);
    const [p, d, n] = await Promise.all([
      this.patientModel.exists({ _id: oid }),
      this.doctorModel.exists({ _id: oid }),
      this.nurseModel.exists({ _id: oid }),
    ]);
    if (p) return 'patient';
    if (d) return 'doctor';
    if (n) return 'nurse';
    const u = await this.userModel.findById(oid).select('role').lean().exec();
    const role = (u as { role?: string } | null)?.role;
    if (role === 'admin' || role === 'superadmin') return 'admin';
    return null;
  }

  async resolveChatSenderName(senderRole: string, senderId: string): Promise<string> {
    const s = String(senderId).trim();
    if (!Types.ObjectId.isValid(s)) return 'Contact';
    const oid = new Types.ObjectId(s);
    if (senderRole === 'patient') {
      const p = await this.patientModel.findById(oid).select('firstName lastName email').lean().exec();
      if (!p) return 'Patient';
      const name = `${(p as any).firstName || ''} ${(p as any).lastName || ''}`.trim();
      return name || (p as any).email || 'Patient';
    }
    if (senderRole === 'doctor') {
      const d = await this.doctorModel.findById(oid).select('firstName lastName').lean().exec();
      if (!d) return 'Médecin';
      const name = `${(d as any).firstName || ''} ${(d as any).lastName || ''}`.trim();
      return name ? `Dr. ${name}` : 'Médecin';
    }
    if (senderRole === 'nurse') {
      const n = await this.nurseModel.findById(oid).select('firstName lastName').lean().exec();
      if (!n) return 'Infirmier(ère)';
      const name = `${(n as any).firstName || ''} ${(n as any).lastName || ''}`.trim();
      return name || 'Infirmier(ère)';
    }
    if (senderRole === 'carecoordinator') {
      const usr = await this.userModel.findById(oid).select('firstName lastName email name').lean().exec();
      if (!usr) return 'Coordinateur';
      const name = `${(usr as any).firstName || ''} ${(usr as any).lastName || ''}`.trim() || (usr as any).name || (usr as any).email;
      return name || 'Coordinateur';
    }
    return 'Contact';
  }

  private buildChatNotificationContent(
    kind: string,
    bodyText: string,
    senderName: string,
  ): { type: string; title: string; body: string } {
    if (kind === 'call') {
      try {
        const j = JSON.parse(bodyText) as { outcome?: string; durationSec?: number };
        const o = String(j?.outcome || '');
        const line =
          o === 'ended'
            ? j.durationSec != null && typeof j.durationSec === 'number'
              ? `Appel terminé (${Math.round(j.durationSec)} s)`
              : 'Appel terminé'
            : o === 'missed'
              ? 'Appel manqué'
              : o === 'declined'
                ? 'Appel refusé'
                : o === 'cancelled'
                  ? 'Appel annulé'
                  : 'Appel';
        return { type: 'chat_call_log', title: `${line} — ${senderName}`, body: line };
      } catch {
        return { type: 'chat_call_log', title: `Appel — ${senderName}`, body: 'Appel' };
      }
    }
    if (kind === 'voice') {
      return { type: 'chat_message', title: `Message vocal — ${senderName}`, body: 'Message vocal' };
    }
    if (kind === 'image') {
      return { type: 'chat_message', title: `Photo — ${senderName}`, body: 'Photo' };
    }
    if (kind === 'video') {
      return { type: 'chat_message', title: `Vidéo — ${senderName}`, body: 'Vidéo' };
    }
    if (kind === 'document') {
      return { type: 'chat_message', title: `Document — ${senderName}`, body: 'Document' };
    }
    const t = bodyText.slice(0, 160);
    return { type: 'chat_message', title: `Message — ${senderName}`, body: t || 'Nouveau message' };
  }

  /** Libellé du destinataire pour la copie « message envoyé » (expéditeur). */
  private async resolveOutboundRecipientLabel(
    routing: { patientId?: string; peerRole?: 'doctor' | 'nurse' | 'carecoordinator'; peerId?: string },
    senderRole: string,
    senderId: string,
  ): Promise<string> {
    if (senderRole === 'patient' && routing.peerRole && routing.peerId) {
      if (routing.peerRole === 'doctor') {
        const d = await this.doctorModel.findById(routing.peerId).select('firstName lastName').lean().exec();
        if (!d) return 'Médecin';
        const name = `${(d as any).firstName || ''} ${(d as any).lastName || ''}`.trim();
        return name ? `Dr. ${name}` : 'Médecin';
      }
      if (routing.peerRole === 'carecoordinator') {
        const usr = await this.userModel.findById(routing.peerId).select('firstName lastName name email').lean().exec();
        if (!usr) return 'Coordinateur';
        const name =
          `${(usr as any).firstName || ''} ${(usr as any).lastName || ''}`.trim() ||
          (usr as any).name ||
          (usr as any).email;
        return name || 'Coordinateur';
      }
      const n = await this.nurseModel.findById(routing.peerId).select('firstName lastName').lean().exec();
      if (!n) return 'Infirmier(ère)';
      return `${(n as any).firstName || ''} ${(n as any).lastName || ''}`.trim() || 'Infirmier(ère)';
    }
    if (routing.peerRole && routing.peerId && senderRole !== 'patient') {
      if (routing.peerRole === 'doctor') {
        const d = await this.doctorModel.findById(routing.peerId).select('firstName lastName').lean().exec();
        if (!d) return 'Médecin';
        const name = `${(d as any).firstName || ''} ${(d as any).lastName || ''}`.trim();
        return name ? `Dr. ${name}` : 'Médecin';
      }
      if (routing.peerRole === 'carecoordinator') {
        const usr = await this.userModel.findById(routing.peerId).select('firstName lastName name email').lean().exec();
        if (!usr) return 'Coordinateur';
        const name = `${(usr as any).firstName || ''} ${(usr as any).lastName || ''}`.trim() || (usr as any).name || (usr as any).email;
        return name || 'Coordinateur';
      }
      const n = await this.nurseModel.findById(routing.peerId).select('firstName lastName').lean().exec();
      if (!n) return 'Infirmier(ère)';
      return `${(n as any).firstName || ''} ${(n as any).lastName || ''}`.trim() || 'Infirmier(ère)';
    }
    if (senderRole === 'patient' && routing.patientId && !routing.peerRole) {
      const pid = String(routing.patientId);
      if (pid !== senderId) return '';
      return 'Équipe soignante';
    }
    if (senderRole === 'doctor' || senderRole === 'nurse' || senderRole === 'carecoordinator') {
      const pid = String(routing.patientId || '');
      if (pid) {
        const p = await this.patientModel.findById(pid).select('firstName lastName email').lean().exec();
        if (!p) return 'Patient';
        const name = `${(p as any).firstName || ''} ${(p as any).lastName || ''}`.trim();
        return name || (p as any).email || 'Patient';
      }
    }
    return '';
  }

  private buildSenderOutboxContent(
    kind: string,
    bodyText: string,
    recipientLabel: string,
  ): { type: string; title: string; body: string } {
    if (kind === 'call') {
      try {
        const j = JSON.parse(bodyText) as { outcome?: string; durationSec?: number };
        const o = String(j?.outcome || '');
        if (o === 'missed') {
          return {
            type: 'chat_message_sent',
            title: `Appel sans réponse — ${recipientLabel}`,
            body: 'Appel non décroché',
          };
        }
        const line =
          o === 'ended'
            ? j.durationSec != null && typeof j.durationSec === 'number'
              ? `Appel terminé (${Math.round(j.durationSec)} s)`
              : 'Appel terminé'
            : o === 'declined'
              ? 'Appel refusé'
              : o === 'cancelled'
                ? 'Appel annulé'
                : 'Appel';
        return { type: 'chat_message_sent', title: `${line} — ${recipientLabel}`, body: line };
      } catch {
        return { type: 'chat_message_sent', title: `Appel — ${recipientLabel}`, body: 'Appel' };
      }
    }
    if (kind === 'voice') {
      return {
        type: 'chat_message_sent',
        title: `Message vocal envoyé à ${recipientLabel}`,
        body: 'Message vocal',
      };
    }
    if (kind === 'image') {
      return { type: 'chat_message_sent', title: `Photo envoyée à ${recipientLabel}`, body: 'Photo' };
    }
    if (kind === 'video') {
      return { type: 'chat_message_sent', title: `Vidéo envoyée à ${recipientLabel}`, body: 'Vidéo' };
    }
    if (kind === 'document') {
      return { type: 'chat_message_sent', title: `Document envoyé à ${recipientLabel}`, body: 'Document' };
    }
    const t = bodyText.slice(0, 160);
    return {
      type: 'chat_message_sent',
      title: `Message envoyé à ${recipientLabel}`,
      body: t || 'Message',
    };
  }

  private async resolveChatRecipients(params: {
    senderRole: string;
    senderId: string;
    routing: { patientId?: string; peerRole?: 'doctor' | 'nurse' | 'carecoordinator'; peerId?: string };
  }): Promise<{ recipientId: string; recipientRole: 'doctor' | 'nurse' | 'patient' | 'carecoordinator' }[]> {
    const { senderRole, senderId, routing } = params;
    const out: { recipientId: string; recipientRole: 'doctor' | 'nurse' | 'patient' | 'carecoordinator' }[] = [];

    if (senderRole === 'patient' && routing.peerRole && routing.peerId) {
      out.push({ recipientId: routing.peerId, recipientRole: routing.peerRole });
      return out;
    }

    if (routing.peerRole && routing.peerId && senderRole !== 'patient') {
      out.push({
        recipientId: routing.peerId,
        recipientRole: routing.peerRole as 'doctor' | 'nurse' | 'carecoordinator',
      });
      return out;
    }

    if (senderRole === 'patient' && routing.patientId && !routing.peerRole) {
      const pid = String(routing.patientId);
      if (pid !== senderId) return [];
      const pat = await this.patientModel.findById(pid).select('doctorId nurseId').lean().exec();
      if (!pat) return [];
      const docId = (pat as any).doctorId ? String((pat as any).doctorId) : '';
      const nurseId = (pat as any).nurseId ? String((pat as any).nurseId) : '';
      if (docId) out.push({ recipientId: docId, recipientRole: 'doctor' });
      if (nurseId) out.push({ recipientId: nurseId, recipientRole: 'nurse' });
      return out;
    }

    if (senderRole === 'doctor' || senderRole === 'nurse' || senderRole === 'carecoordinator') {
      const pid = String(routing.patientId || '');
      if (pid) {
        out.push({ recipientId: pid, recipientRole: 'patient' });
        return out;
      }
    }

    return [];
  }

  async notifyChatDispatch(params: {
    senderRole: 'patient' | 'doctor' | 'nurse' | 'carecoordinator';
    senderId: string;
    senderName: string;
    routing: { patientId?: string; peerRole?: 'doctor' | 'nurse' | 'carecoordinator'; peerId?: string };
    kind: 'text' | 'voice' | 'image' | 'video' | 'document' | 'call';
    bodyText: string;
    mappedPatientId?: string;
  }) {
    const recipients = await this.resolveChatRecipients({
      senderRole: params.senderRole,
      senderId: params.senderId,
      routing: params.routing,
    });
    const { type, title, body } = this.buildChatNotificationContent(
      params.kind,
      params.bodyText,
      params.senderName,
    );

    let patientOid: Types.ObjectId | undefined;
    const mp = params.mappedPatientId || params.routing.patientId;
    if (mp && Types.ObjectId.isValid(String(mp))) {
      patientOid = new Types.ObjectId(String(mp));
    }

    const tasks: Promise<unknown>[] = [];
    for (const r of recipients) {
      if (r.recipientId === params.senderId) continue;
      tasks.push(
        this.notificationModel.create({
          recipientId: r.recipientId,
          recipientRole: r.recipientRole,
          type,
          title,
          body,
          patientId: patientOid,
          patientName: undefined,
          read: false,
        }),
      );
    }
    await Promise.all(tasks);

    /* Copie pour l’expéditeur : visible dans la cloche (sinon seul le destinataire est notifié). */
    const label = await this.resolveOutboundRecipientLabel(
      params.routing,
      params.senderRole,
      params.senderId,
    );
    if (label) {
      const out = this.buildSenderOutboxContent(params.kind, params.bodyText, label);
      let senderPatientOid: Types.ObjectId | undefined;
      const mp = params.mappedPatientId || params.routing.patientId;
      if (mp && Types.ObjectId.isValid(String(mp))) {
        senderPatientOid = new Types.ObjectId(String(mp));
      }
      await this.notificationModel.create({
        recipientId: params.senderId,
        recipientRole: params.senderRole,
        type: out.type,
        title: out.title,
        body: out.body,
        patientId: senderPatientOid,
        read: false,
      });
    }
  }

  /** Messages dans un groupe (personnel + patients membres). */
  async notifyGroupChatMessage(params: {
    senderRole: 'doctor' | 'nurse' | 'patient';
    senderId: string;
    senderName: string;
    groupName: string;
    members: { role: 'doctor' | 'nurse' | 'patient'; id: string }[];
    kind: 'text' | 'voice' | 'image' | 'video' | 'document' | 'call';
    bodyText: string;
  }) {
    const { senderRole, senderId, senderName, groupName, members, kind, bodyText } = params;
    const base = this.buildChatNotificationContent(kind, bodyText, senderName);
    const titleIn = `${groupName} — ${base.title}`;
    const tasks: Promise<unknown>[] = [];
    for (const m of members) {
      if (m.id === senderId && m.role === senderRole) continue;
      tasks.push(
        this.notificationModel.create({
          recipientId: m.id,
          recipientRole: m.role,
          type: base.type,
          title: titleIn,
          body: base.body,
          read: false,
        }),
      );
    }
    await Promise.all(tasks);
    const out = this.buildSenderOutboxContent(kind, bodyText, groupName);
    await this.notificationModel.create({
      recipientId: senderId,
      recipientRole: senderRole,
      type: out.type,
      title: out.title,
      body: out.body,
      read: false,
    });
  }

  /** Nouveau message interne (messagerie MediFollow) — un enregistrement par destinataire. */
  async notifyNewInternalMail(params: {
    messageId: string;
    subject: string;
    senderName: string;
    recipients: { role: 'patient' | 'doctor' | 'nurse'; id: string; stateId: string }[];
  }) {
    const subj = String(params.subject || '').trim() || '(Sans objet)';
    const preview = subj.slice(0, 200);
    const tasks = params.recipients.map((r) =>
      this.notificationModel.create({
        recipientId: r.id,
        recipientRole: r.role,
        type: 'mail_inbox',
        title: `Nouveau message — ${params.senderName}`,
        body: preview,
        read: false,
        meta: {
          kind: 'mail_inbox',
          messageId: params.messageId,
          stateId: r.stateId,
          subject: subj,
          senderName: params.senderName,
        },
      }),
    );
    await Promise.all(tasks);
  }

  /** Appel WebRTC entrant (socket voice:invite). */
  async notifyVoiceInvite(params: {
    calleeUserId: string;
    callerName: string;
    isVideo: boolean;
  }) {
    const role = await this.resolveRecipientRoleForId(params.calleeUserId);
    if (!role || role === 'admin') return;

    const title = params.isVideo
      ? `Appel vidéo — ${params.callerName}`
      : `Appel vocal — ${params.callerName}`;
    const body = `Appel entrant${params.isVideo ? ' (vidéo)' : ''}`;

    await this.notificationModel.create({
      recipientId: params.calleeUserId,
      recipientRole: role,
      type: 'chat_voice_invite',
      title,
      body,
      read: false,
      meta: {
        kind: 'chat_voice_invite',
        callerName: params.callerName,
        isVideo: params.isVideo,
      },
    });
  }
}
