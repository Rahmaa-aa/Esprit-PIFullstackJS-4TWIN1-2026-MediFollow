import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Patient } from '../patient/schemas/patient.schema';
import { Doctor } from '../doctor/schemas/doctor.schema';
import { Nurse } from '../nurse/schemas/nurse.schema';

export type PeerRole = 'patient' | 'doctor' | 'nurse';

export type MailPeer = { role: PeerRole; id: string };

function normDept(s?: string): string {
  return String(s || '')
    .trim()
    .toLowerCase();
}

@Injectable()
export class MailPolicyService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
  ) {}

  private oid(id: string): Types.ObjectId {
    const s = String(id).trim();
    if (!Types.ObjectId.isValid(s)) throw new BadRequestException('Identifiant invalide');
    return new Types.ObjectId(s);
  }

  async deptOfDoctor(id: string): Promise<string> {
    const d = await this.doctorModel.findById(this.oid(id)).select('department').lean().exec();
    if (!d) throw new NotFoundException('Médecin introuvable');
    return normDept((d as any).department);
  }

  async deptOfNurse(id: string): Promise<string> {
    const n = await this.nurseModel.findById(this.oid(id)).select('department').lean().exec();
    if (!n) throw new NotFoundException('Infirmier introuvable');
    return normDept((n as any).department);
  }

  /**
   * Règles :
   * - Patient → uniquement son care team (doctorId / nurseId assignés).
   * - Médecin → tout médecin, tout infirmier ; patients dont il est le médecin référent.
   * - Infirmier → médecins et infirmiers du même département ; patients dont il est l’infirmier référent.
   */
  async assertCanSend(fromRole: string, fromId: string, recipients: MailPeer[]): Promise<void> {
    if (!recipients.length) throw new BadRequestException('Au moins un destinataire');
    const uid = String(fromId);
    const seen = new Set<string>();
    for (const r of recipients) {
      const key = `${r.role}:${r.id}`;
      if (seen.has(key)) throw new BadRequestException('Destinataire en double');
      seen.add(key);
      if (r.id === uid && r.role === fromRole) {
        throw new BadRequestException('Vous ne pouvez pas vous envoyer un message');
      }
    }

    if (fromRole === 'patient') {
      const p = await this.patientModel.findById(this.oid(uid)).select('doctorId nurseId').lean().exec();
      if (!p) throw new NotFoundException('Patient introuvable');
      for (const r of recipients) {
        if (r.role === 'patient') throw new ForbiddenException('Destinataire non autorisé');
        if (r.role === 'doctor') {
          if (String((p as any).doctorId || '') !== String(r.id)) {
            throw new ForbiddenException('Vous ne pouvez écrire qu’à votre médecin référent');
          }
          const d = await this.doctorModel.findById(this.oid(r.id)).select('_id').lean().exec();
          if (!d) throw new NotFoundException('Médecin introuvable');
        } else if (r.role === 'nurse') {
          if (String((p as any).nurseId || '') !== r.id) {
            throw new ForbiddenException('Vous ne pouvez écrire qu’à votre infirmier référent');
          }
          const n = await this.nurseModel.findById(this.oid(r.id)).select('_id').lean().exec();
          if (!n) throw new NotFoundException('Infirmier introuvable');
        }
      }
      return;
    }

    if (fromRole === 'doctor') {
      for (const r of recipients) {
        if (r.role === 'doctor' || r.role === 'nurse') {
          const m =
            r.role === 'doctor'
              ? await this.doctorModel.findById(this.oid(r.id)).select('_id').lean().exec()
              : await this.nurseModel.findById(this.oid(r.id)).select('_id').lean().exec();
          if (!m) throw new NotFoundException(`${r.role === 'doctor' ? 'Médecin' : 'Infirmier'} introuvable`);
          continue;
        }
        if (r.role === 'patient') {
          const p = await this.patientModel.findById(this.oid(r.id)).select('doctorId').lean().exec();
          if (!p) throw new NotFoundException('Patient introuvable');
          if (String((p as any).doctorId || '') !== String(uid)) {
            throw new ForbiddenException('Vous ne pouvez écrire qu’à vos patients assignés');
          }
          continue;
        }
        throw new ForbiddenException('Destinataire non autorisé');
      }
      return;
    }

    if (fromRole === 'nurse') {
      const myDept = await this.deptOfNurse(uid);
      if (!myDept) {
        throw new ForbiddenException('Département non renseigné — contactez l’administrateur');
      }
      for (const r of recipients) {
        if (r.role === 'patient') {
          const p = await this.patientModel.findById(this.oid(r.id)).select('nurseId').lean().exec();
          if (!p) throw new NotFoundException('Patient introuvable');
          if (String((p as any).nurseId || '') !== String(uid)) {
            throw new ForbiddenException('Vous ne pouvez écrire qu’à vos patients assignés');
          }
          continue;
        }
        if (r.role === 'doctor') {
          const dDept = await this.deptOfDoctor(r.id);
          if (dDept !== myDept) {
            throw new ForbiddenException('Destinataire hors de votre département');
          }
          continue;
        }
        if (r.role === 'nurse') {
          const nDept = await this.deptOfNurse(r.id);
          if (nDept !== myDept) {
            throw new ForbiddenException('Destinataire hors de votre département');
          }
          continue;
        }
        throw new ForbiddenException('Destinataire non autorisé');
      }
      return;
    }

    /** Administration / coordination : peuvent adresser n’importe quel patient, médecin ou infirmier (comptes applicatifs). */
    if (['admin', 'superadmin', 'carecoordinator', 'auditor'].includes(fromRole)) {
      for (const r of recipients) {
        if (r.role === 'patient') {
          const p = await this.patientModel.findById(this.oid(r.id)).select('_id').lean().exec();
          if (!p) throw new NotFoundException('Patient introuvable');
          continue;
        }
        if (r.role === 'doctor') {
          const d = await this.doctorModel.findById(this.oid(r.id)).select('_id').lean().exec();
          if (!d) throw new NotFoundException('Médecin introuvable');
          continue;
        }
        if (r.role === 'nurse') {
          const n = await this.nurseModel.findById(this.oid(r.id)).select('_id').lean().exec();
          if (!n) throw new NotFoundException('Infirmier introuvable');
          continue;
        }
        throw new ForbiddenException('Destinataire non autorisé');
      }
      return;
    }

    throw new ForbiddenException('Rôle non autorisé pour la messagerie interne');
  }
}
