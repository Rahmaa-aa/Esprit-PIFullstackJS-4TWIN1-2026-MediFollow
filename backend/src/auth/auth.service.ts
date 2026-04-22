import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as SimpleWebAuthnServer from '@simplewebauthn/server';
import { User } from './schemas/user.schema';
import { LoginAttempt } from './schemas/login-attempt.schema';
import { Doctor } from '../doctor/schemas/doctor.schema';
import { Patient } from '../patient/schemas/patient.schema';
import { Nurse } from '../nurse/schemas/nurse.schema';
import { EmailService } from './email.service';
import { PasskeyCredential } from './schemas/passkey-credential.schema';
import { PasskeyChallenge } from './schemas/passkey-challenge.schema';
import { FaceLoginProfile } from './schemas/face-login-profile.schema';
import { DepartmentCatalog } from '../department/schemas/department-catalog.schema';

const {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} = SimpleWebAuthnServer as any;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(LoginAttempt.name) private loginAttemptModel: Model<LoginAttempt>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
    @InjectModel(PasskeyCredential.name) private passkeyCredentialModel: Model<PasskeyCredential>,
    @InjectModel(PasskeyChallenge.name) private passkeyChallengeModel: Model<PasskeyChallenge>,
    @InjectModel(FaceLoginProfile.name) private faceLoginProfileModel: Model<FaceLoginProfile>,
    @InjectModel(DepartmentCatalog.name) private departmentCatalogModel: Model<DepartmentCatalog>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  private async releaseAdminCatalogAssignments(adminId: Types.ObjectId | string) {
    const oid = new Types.ObjectId(String(adminId));
    await this.departmentCatalogModel
      .updateMany({ assignedAdminId: oid }, { $unset: { assignedAdminId: 1, assignedSuperAdminId: 1 } })
      .exec();
  }

  /** Après création / mise à jour d’un admin avec département : une entrée catalogue par nom (créée si absente). */
  private async syncAdminCatalogEntry(adminId: Types.ObjectId | string, deptName: string) {
    const name = deptName.trim();
    if (!name) return;
    const oid = new Types.ObjectId(String(adminId));
    await this.releaseAdminCatalogAssignments(adminId);
    await this.departmentCatalogModel
      .updateOne(
        { name },
        {
          $set: { assignedAdminId: oid },
          $unset: { assignedSuperAdminId: 1 },
          $setOnInsert: { name },
        },
        { upsert: true },
      )
      .exec();
  }

  private getWebAuthnConfig() {
    const expectedOrigin = process.env.PASSKEY_ORIGIN || process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
    const configuredRpId = process.env.PASSKEY_RP_ID;
    const rpID = configuredRpId || new URL(expectedOrigin).hostname;
    return {
      rpName: process.env.PASSKEY_RP_NAME || 'MediFollow',
      rpID,
      expectedOrigin,
    };
  }

  private async findRoleUserByEmail(email: string) {
    const doctor = await this.doctorModel.findOne({ email }).exec();
    if (doctor) return { role: 'doctor' as const, user: doctor };

    const patient = await this.patientModel.findOne({ email }).exec();
    if (patient) return { role: 'patient' as const, user: patient };

    const nurse = await this.nurseModel.findOne({ email }).exec();
    if (nurse) return { role: 'nurse' as const, user: nurse };

    return null;
  }

  private async findRoleUserByCredentials(email: string, password: string) {
    const candidate = await this.findRoleUserByEmail(email);
    if (!candidate) return null;
    const ok = await bcrypt.compare(password, candidate.user.password);
    return ok ? candidate : null;
  }

  private validateFaceDescriptor(descriptor: number[]) {
    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      throw new BadRequestException('Descriptor visage invalide');
    }
    const valid = descriptor.every((v) => Number.isFinite(v));
    if (!valid) {
      throw new BadRequestException('Descriptor visage invalide');
    }
  }

  private descriptorDistance(a: number[], b: number[]) {
    let sum = 0;
    for (let i = 0; i < a.length; i += 1) {
      const d = a[i] - b[i];
      sum += d * d;
    }
    return Math.sqrt(sum);
  }

  private async findRoleUserById(role: 'doctor' | 'patient' | 'nurse', userId: string) {
    if (role === 'doctor') {
      return this.doctorModel.findById(userId).exec();
    }
    if (role === 'patient') {
      return this.patientModel.findById(userId).exec();
    }
    return this.nurseModel.findById(userId).exec();
  }

  private async savePasskeyChallenge(params: {
    email: string;
    type: 'registration' | 'authentication';
    challenge: string;
    role: 'doctor' | 'patient' | 'nurse';
    userId: string;
  }) {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.passkeyChallengeModel.create({
      ...params,
      expiresAt,
    });
    return expiresAt;
  }

  private async getValidChallenge(email: string, type: 'registration' | 'authentication') {
    const challengeDoc = await this.passkeyChallengeModel
      .findOne({ email, type })
      .sort({ createdAt: -1 })
      .exec();
    if (!challengeDoc) throw new UnauthorizedException('Challenge Face ID introuvable');
    if (challengeDoc.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Challenge Face ID expiré');
    }
    return challengeDoc;
  }

  private async consumeChallenges(email: string, type: 'registration' | 'authentication') {
    await this.passkeyChallengeModel.deleteMany({ email, type }).exec();
  }

  private formatRoleLogin(role: 'doctor' | 'patient' | 'nurse', raw: any) {
    if (role === 'doctor') {
      return {
        access_token: this.jwtService.sign({ sub: raw._id, email: raw.email, role: 'doctor' }),
        user: {
          id: raw._id,
          email: raw.email,
          firstName: raw.firstName,
          lastName: raw.lastName,
          role: 'doctor',
          specialty: raw.specialty,
          profileImage: raw.profileImage,
          academicTitle: raw.academicTitle === 'prof' ? 'prof' : 'dr',
        },
      };
    }
    if (role === 'patient') {
      return {
        access_token: this.jwtService.sign({ sub: raw._id, email: raw.email, role: 'patient' }),
        user: {
          id: raw._id,
          email: raw.email,
          firstName: raw.firstName,
          lastName: raw.lastName,
          role: 'patient',
          service: raw.service,
          profileImage: raw.profileImage,
        },
      };
    }
    return {
      access_token: this.jwtService.sign({ sub: raw._id, email: raw.email, role: 'nurse' }),
      user: {
        id: raw._id,
        email: raw.email,
        firstName: raw.firstName,
        lastName: raw.lastName,
        role: 'nurse',
        specialty: raw.specialty,
        department: raw.department,
        profileImage: raw.profileImage,
      },
    };
  }

  async getPasskeyRegistrationOptions(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email et mot de passe requis');
    }
    const matched = await this.findRoleUserByCredentials(email, password);
    if (!matched) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const { rpID, rpName } = this.getWebAuthnConfig();
    const roleUserId = matched.user._id.toString();
    const existingCreds = await this.passkeyCredentialModel
      .find({ userId: roleUserId, role: matched.role })
      .exec();
    const excludeCredentials = existingCreds.map((item) => ({
      id: item.credentialId,
    }));

    const options = await generateRegistrationOptions({
      rpID,
      rpName,
      userName: matched.user.email,
      userDisplayName: `${matched.user.firstName || ''} ${matched.user.lastName || ''}`.trim() || matched.user.email,
      userID: new TextEncoder().encode(roleUserId),
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    await this.savePasskeyChallenge({
      email: matched.user.email,
      type: 'registration',
      challenge: options.challenge,
      role: matched.role,
      userId: roleUserId,
    });

    return options;
  }

  async verifyPasskeyRegistration(email: string, response: any, deviceLabel?: string) {
    const challengeDoc = await this.getValidChallenge(email, 'registration');
    const { rpID, expectedOrigin } = this.getWebAuthnConfig();

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challengeDoc.challenge,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new UnauthorizedException('Inscription Face ID invalide');
    }

    const { credential } = verification.registrationInfo;
    await this.passkeyCredentialModel.findOneAndUpdate(
      { credentialId: credential.id },
      {
        $set: {
          userId: challengeDoc.userId,
          role: challengeDoc.role,
          credentialId: credential.id,
          publicKey: Buffer.from(credential.publicKey).toString('base64url'),
          counter: credential.counter,
          transports: credential.transports || [],
          deviceLabel: deviceLabel || 'Face ID',
        },
      },
      { upsert: true, new: true },
    );

    await this.consumeChallenges(email, 'registration');
    return { success: true };
  }

  async getPasskeyAuthenticationOptions(email: string) {
    if (!email) throw new BadRequestException('Email requis');
    const matched = await this.findRoleUserByEmail(email);
    if (!matched) throw new UnauthorizedException('Compte introuvable');

    const roleUserId = matched.user._id.toString();
    const credentials = await this.passkeyCredentialModel
      .find({ userId: roleUserId, role: matched.role })
      .exec();
    if (!credentials.length) {
      throw new UnauthorizedException('Aucun Face ID enregistré pour ce compte');
    }

    const { rpID } = this.getWebAuthnConfig();
    const options = await generateAuthenticationOptions({
      rpID,
      timeout: 60000,
      userVerification: 'preferred',
      allowCredentials: credentials.map((item) => ({
        id: item.credentialId,
        transports: (item.transports || []) as any,
      })),
    });

    await this.savePasskeyChallenge({
      email: matched.user.email,
      type: 'authentication',
      challenge: options.challenge,
      role: matched.role,
      userId: roleUserId,
    });

    return options;
  }

  async verifyPasskeyAuthentication(email: string, response: any) {
    const challengeDoc = await this.getValidChallenge(email, 'authentication');
    const credential = await this.passkeyCredentialModel
      .findOne({ credentialId: response.id, userId: challengeDoc.userId, role: challengeDoc.role })
      .exec();
    if (!credential) throw new UnauthorizedException('Credential Face ID introuvable');

    const { rpID, expectedOrigin } = this.getWebAuthnConfig();
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challengeDoc.challenge,
      expectedOrigin,
      expectedRPID: rpID,
      credential: {
        id: credential.credentialId,
        publicKey: Buffer.from(credential.publicKey, 'base64url'),
        counter: credential.counter,
        transports: (credential.transports || []) as any,
      },
      requireUserVerification: false,
    });

    if (!verification.verified) {
      throw new UnauthorizedException('Authentification Face ID invalide');
    }

    await this.passkeyCredentialModel.updateOne(
      { _id: credential._id },
      { $set: { counter: verification.authenticationInfo.newCounter } },
    );
    await this.consumeChallenges(email, 'authentication');

    let entity: any = null;
    if (challengeDoc.role === 'doctor') {
      entity = await this.doctorModel.findById(challengeDoc.userId).exec();
    } else if (challengeDoc.role === 'patient') {
      entity = await this.patientModel.findById(challengeDoc.userId).exec();
    } else {
      entity = await this.nurseModel.findById(challengeDoc.userId).exec();
    }
    if (!entity) throw new UnauthorizedException('Compte introuvable');

    return this.formatRoleLogin(challengeDoc.role as 'doctor' | 'patient' | 'nurse', entity.toObject());
  }

  async getFaceEnrollmentStatus(userId: string, role: 'doctor' | 'patient' | 'nurse') {
    const profile = await this.faceLoginProfileModel.findOne({ userId, role, enabled: true }).exec();
    return { enrolled: !!profile };
  }

  async enrollFaceForCurrentUser(
    userId: string,
    role: 'doctor' | 'patient' | 'nurse',
    descriptor: number[],
  ) {
    this.validateFaceDescriptor(descriptor);
    const roleUser = await this.findRoleUserById(role, userId);
    if (!roleUser) throw new UnauthorizedException('Compte introuvable');

    // Prevent the same face from being enrolled on a different account.
    const duplicateThreshold = Number(process.env.FACE_ENROLL_DUPLICATE_THRESHOLD || 0.36);
    const otherProfiles = await this.faceLoginProfileModel
      .find({
        enabled: true,
        $or: [{ userId: { $ne: userId } }, { role: { $ne: role } }],
      })
      .select('descriptor userId role')
      .exec();
    for (const profile of otherProfiles) {
      const distance = this.descriptorDistance(profile.descriptor, descriptor);
      if (distance <= duplicateThreshold) {
        throw new BadRequestException('Ce visage est deja enregistre sur un autre compte');
      }
    }

    await this.faceLoginProfileModel.findOneAndUpdate(
      { userId, role },
      {
        $set: {
          email: roleUser.email,
          descriptor,
          enabled: true,
        },
      },
      { upsert: true, new: true },
    );
    return { success: true };
  }

  async disableFaceForCurrentUser(userId: string, role: 'doctor' | 'patient' | 'nurse') {
    await this.faceLoginProfileModel.updateOne(
      { userId, role },
      { $set: { enabled: false } },
    );
    return { success: true };
  }

  async loginWithFace(email: string | undefined, descriptor: number[]) {
    this.validateFaceDescriptor(descriptor);
    const threshold = Number(process.env.FACE_LOGIN_THRESHOLD || 0.5);

    const normalizedEmail = (email || '').trim().toLowerCase();
    if (normalizedEmail) {
      const matched = await this.findRoleUserByEmail(normalizedEmail);
      if (!matched) throw new UnauthorizedException('Compte introuvable');

      const profile = await this.faceLoginProfileModel
        .findOne({
          userId: matched.user._id.toString(),
          role: matched.role,
          enabled: true,
        })
        .exec();
      if (!profile) {
        return {
          requiresEnrollment: true,
          message: 'Aucun visage enregistre pour ce compte',
        };
      }

      const distance = this.descriptorDistance(profile.descriptor, descriptor);
      if (distance > threshold) {
        throw new UnauthorizedException('Visage non reconnu');
      }

      return this.formatRoleLogin(matched.role, matched.user.toObject());
    }

    const profiles = await this.faceLoginProfileModel.find({ enabled: true }).exec();
    if (!profiles.length) {
      return {
        requiresEnrollment: true,
        message: 'Aucun visage enregistre',
      };
    }

    let bestProfile: FaceLoginProfile | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const profile of profiles) {
      const distance = this.descriptorDistance(profile.descriptor, descriptor);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestProfile = profile;
      }
    }

    if (!bestProfile || bestDistance > threshold) {
      throw new UnauthorizedException('Visage non reconnu');
    }

    const role = bestProfile.role as 'doctor' | 'patient' | 'nurse';
    const roleUser = await this.findRoleUserById(role, bestProfile.userId);
    if (!roleUser) {
      throw new UnauthorizedException('Compte introuvable');
    }

    return this.formatRoleLogin(role, roleUser.toObject());
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    if (user.role !== 'admin' && user.role !== 'superadmin') {
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
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
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
    const result = {
      access_token: this.jwtService.sign(payload),
      user: {
        id: d._id,
        email: d.email,
        firstName: d.firstName,
        lastName: d.lastName,
        role: 'doctor',
        specialty: d.specialty,
        profileImage: d.profileImage,
        academicTitle: d.academicTitle === 'prof' ? 'prof' : 'dr',
      },
    };
    return result;
  }

  async loginPatient(email: string, password: string) {
    const patient = await this.patientModel.findOne({ email }).exec();
    if (!patient) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const p = patient.toObject();
    const payload = { sub: p._id, email: p.email, role: 'patient' };
    const result = {
      access_token: this.jwtService.sign(payload),
      user: {
        id: p._id,
        _id: p._id,     // include both for compatibility
        email: p.email,
        firstName: p.firstName,
        lastName: p.lastName,
        role: 'patient',
        service: p.service,
        profileImage: p.profileImage,
        phone: p.phone,
        dateOfBirth: p.dateOfBirth,
        gender: p.gender,
        bloodType: p.bloodType,
        city: p.city,
        country: p.country,
        weight: (p as any).weight,
        height: (p as any).height,
      },
    };
    return result;
  }


  async loginNurse(email: string, password: string) {
    const nurse = await this.nurseModel.findOne({ email }).exec();
    if (!nurse) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const isMatch = await bcrypt.compare(password, nurse.password);
    if (!isMatch) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const n = nurse.toObject();
    const payload = { sub: n._id, email: n.email, role: 'nurse' };
    const result = {
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
    return result;
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
        academicTitle: d.academicTitle === 'prof' ? 'prof' : 'dr',
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
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      department: u.department,
      specialty: u.specialty,
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
    if (!user) throw new UnauthorizedException('User not found');
    if (user.role !== 'admin' && user.role !== 'superadmin') throw new UnauthorizedException('Access denied');
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

  async createAdmin(
    email: string,
    password: string,
    name?: string,
    department?: string,
    firstName?: string,
    lastName?: string,
    phone?: string,
  ) {
    const dept = department?.trim() || undefined;
    const displayName =
      (name?.trim() || `${firstName?.trim() || ''} ${lastName?.trim() || ''}`.trim()) || 'Admin';

    const existing = await this.userModel.findOne({ email }).exec();

    if (dept) {
      const cat = await this.departmentCatalogModel.findOne({ name: dept }).exec();
      if (
        cat?.assignedAdminId &&
        (!existing || String(cat.assignedAdminId) !== String(existing._id))
      ) {
        throw new ConflictException(
          'Un administrateur est déjà assigné à ce département dans le catalogue. Retirez l’assignation ou choisissez un autre département.',
        );
      }
    }
    if (existing?.role === 'superadmin') {
      throw new BadRequestException('Cet email est déjà utilisé par un super administrateur');
    }
    const hashed = await bcrypt.hash(password, 10);
    const data: Record<string, unknown> = {
      email,
      password: hashed,
      role: 'admin',
      name: displayName,
      isActive: true,
      department: dept || '',
      firstName: firstName?.trim() || undefined,
      lastName: lastName?.trim() || undefined,
      phone: phone?.trim() || undefined,
    };
    let userId: Types.ObjectId;
    if (existing) {
      await this.userModel.updateOne({ email }, { $set: data }).exec();
      const u = await this.userModel.findOne({ email }).exec();
      if (!u) throw new BadRequestException('Échec mise à jour administrateur');
      userId = u._id as Types.ObjectId;
    } else {
      const user = await this.userModel.create(data);
      userId = user._id as Types.ObjectId;
    }
    if (dept) {
      await this.syncAdminCatalogEntry(userId, dept);
    }
    const final = await this.userModel.findById(userId).exec();
    return {
      id: final!._id,
      email: final!.email,
      name: final!.name,
      role: 'admin',
      department: final!.department || '',
    };
  }

  /** Crée un admin et envoie les identifiants par e-mail (SMTP configuré dans .env). */
  async createAdminWithCredentialsEmail(
    email: string,
    password: string,
    name?: string,
    department?: string,
    firstName?: string,
    lastName?: string,
    phone?: string,
  ) {
    const result = await this.createAdmin(email, password, name, department, firstName, lastName, phone);
    let credentialsEmailSent = false;
    try {
      credentialsEmailSent = await this.emailService.sendAdminCredentials(
        result.email,
        password,
        name?.trim() || result.name || 'Administrateur',
      );
    } catch (e) {
      console.error('[Auth] Échec envoi e-mail identifiants admin:', (e as Error)?.message || e);
    }
    return { ...result, credentialsEmailSent };
  }

  async createSuperAdmin(email: string, password: string, name?: string) {
    const hashed = await bcrypt.hash(password, 10);
    const data = { email, password: hashed, role: 'superadmin', name: name || 'Super Admin', isActive: true };
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      await this.userModel.updateOne({ email }, { $set: { password: hashed, role: 'superadmin', name: data.name, isActive: true } }).exec();
      return { id: existing._id, email, name: data.name, role: 'superadmin' };
    }
    const user = await this.userModel.create(data);
    return { id: user._id, email: user.email, name: user.name, role: user.role };
  }

  async getAllUsers() {
    const users = await this.userModel.find({}, { password: 0 }).sort({ createdAt: -1 }).exec();
    return users.map(u => ({
      id: u._id, email: u.email, name: u.name, firstName: u.firstName,
      lastName: u.lastName, role: u.role, phone: u.phone, department: u.department,
      specialty: u.specialty, isActive: u.isActive !== false, profileImage: u.profileImage,
      createdAt: (u as any).createdAt,
    }));
  }

  async getUsersByRole(role: string) {
    const users = await this.userModel.find({ role }, { password: 0 }).sort({ createdAt: -1 }).exec();
    return users.map(u => ({
      id: u._id, email: u.email, name: u.name, firstName: u.firstName,
      lastName: u.lastName, role: u.role, phone: u.phone, department: u.department,
      specialty: u.specialty, isActive: u.isActive !== false, profileImage: u.profileImage,
      address: u.address, city: u.city, country: u.country, createdAt: (u as any).createdAt,
    }));
  }

  async getUserById(id: string) {
    const u = await this.userModel.findById(id, { password: 0 }).exec();
    if (!u) throw new UnauthorizedException('Utilisateur non trouvé');
    return {
      id: u._id, email: u.email, name: u.name, firstName: u.firstName,
      lastName: u.lastName, role: u.role, phone: u.phone, department: u.department,
      specialty: u.specialty, isActive: u.isActive !== false, profileImage: u.profileImage,
      address: u.address, city: u.city, country: u.country, alternateEmail: u.alternateEmail,
      languages: u.languages || [], socialMedia: u.socialMedia || {}, createdAt: (u as any).createdAt,
    };
  }

  async toggleUserActive(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');
    const newStatus = user.isActive === false ? true : false;
    await this.userModel.updateOne({ _id: id }, { $set: { isActive: newStatus } }).exec();
    return { id, isActive: newStatus, message: newStatus ? 'Compte activé' : 'Compte désactivé' };
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');
    if (user.role === 'admin') {
      await this.releaseAdminCatalogAssignments(user._id);
    }
    await this.userModel.deleteOne({ _id: id }).exec();
    return { message: 'Utilisateur supprimé avec succès' };
  }

  async loginStaff(email: string, password: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid email or password');
    if (user.role !== 'auditor' && user.role !== 'carecoordinator') {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.isActive === false) throw new UnauthorizedException('Account is deactivated. Contact the administrator.');
    const payload = { sub: user._id, email: user.email, role: user.role };
    const u = user.toObject();
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: u._id,
        email: u.email,
        name: u.name,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        department: u.department,
        specialty: u.specialty,
        profileImage: u.profileImage,
        isActive: u.isActive !== false,
      },
    };
  }

  async createUserWithRole(data: any, role: string) {
    if (!data.email || !data.password) throw new BadRequestException('Email et mot de passe requis');
    const existing = await this.userModel.findOne({ email: data.email }).exec();
    if (existing) throw new BadRequestException('Cet email est déjà utilisé');
    const hashed = await bcrypt.hash(data.password, 10);
    const fullName = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || role;
    const user = await this.userModel.create({
      email: data.email, password: hashed, role, name: fullName,
      firstName: data.firstName, lastName: data.lastName, phone: data.phone,
      department: data.department, specialty: data.specialty,
      address: data.address, city: data.city, country: data.country,
      profileImage: data.profileImage, isActive: true,
    });
    return { id: user._id, email: user.email, name: user.name, role: user.role };
  }

  async createUserWithRoleAndCredentialsEmail(data: any, role: string) {
    const plainPassword = data.password as string;
    const result = await this.createUserWithRole(data, role);
    const displayName =
      data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || role;
    const roleTitle =
      role === 'auditor'
        ? 'Auditeur'
        : role === 'carecoordinator'
          ? 'Coordinateur de soins'
          : role;
    let credentialsEmailSent = false;
    try {
      credentialsEmailSent = await this.emailService.sendPlatformStaffCredentials(
        result.email,
        plainPassword,
        displayName,
        roleTitle,
      );
    } catch (e) {
      console.error('[Auth] Échec envoi e-mail compte plateforme:', (e as Error)?.message || e);
    }
    return { ...result, credentialsEmailSent };
  }

  async updateUser(id: string, data: any) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new UnauthorizedException('User not found');
    const updateData: any = {};

    // Only update fields that are explicitly provided and non-empty
    const stringFields = ['phone', 'department', 'specialty', 'address', 'city', 'country', 'profileImage', 'alternateEmail'];
    stringFields.forEach(f => {
      if (data[f] !== undefined && data[f] !== null) updateData[f] = data[f];
    });

    // firstName and lastName: update and also rebuild 'name'
    const newFirstName = data.firstName !== undefined ? data.firstName : user.firstName;
    const newLastName = data.lastName !== undefined ? data.lastName : user.lastName;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.firstName !== undefined || data.lastName !== undefined) {
      updateData.name = `${newFirstName || ''} ${newLastName || ''}`.trim() || user.name;
    }

    // Allow explicit 'name' override
    if (data.name !== undefined && data.name.trim()) updateData.name = data.name.trim();

    // Email: check for uniqueness only if changed
    if (data.email && data.email !== user.email) {
      const exists = await this.userModel.findOne({ email: data.email, _id: { $ne: id } }).exec();
      if (exists) throw new BadRequestException('This email is already in use');
      updateData.email = data.email;
    }

    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    const updated = await this.userModel.findByIdAndUpdate(
      id, { $set: updateData }, { new: true }
    ).select('-password').exec();

    if (!updated) throw new UnauthorizedException('User not found');

    if (updated.role === 'admin' && data.department !== undefined) {
      const dept = String(data.department ?? '').trim();
      if (dept) {
        const cat = await this.departmentCatalogModel.findOne({ name: dept }).exec();
        if (
          cat?.assignedAdminId &&
          String(cat.assignedAdminId) !== String(updated._id)
        ) {
          throw new ConflictException(
            'Un administrateur est déjà assigné à ce département dans le catalogue. Retirez l’assignation ou choisissez un autre département.',
          );
        }
        await this.syncAdminCatalogEntry(updated._id, dept);
      } else {
        await this.releaseAdminCatalogAssignments(updated._id);
      }
    }

    return {
      id: updated._id,
      email: updated.email,
      name: updated.name,
      firstName: updated.firstName,
      lastName: updated.lastName,
      role: updated.role,
      phone: updated.phone,
      department: updated.department,
      specialty: updated.specialty,
      address: updated.address,
      city: updated.city,
      country: updated.country,
    };
  }
}
