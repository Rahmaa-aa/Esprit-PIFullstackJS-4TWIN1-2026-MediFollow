import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StaffNotification } from './schemas/notification.schema';
import { Patient } from '../patient/schemas/patient.schema';
import { Appointment } from '../appointment/schemas/appointment.schema';
import { User } from '../auth/schemas/user.schema';
import {
  appointmentDateTimeLocal,
  formatApptLineFr,
  isIn24hReminderWindow,
  normalizeDoctorIdForQuery,
  appointmentIdString,
} from './notification-appointments.helper';

type RecipientRole = 'doctor' | 'nurse' | 'patient' | 'admin';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(StaffNotification.name) private notificationModel: Model<StaffNotification>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createRiskAlertsForPatient(params: {
    patientId: Types.ObjectId;
    healthLogId: Types.ObjectId;
    riskScore: number;
  }) {
    const patient = await this.patientModel.findById(params.patientId).exec();
    if (!patient) return;

    const p = patient as Patient & { _id: Types.ObjectId };
    const patientName =
      `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email || 'Patient';
    const title = `Urgence — ${patientName}`;
    const body = `Score de risque ${params.riskScore}/100 · constantes ou symptômes à surveiller.`;

    const tasks: Promise<unknown>[] = [];

    if (p.doctorId) {
      tasks.push(
        this.notificationModel.create({
          recipientId: String(p.doctorId),
          recipientRole: 'doctor',
          type: 'risk_alert',
          title,
          body,
          patientId: params.patientId,
          patientName,
          healthLogId: params.healthLogId,
          read: false,
        }),
      );
    }

    if (p.nurseId) {
      tasks.push(
        this.notificationModel.create({
          recipientId: String(p.nurseId),
          recipientRole: 'nurse',
          type: 'risk_alert',
          title,
          body,
          patientId: params.patientId,
          patientName,
          healthLogId: params.healthLogId,
          read: false,
        }),
      );
    }

    await Promise.all(tasks);
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
    const doctorLine = appt.doctorName ? ` · Dr. ${appt.doctorName}` : '';

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
}
