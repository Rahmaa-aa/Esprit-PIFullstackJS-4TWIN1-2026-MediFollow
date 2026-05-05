import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Doctor } from './schemas/doctor.schema';
import { Patient } from '../patient/schemas/patient.schema';
import { Appointment } from '../appointment/schemas/appointment.schema';
import { EmailService } from '../auth/email.service';
import { normalizeDoctorId } from '../doctor-availability/doctor-availability.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { resolveProfileImageDataUrlIfNeeded } from '../cloudinary/profile-image-data-url.util';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    private emailService: EmailService,
    private cloudinaryService: CloudinaryService,
  ) {}

  private localTodayYmd(): string {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }

  /** Toujours persister `dr` ou `prof` pour l’affichage (Dr. / Pr.). */
  private normalizeAcademicTitle(v: unknown): 'dr' | 'prof' {
    return v === 'prof' ? 'prof' : 'dr';
  }

  private mapDoctorLean<T extends { academicTitle?: string }>(doc: T): T & { academicTitle: 'dr' | 'prof' } {
    return { ...doc, academicTitle: this.normalizeAcademicTitle(doc.academicTitle) };
  }

  async create(data: Partial<Doctor>) {
    const exists = await this.doctorModel.findOne({ email: data.email }).exec();
    if (exists) throw new ConflictException('Un médecin avec cet email existe déjà');
    if (!data.password) throw new BadRequestException('Le mot de passe est requis');
    const plainPassword = data.password;
    const hashed = await bcrypt.hash(plainPassword, 10);

    const newId = new Types.ObjectId();

    const createPayload: Partial<Doctor> & { _id: Types.ObjectId; password: string } = {
      ...data,
      _id: newId,
      password: hashed,
      academicTitle: this.normalizeAcademicTitle(data.academicTitle),
    };
    if (createPayload.profileImage) {
      createPayload.profileImage = await resolveProfileImageDataUrlIfNeeded(this.cloudinaryService, {
        profileImage: createPayload.profileImage as string,
        previousUrl: undefined,
        folder: 'medifollow/avatars/doctor',
        publicIdForUpload: `doctor_${String(newId)}`,
      }) as string;
    }

    const doctor = await this.doctorModel.create(createPayload);
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
    return this.mapDoctorLean(result as { academicTitle?: string });
  }

  async findAll() {
    const doctors = await this.doctorModel.find().select('-password').sort({ createdAt: -1 }).lean().exec();
    return doctors.map((d) => this.mapDoctorLean(d as { academicTitle?: string }));
  }

  async findById(id: string) {
    const doc = await this.doctorModel.findById(id).select('-password').lean().exec();
    if (!doc) throw new NotFoundException('Médecin non trouvé');
    return this.mapDoctorLean(doc as { academicTitle?: string });
  }

  /** Profil public + compteurs (patients référés, RDV confirmés à venir). */
  async findByIdWithStats(id: string) {
    const doctor = await this.findById(id);
    const did = normalizeDoctorId(id);
    const today = this.localTodayYmd();
    const [assignedPatientsCount, upcomingAppointmentsCount] = await Promise.all([
      this.patientModel.countDocuments({ doctorId: did }).exec(),
      this.appointmentModel
        .countDocuments({
          doctorId: did,
          date: { $gte: today },
          status: { $in: ['confirmed', 'scheduled'] },
        })
        .exec(),
    ]);
    return {
      ...doctor,
      stats: { assignedPatientsCount, upcomingAppointmentsCount },
    };
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
    if (data.academicTitle !== undefined && data.academicTitle !== null) {
      updateData.academicTitle = this.normalizeAcademicTitle(data.academicTitle);
    }
    if (Object.prototype.hasOwnProperty.call(updateData, 'profileImage')) {
      updateData.profileImage = await resolveProfileImageDataUrlIfNeeded(this.cloudinaryService, {
        profileImage: updateData.profileImage as string | undefined,
        previousUrl: doctor.profileImage,
        folder: 'medifollow/avatars/doctor',
        publicIdForUpload: `doctor_${String(id)}`,
      });
    }
    const updated = await this.doctorModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select('-password').lean().exec();
    if (!updated) throw new NotFoundException('Médecin non trouvé');
    return this.mapDoctorLean(updated as { academicTitle?: string });
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
