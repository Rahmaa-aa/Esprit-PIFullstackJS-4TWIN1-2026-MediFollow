import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Nurse } from './schemas/nurse.schema';
import { EmailService } from '../auth/email.service';

@Injectable()
export class NurseService {
  constructor(
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
    private emailService: EmailService,
  ) {}

  async create(data: Partial<Nurse>) {
    const exists = await this.nurseModel.findOne({ email: data.email }).exec();
    if (exists) throw new ConflictException('Une infirmière avec cet email existe déjà');
    if (!data.password) throw new BadRequestException('Le mot de passe est requis');
    const plainPassword = data.password;
    const hashed = await bcrypt.hash(plainPassword, 10);
    const nurse = await this.nurseModel.create({
      ...data,
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

  async findAll() {
    const nurses = await this.nurseModel.find().select('-password').sort({ createdAt: -1 }).exec();
    return nurses;
  }

  async findById(id: string) {
    const nurse = await this.nurseModel.findById(id).select('-password').exec();
    if (!nurse) throw new NotFoundException('Infirmière non trouvée');
    return nurse;
  }

  async update(id: string, data: Partial<Nurse>) {
    const nurse = await this.nurseModel.findById(id).exec();
    if (!nurse) throw new NotFoundException('Infirmière non trouvée');
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

  async delete(id: string) {
    const nurse = await this.nurseModel.findByIdAndDelete(id).exec();
    if (!nurse) throw new NotFoundException('Infirmière non trouvée');
    return { message: 'Infirmière supprimée' };
  }

  async toggleActive(id: string) {
    const nurse = await this.nurseModel.findById(id).exec();
    if (!nurse) throw new NotFoundException('Infirmière non trouvée');
    const newStatus = nurse.isActive === false ? true : false;
    await this.nurseModel.updateOne({ _id: id }, { $set: { isActive: newStatus } }).exec();
    return { id, isActive: newStatus, message: newStatus ? 'Compte activé' : 'Compte désactivé' };
  }
}
