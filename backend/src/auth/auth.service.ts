import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { LoginAttempt } from './schemas/login-attempt.schema';
import { Doctor } from '../doctor/schemas/doctor.schema';
import { Patient } from '../patient/schemas/patient.schema';
import { Nurse } from '../nurse/schemas/nurse.schema';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(LoginAttempt.name) private loginAttemptModel: Model<LoginAttempt>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Accès administrateur requis');
    }

    const token = this.emailService.generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.loginAttemptModel.create({
      userId: user._id.toString(),
      token,
      email: user.email,
      used: false,
      expiresAt,
    });

    await this.emailService.sendLoginConfirmation(user.email, token, user.name);

    return {
      pending: true,
      message: 'Un lien de confirmation a été envoyé à votre adresse email. Cliquez dessus pour accéder à votre session.',
      email: user.email,
    };
  }

  async confirmLogin(token: string) {
    const attempt = await this.loginAttemptModel.findOne({ token, used: false }).exec();
    if (!attempt) {
      throw new UnauthorizedException('Lien invalide ou déjà utilisé');
    }
    if (new Date() > attempt.expiresAt) {
      throw new UnauthorizedException('Ce lien a expiré. Veuillez vous reconnecter.');
    }

    const user = await this.userModel.findById(attempt.userId).exec();
    if (!user || user.role !== 'admin') {
      throw new UnauthorizedException('Accès non autorisé');
    }

    await this.loginAttemptModel.updateOne({ _id: attempt._id }, { $set: { used: true } }).exec();

    const payload = { sub: user._id, email: user.email, role: user.role };
    const u = user.toObject();
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: u._id,
        email: u.email,
        name: u.name,
        role: u.role,
        profileImage: u.profileImage,
        alternateEmail: u.alternateEmail,
        languages: u.languages || [],
        socialMedia: u.socialMedia || {},
      },
    };
  }

  async loginDoctor(email: string, password: string) {
    const doctor = await this.doctorModel.findOne({ email }).exec();
    if (!doctor) throw new UnauthorizedException('Invalid email or password');
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) throw new UnauthorizedException('Invalid email or password');
    const d = doctor.toObject();
    const payload = { sub: d._id, email: d.email, role: 'doctor' };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: d._id,
        email: d.email,
        firstName: d.firstName,
        lastName: d.lastName,
        role: 'doctor',
        specialty: d.specialty,
        profileImage: d.profileImage,
      },
    };
  }

  async loginPatient(email: string, password: string) {
    const patient = await this.patientModel.findOne({ email }).exec();
    if (!patient) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const p = patient.toObject();
    const payload = { sub: p._id, email: p.email, role: 'patient' };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: p._id,
        email: p.email,
        firstName: p.firstName,
        lastName: p.lastName,
        role: 'patient',
        service: p.service,
        profileImage: p.profileImage,
      },
    };
  }

  async loginNurse(email: string, password: string) {
    const nurse = await this.nurseModel.findOne({ email }).exec();
    if (!nurse) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const isMatch = await bcrypt.compare(password, nurse.password);
    if (!isMatch) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const n = nurse.toObject();
    const payload = { sub: n._id, email: n.email, role: 'nurse' };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: n._id,
        email: n.email,
        firstName: n.firstName,
        lastName: n.lastName,
        role: 'nurse',
        specialty: n.specialty,
        department: n.department,
        profileImage: n.profileImage,
      },
    };
  }

  async validateUser(payload: any) {
    if (payload.role === 'doctor') {
      const doctor = await this.doctorModel.findById(payload.sub).select('-password').exec();
      if (!doctor) throw new UnauthorizedException();
      const d = doctor.toObject();
      return {
        id: d._id,
        email: d.email,
        firstName: d.firstName,
        lastName: d.lastName,
        name: `${d.firstName} ${d.lastName}`,
        role: 'doctor',
        specialty: d.specialty,
        profileImage: d.profileImage,
      };
    }
    if (payload.role === 'patient') {
      const patient = await this.patientModel.findById(payload.sub).select('-password').exec();
      if (!patient) throw new UnauthorizedException();
      const p = patient.toObject();
      return {
        id: p._id,
        email: p.email,
        firstName: p.firstName,
        lastName: p.lastName,
        name: `${p.firstName} ${p.lastName}`,
        role: 'patient',
        service: p.service,
        profileImage: p.profileImage,
      };
    }
    if (payload.role === 'nurse') {
      const nurse = await this.nurseModel.findById(payload.sub).select('-password').exec();
      if (!nurse) throw new UnauthorizedException();
      const n = nurse.toObject();
      return {
        id: n._id,
        email: n.email,
        firstName: n.firstName,
        lastName: n.lastName,
        name: `${n.firstName} ${n.lastName}`,
        role: 'nurse',
        specialty: n.specialty,
        department: n.department,
        profileImage: n.profileImage,
      };
    }
    const user = await this.userModel.findById(payload.sub).exec();
    if (!user) throw new UnauthorizedException();
    const u = user.toObject();
    return {
      id: u._id,
      email: u.email,
      name: u.name,
      role: u.role,
      profileImage: u.profileImage,
      alternateEmail: u.alternateEmail,
      languages: u.languages || [],
      socialMedia: u.socialMedia || {},
    };
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      profileImage?: string;
      alternateEmail?: string;
      languages?: string[];
      socialMedia?: { facebook?: string; twitter?: string; google?: string; instagram?: string; youtube?: string };
    },
  ) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');
    if (user.role !== 'admin') throw new UnauthorizedException('Accès non autorisé');
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) {
      const exists = await this.userModel.findOne({ email: data.email, _id: { $ne: userId } }).exec();
      if (exists) throw new UnauthorizedException('Cet email est déjà utilisé');
      updateData.email = data.email;
    }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    if (data.profileImage !== undefined) updateData.profileImage = data.profileImage;
    if (data.alternateEmail !== undefined) updateData.alternateEmail = data.alternateEmail;
    if (data.languages !== undefined) updateData.languages = data.languages;
    if (data.socialMedia !== undefined) updateData.socialMedia = data.socialMedia;
    const updated = await this.userModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).exec();
    if (!updated) throw new UnauthorizedException('Utilisateur non trouvé');
    const u = updated.toObject();
    return {
      id: u._id,
      email: u.email,
      name: u.name,
      role: u.role,
      profileImage: u.profileImage,
      alternateEmail: u.alternateEmail,
      languages: u.languages || [],
      socialMedia: u.socialMedia || {},
    };
  }

  async createAdmin(email: string, password: string, name?: string) {
    const hashed = await bcrypt.hash(password, 10);
    const data = {
      email,
      password: hashed,
      role: 'admin',
      name: name || 'Admin',
    };
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      await this.userModel.updateOne({ email }, { $set: { password: hashed, role: 'admin', name: data.name } }).exec();
      return { id: existing._id, email: existing.email, name: data.name, role: 'admin' };
    }
    const user = await this.userModel.create(data);
    return { id: user._id, email: user.email, name: user.name, role: user.role };
  }
}
