import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Doctor } from './schemas/doctor.schema';
import { EmailService } from '../auth/email.service';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    private emailService: EmailService,
  ) {}

  async create(data: Partial<Doctor>) {
    const exists = await this.doctorModel.findOne({ email: data.email }).exec();
    if (exists) throw new ConflictException('Un médecin avec cet email existe déjà');
    if (!data.password) throw new BadRequestException('Le mot de passe est requis');
    const plainPassword = data.password;
    const hashed = await bcrypt.hash(plainPassword, 10);
    const doctor = await this.doctorModel.create({
      ...data,
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

  async findAll() {
    const doctors = await this.doctorModel.find().select('-password').sort({ createdAt: -1 }).exec();
    return doctors;
  }

  async findById(id: string) {
    const doctor = await this.doctorModel.findById(id).select('-password').exec();
    if (!doctor) throw new NotFoundException('Médecin non trouvé');
    return doctor;
  }

  async update(id: string, data: Partial<Doctor>) {
    const doctor = await this.doctorModel.findById(id).exec();
    if (!doctor) throw new NotFoundException('Médecin non trouvé');
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

  async delete(id: string) {
    const doctor = await this.doctorModel.findByIdAndDelete(id).exec();
    if (!doctor) throw new NotFoundException('Médecin non trouvé');
    return { message: 'Médecin supprimé' };
  }

  async toggleActive(id: string) {
    const doctor = await this.doctorModel.findById(id).exec();
    if (!doctor) throw new NotFoundException('Médecin non trouvé');
    const newStatus = doctor.isActive === false ? true : false;
    await this.doctorModel.updateOne({ _id: id }, { $set: { isActive: newStatus } }).exec();
    return { id, isActive: newStatus, message: newStatus ? 'Compte activé' : 'Compte désactivé' };
  }
}
