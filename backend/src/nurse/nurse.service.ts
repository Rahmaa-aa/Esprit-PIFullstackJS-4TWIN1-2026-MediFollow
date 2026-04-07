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
import { Nurse } from './schemas/nurse.schema';
import { EmailService } from '../auth/email.service';
import { DepartmentService } from '../department/department.service';

type Requester = { role?: string; id?: unknown; department?: string };

@Injectable()
export class NurseService {
  constructor(
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
    private emailService: EmailService,
    private departmentService: DepartmentService,
  ) {}

  private async assertHospitalAdminManagesNurse(requester: Requester | undefined, nurseId: string) {
    if (requester?.role !== 'admin') return;
    const dept = await this.departmentService.resolveHospitalAdminDepartmentName(requester);
    if (!dept) throw new ForbiddenException('Aucun département assigné à votre profil');
    const n = await this.nurseModel.findById(nurseId).select('department').lean().exec();
    if (!n || String((n as { department?: string }).department || '').trim() !== dept) {
      throw new ForbiddenException('Cet infirmier n’appartient pas à votre département');
    }
  }

  async create(data: Partial<Nurse>, requester?: Requester) {
    const payload: any = { ...data };
    if (requester?.role === 'admin') {
      const dept = await this.departmentService.resolveHospitalAdminDepartmentName(requester);
      if (!dept) {
        throw new ForbiddenException('Aucun département assigné : impossible de créer un infirmier');
      }
      payload.department = dept;
    }
    const exists = await this.nurseModel.findOne({ email: payload.email }).exec();
    if (exists) throw new ConflictException('Une infirmière avec cet email existe déjà');
    if (!payload.password) throw new BadRequestException('Le mot de passe est requis');
    const plainPassword = payload.password;
    const hashed = await bcrypt.hash(plainPassword, 10);
    const nurse = await this.nurseModel.create({
      ...payload,
      password: hashed,
    });
    try {
      await this.emailService.sendNurseCredentials(
        nurse.email,
        plainPassword,
        nurse.firstName,
        nurse.lastName,
      );
    } catch (e) {
      console.error('[Nurse] Failed to send credentials email:', e?.message || e);
    }
    const { password, ...result } = nurse.toObject();
    return result;
  }

  async findAll(requester?: Requester) {
    if (requester?.role === 'admin') {
      const dept = await this.departmentService.resolveHospitalAdminDepartmentName(requester);
      if (!dept) return [];
      return this.nurseModel.find({ department: dept }).select('-password').sort({ createdAt: -1 }).exec();
    }
    return this.nurseModel.find().select('-password').sort({ createdAt: -1 }).exec();
  }

  async findById(id: string, requester?: Requester) {
    const nurse = await this.nurseModel.findById(id).select('-password').exec();
    if (!nurse) throw new NotFoundException('Infirmière non trouvée');
    await this.assertHospitalAdminManagesNurse(requester, id);
    return nurse;
  }

  async update(id: string, data: Partial<Nurse>, requester?: Requester) {
    await this.assertHospitalAdminManagesNurse(requester, id);
    const nurse = await this.nurseModel.findById(id).exec();
    if (!nurse) throw new NotFoundException('Infirmière non trouvée');
    if (requester?.role === 'admin') {
      const dept = await this.departmentService.resolveHospitalAdminDepartmentName(requester);
      if (dept) data = { ...data, department: dept };
    }
    if (data.email && data.email !== nurse.email) {
      const exists = await this.nurseModel.findOne({ email: data.email }).exec();
      if (exists) throw new ConflictException('Une infirmière avec cet email existe déjà');
    }
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    } else {
      delete updateData.password;
    }
    delete updateData._id;
    const updated = await this.nurseModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select('-password').exec();
    return updated;
  }

  async delete(id: string, requester?: Requester) {
    await this.assertHospitalAdminManagesNurse(requester, id);
    const nurse = await this.nurseModel.findByIdAndDelete(id).exec();
    if (!nurse) throw new NotFoundException('Infirmière non trouvée');
    return { message: 'Infirmière supprimée' };
  }

  async toggleActive(id: string, requester?: Requester) {
    await this.assertHospitalAdminManagesNurse(requester, id);
    const nurse = await this.nurseModel.findById(id).exec();
    if (!nurse) throw new NotFoundException('Infirmière non trouvée');
    const newStatus = nurse.isActive === false ? true : false;
    await this.nurseModel.updateOne({ _id: id }, { $set: { isActive: newStatus } }).exec();
    return { id, isActive: newStatus, message: newStatus ? 'Compte activé' : 'Compte désactivé' };
  }
}
