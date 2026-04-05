import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Patient } from './schemas/patient.schema';
import { EmailService } from '../auth/email.service';
import { SmsService } from '../auth/sms.service';

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async create(data: Partial<Patient>) {
    const exists = await this.patientModel.findOne({ email: data.email }).exec();
    if (exists) throw new ConflictException('Un patient avec cet email existe déjà');
    if (!data.password) throw new BadRequestException('Le mot de passe est requis');

    const plainPassword = data.password;
    const hashed = await bcrypt.hash(plainPassword, 10);

    const createPayload: any = { ...data, password: hashed };
    if (!createPayload.doctorId) delete createPayload.doctorId;
    if (!createPayload.nurseId) delete createPayload.nurseId;

    const patient = await this.patientModel.create(createPayload);

    try {
      await this.emailService.sendPatientCredentials(
        patient.email,
        plainPassword,
        patient.firstName,
        patient.lastName,
        patient.phone || '',
        patient.address || '',
        patient.city || '',
        patient.country || '',
      );
    } catch (e) {
      console.error('[Patient] Failed to send email:', e?.message || e);
    }

    if (patient.phone) {
      try {
        await this.smsService.sendPatientCredentials(
          patient.phone,
          plainPassword,
          patient.firstName,
          patient.lastName,
          patient.email,
          [patient.address, patient.city, patient.country].filter(Boolean).join(', ') || '',
        );
      } catch (e) {
        console.error('[Patient] Failed to send SMS:', e?.message || e);
      }
    }

    const { password, ...result } = patient.toObject();
    return result;
  }

  async findAll() {
    const patients = await this.patientModel.find().select('-password').sort({ createdAt: -1 }).exec();
    return patients;
  }

  /** Patients dont le médecin référent correspond à doctorId (champ doctorId). */
  async findByAssignedDoctorId(doctorId: string) {
    const id = String(doctorId);
    return this.patientModel
      .find({ doctorId: id })
      .select('-password')
      .sort({ lastName: 1, firstName: 1 })
      .lean()
      .exec();
  }

  async findById(id: string) {
    const patient = await this.patientModel.findById(id).select('-password').exec();
    if (!patient) throw new NotFoundException('Patient non trouvé');
    return patient;
  }

  async update(id: string, data: Partial<Patient>) {
    const patient = await this.patientModel.findById(id).exec();
    if (!patient) throw new NotFoundException('Patient non trouvé');
    if (data.email && data.email !== patient.email) {
      const exists = await this.patientModel.findOne({ email: data.email }).exec();
      if (exists) throw new ConflictException('Un patient avec cet email existe déjà');
    }
    const updateData: any = { ...data };
    delete updateData._id;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    } else {
      delete updateData.password;
    }

    const $unset: Record<string, 1> = {};
    if (Object.prototype.hasOwnProperty.call(data, 'doctorId') && !data.doctorId) {
      delete updateData.doctorId;
      $unset.doctorId = 1;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'nurseId') && !data.nurseId) {
      delete updateData.nurseId;
      $unset.nurseId = 1;
    }

    const mongoUpdate: Record<string, unknown> = { $set: updateData };
    if (Object.keys($unset).length) mongoUpdate.$unset = $unset;

    const updated = await this.patientModel.findByIdAndUpdate(id, mongoUpdate, { new: true }).select('-password').exec();
    return updated;
  }

  async delete(id: string) {
    const patient = await this.patientModel.findByIdAndDelete(id).exec();
    if (!patient) throw new NotFoundException('Patient non trouvé');
    return { message: 'Patient supprimé' };
  }

  async toggleActive(id: string) {
    const patient = await this.patientModel.findById(id).exec();
    if (!patient) throw new NotFoundException('Patient non trouvé');
    const newStatus = patient.isActive === false ? true : false;
    await this.patientModel.updateOne({ _id: id }, { $set: { isActive: newStatus } }).exec();
    return { id, isActive: newStatus, message: newStatus ? 'Compte activé' : 'Compte désactivé' };
  }

  async getCareTeam(id: string) {
    const patient = await this.patientModel.findById(id).select('-password').exec();
    if (!patient) throw new NotFoundException('Patient non trouvé');
    return {
      doctorId: patient.doctorId,
      nurseId: patient.nurseId,
      dischargeDate: (patient as any).dischargeDate,
      admissionDate: (patient as any).admissionDate,
      diagnosis: (patient as any).diagnosis,
      dischargeNotes: (patient as any).dischargeNotes,
    };
  }
}
