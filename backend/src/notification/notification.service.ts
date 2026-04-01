import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StaffNotification } from './schemas/notification.schema';
import { Patient } from '../patient/schemas/patient.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(StaffNotification.name) private notificationModel: Model<StaffNotification>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
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

  async listForStaff(recipientId: string, recipientRole: 'doctor' | 'nurse', limit = 40) {
    const rid = String(recipientId).trim();
    return this.notificationModel
      .find({ recipientId: rid, recipientRole })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  async countUnread(recipientId: string, recipientRole: 'doctor' | 'nurse') {
    const rid = String(recipientId).trim();
    return this.notificationModel.countDocuments({ recipientId: rid, recipientRole, read: false }).exec();
  }

  async markRead(id: string, recipientId: string, recipientRole: 'doctor' | 'nurse') {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.notificationModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), recipientId: String(recipientId), recipientRole },
        { read: true },
        { new: true },
      )
      .exec();
  }

  async markAllRead(recipientId: string, recipientRole: 'doctor' | 'nurse') {
    return this.notificationModel
      .updateMany({ recipientId: String(recipientId), recipientRole, read: false }, { read: true })
      .exec();
  }
}
