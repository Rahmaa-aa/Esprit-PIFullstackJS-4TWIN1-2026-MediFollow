import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Doctor } from './schemas/doctor.schema';
import { EmailService } from '../auth/email.service';
import { DepartmentService } from '../department/department.service';

type Requester = { role?: string; id?: unknown; department?: string };

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    private emailService: EmailService,
    private departmentService: DepartmentService,
  ) {}

  private async assertHospitalAdminManagesDoctor(requester: Requester | undefined, doctorId: string) {
    if (requester?.role !== 'admin') return;
    const dept = await this.departmentService.resolveHospitalAdminDepartmentName(requester);
    if (!dept) throw new ForbiddenException('Aucun département assigné à votre profil');
    const d = await this.doctorModel.findById(doctorId).select('department').lean().exec();
    if (!d || String((d as { department?: string }).department || '').trim() !== dept) {
      throw new ForbiddenException('Ce médecin n’appartient pas à votre département');
    }
  }

  async create(data: Partial<Doctor>, requester?: Requester) {
    const payload: any = { ...data };
    if (requester?.role === 'admin') {
      const dept = await this.departmentService.resolveHospitalAdminDepartmentName(requester);
      if (!dept) {
        throw new ForbiddenException('Aucun département assigné : impossible de créer un médecin');
      }
      payload.department = dept;
    }
    const exists = await this.doctorModel.findOne({ email: payload.email }).exec();
    if (exists) throw new ConflictException('Un médecin avec cet email existe déjà');
    if (!payload.password) throw new BadRequestException('Le mot de passe est requis');
    const plainPassword = payload.password;
    const hashed = await bcrypt.hash(plainPassword, 10);
    const doctor = await this.doctorModel.create({
      ...payload,
      password: hashed,
    });
    try {
      await this.emailService.sendDoctorCredentials(
        doctor.email,
        plainPassword,
        doctor.firstName,
        doctor.lastName,
      );
    } catch (e) {
      console.error('[Doctor] Failed to send credentials email:', e?.message || e);
    }
    const { password, ...result } = doctor.toObject();
    return result;
  }

  async findAll(requester?: Requester) {
    if (requester?.role === 'admin') {
      const dept = await this.departmentService.resolveHospitalAdminDepartmentName(requester);
      if (!dept) return [];
      return this.doctorModel.find({ department: dept }).select('-password').sort({ createdAt: -1 }).exec();
    }
    return this.doctorModel.find().select('-password').sort({ createdAt: -1 }).exec();
  }

  async findById(id: string, requester?: Requester) {
    const doctor = await this.doctorModel.findById(id).select('-password').exec();
    if (!doctor) throw new NotFoundException('Médecin non trouvé');
    await this.assertHospitalAdminManagesDoctor(requester, id);
    return doctor;
  }

  async update(id: string, data: Partial<Doctor>, requester?: Requester) {
    await this.assertHospitalAdminManagesDoctor(requester, id);
    const doctor = await this.doctorModel.findById(id).exec();
    if (!doctor) throw new NotFoundException('Médecin non trouvé');
    if (requester?.role === 'admin') {
      const dept = await this.departmentService.resolveHospitalAdminDepartmentName(requester);
      if (dept) data = { ...data, department: dept };
    }
    if (data.email && data.email !== doctor.email) {
      const exists = await this.doctorModel.findOne({ email: data.email }).exec();
      if (exists) throw new ConflictException('Un médecin avec cet email existe déjà');
    }
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    } else {
      delete updateData.password;
    }
    delete updateData._id;
    const updated = await this.doctorModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select('-password').exec();
    return updated;
  }

  async delete(id: string, requester?: Requester) {
    await this.assertHospitalAdminManagesDoctor(requester, id);
    const doctor = await this.doctorModel.findByIdAndDelete(id).exec();
    if (!doctor) throw new NotFoundException('Médecin non trouvé');
    return { message: 'Médecin supprimé' };
  }

  async toggleActive(id: string, requester?: Requester) {
    await this.assertHospitalAdminManagesDoctor(requester, id);
    const doctor = await this.doctorModel.findById(id).exec();
    if (!doctor) throw new NotFoundException('Médecin non trouvé');
    const newStatus = doctor.isActive === false ? true : false;
    await this.doctorModel.updateOne({ _id: id }, { $set: { isActive: newStatus } }).exec();
    return { id, isActive: newStatus, message: newStatus ? 'Compte activé' : 'Compte désactivé' };
  }
}
