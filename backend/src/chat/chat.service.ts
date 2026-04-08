import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatMessageCryptoService } from './chat-message-crypto.service';
import { CareMessage } from './schemas/care-message.schema';
import { StaffGroup } from './schemas/staff-group.schema';
import { ChatReadState } from './schemas/chat-read-state.schema';
import { Patient } from '../patient/schemas/patient.schema';
import { Doctor } from '../doctor/schemas/doctor.schema';
import { Nurse } from '../nurse/schemas/nurse.schema';
import { User } from '../auth/schemas/user.schema';
import { NotificationService } from '../notification/notification.service';
import { GamificationService } from '../gamification/gamification.service';

type JwtUser = {
  id: unknown;
  role: string;
  department?: string;
};

function peerThreadKey(
  a: { role: string; id: string },
  b: { role: string; id: string },
): string {
  const x = `${a.role}:${a.id}`;
  const y = `${b.role}:${b.id}`;
  return [x, y].sort().join('|');
}

/** Fil dédié patient ↔ médecin, infirmier ou coordinateur (distinct du fil « équipe » partagé). */
function patientStaffThreadKey(
  patientId: string,
  staffRole: 'doctor' | 'nurse' | 'carecoordinator',
  staffId: string,
): string {
  return peerThreadKey({ role: 'patient', id: patientId }, { role: staffRole, id: staffId });
}

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(CareMessage.name) private messageModel: Model<CareMessage>,
    @InjectModel(StaffGroup.name) private staffGroupModel: Model<StaffGroup>,
    @InjectModel(ChatReadState.name) private readStateModel: Model<ChatReadState>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly messageCrypto: ChatMessageCryptoService,
    private readonly notificationService: NotificationService,
    private readonly gamificationService: GamificationService,
  ) {}

  private pid(patientId: string): Types.ObjectId {
    const s = String(patientId).trim();
    if (!Types.ObjectId.isValid(s)) {
      throw new BadRequestException('Identifiant patient invalide');
    }
    return new Types.ObjectId(s);
  }

  private uid(user: JwtUser): string {
    return String(user.id ?? '');
  }

  /** Comparaison tolérante (casse / espaces) entre libellés de département. */
  private deptMatches(a: string, b: string): boolean {
    const x = String(a || '')
      .trim()
      .toLowerCase()
      .normalize('NFKC');
    const y = String(b || '')
      .trim()
      .toLowerCase()
      .normalize('NFKC');
    return x.length > 0 && x === y;
  }

  async assertParticipant(user: JwtUser, patientId: string): Promise<void> {
    const id = this.pid(patientId);
    /** department/service requis pour le contrôle coordinateur ↔ patient (même département). */
    const p = await this.patientModel.findById(id).select('doctorId nurseId department service').lean().exec();
    if (!p) throw new NotFoundException('Patient introuvable');
    const uid = this.uid(user);
    const role = user.role;
    if (role === 'patient') {
      if (uid !== String(id)) throw new ForbiddenException('Accès réservé à votre espace patient');
      return;
    }
    if (role === 'doctor') {
      if (String((p as any).doctorId || '') === uid) return;
      throw new ForbiddenException('Vous n’êtes pas le médecin référent de ce patient');
    }
    if (role === 'nurse') {
      if (String((p as any).nurseId || '') === uid) return;
      throw new ForbiddenException('Vous n’êtes pas l’infirmier référent de ce patient');
    }
    if (role === 'carecoordinator') {
      let coordDept = String((user as JwtUser).department || '').trim();
      if (!coordDept) {
        const coord = await this.userModel.findById(uid).select('department').lean().exec();
        coordDept = String((coord as any)?.department || '').trim();
      }
      if (!coordDept) throw new ForbiddenException('Département manquant');
      const pDept = ((p as any).department || (p as any).service || '').trim();
      if (this.deptMatches(pDept, coordDept)) return;
      throw new ForbiddenException('Patient hors département');
    }
    throw new ForbiddenException('Rôle non autorisé pour la messagerie soignant');
  }

  private async deptOfDoctor(id: string): Promise<string> {
    const d = await this.doctorModel.findById(id).select('department').lean().exec();
    return (d as any)?.department?.trim() || '';
  }

  private async deptOfNurse(id: string): Promise<string> {
    const n = await this.nurseModel.findById(id).select('department').lean().exec();
    return (n as any)?.department?.trim() || '';
  }

  /** Fil pair : médecin / infirmier / coordinateur ↔ professionnels du même département. */
  async assertPeerStaff(user: JwtUser, peerRole: 'doctor' | 'nurse' | 'carecoordinator', peerId: string): Promise<void> {
    const ur = user.role as string;
    if (ur === 'patient') throw new ForbiddenException('Messagerie pair réservée au personnel');
    if (peerRole !== 'doctor' && peerRole !== 'nurse' && peerRole !== 'carecoordinator') {
      throw new BadRequestException('Rôle pair invalide');
    }
    const uid = this.uid(user);
    if (uid === peerId && ur === peerRole) throw new BadRequestException('Destinataire invalide');

    if (ur === 'carecoordinator') {
      if (peerRole !== 'doctor' && peerRole !== 'nurse') throw new BadRequestException('Rôle pair invalide');
      let coordDept = String((user as JwtUser).department || '').trim();
      if (!coordDept) {
        const row = await this.userModel.findById(uid).select('department').lean().exec();
        coordDept = String((row as any)?.department || '').trim();
      }
      if (!coordDept) throw new ForbiddenException('Département manquant');
      if (peerRole === 'doctor') {
        const d = await this.doctorModel.findById(peerId).select('department').lean().exec();
        if (!d) throw new NotFoundException('Médecin introuvable');
        if (!this.deptMatches(String((d as any).department || '').trim(), coordDept)) throw new ForbiddenException();
      } else {
        const n = await this.nurseModel.findById(peerId).select('department').lean().exec();
        if (!n) throw new NotFoundException('Infirmier introuvable');
        if (!this.deptMatches(String((n as any).department || '').trim(), coordDept)) throw new ForbiddenException();
      }
      return;
    }

    if (peerRole === 'carecoordinator') {
      if (ur !== 'doctor' && ur !== 'nurse') throw new ForbiddenException();
      const staffDept = ur === 'doctor' ? await this.deptOfDoctor(uid) : await this.deptOfNurse(uid);
      const coord = await this.userModel.findById(peerId).select('department role').lean().exec();
      if (!coord || String((coord as any).role) !== 'carecoordinator') throw new NotFoundException('Coordinateur introuvable');
      if (!this.deptMatches(String((coord as any).department || '').trim(), staffDept)) throw new ForbiddenException();
      return;
    }

    if (ur === 'doctor' || ur === 'nurse') {
      if (peerRole === 'doctor') {
        const d = await this.doctorModel.findById(peerId).select('_id').lean().exec();
        if (!d) throw new NotFoundException('Médecin introuvable');
      } else {
        const n = await this.nurseModel.findById(peerId).select('_id').lean().exec();
        if (!n) throw new NotFoundException('Infirmier introuvable');
      }
      return;
    }

    throw new ForbiddenException();
  }

  /** Patient ↔ médecin, infirmier ou coordinateur (référent ou même département). */
  async assertPatientCanMessageStaff(
    patientId: string,
    peerRole: 'doctor' | 'nurse' | 'carecoordinator',
    peerId: string,
  ): Promise<void> {
    const id = this.pid(patientId);
    const p = await this.patientModel.findById(id).select('doctorId nurseId department service').lean().exec();
    if (!p) throw new NotFoundException('Patient introuvable');
    const dept = ((p as any).department || (p as any).service || '').trim();
    if (peerRole === 'doctor') {
      if (String((p as any).doctorId || '') === peerId) return;
      const d = await this.doctorModel.findById(peerId).select('department').lean().exec();
      if (!d) throw new NotFoundException('Médecin introuvable');
      if (dept && String((d as any).department || '').trim() === dept) return;
      throw new ForbiddenException('Médecin non autorisé pour ce patient');
    }
    if (peerRole === 'nurse') {
      if (String((p as any).nurseId || '') === peerId) return;
      const n = await this.nurseModel.findById(peerId).select('department').lean().exec();
      if (!n) throw new NotFoundException('Infirmier introuvable');
      if (dept && String((n as any).department || '').trim() === dept) return;
      throw new ForbiddenException('Infirmier non autorisé pour ce patient');
    }
    if (peerRole === 'carecoordinator') {
      const coord = await this.userModel.findById(peerId).select('department role').lean().exec();
      if (!coord || String((coord as any).role) !== 'carecoordinator') throw new NotFoundException('Coordinateur introuvable');
      const coordDept = String((coord as any).department || '').trim();
      if (!coordDept) throw new ForbiddenException();
      if (dept && this.deptMatches(dept, coordDept)) return;
      throw new ForbiddenException('Coordinateur non autorisé pour ce patient');
    }
  }

  private groupThreadKey(groupId: string): string {
    return `group:${String(groupId).trim()}`;
  }

  private async assertGroupMember(user: JwtUser, groupId: string): Promise<void> {
    const ur = user.role as string;
    if (ur !== 'doctor' && ur !== 'nurse' && ur !== 'patient') throw new ForbiddenException();
    const uid = this.uid(user);
    const g = await this.staffGroupModel.findById(groupId).lean().exec();
    if (!g) throw new NotFoundException('Groupe introuvable');
    const ok = (g as any).members.some(
      (m: { id: string; role: string }) => m.id === uid && m.role === ur,
    );
    if (!ok) throw new ForbiddenException('Vous n’êtes pas membre de ce groupe');
  }

  /** Création de groupe : réservée aux médecins et infirmiers. */
  async createStaffGroup(
    user: JwtUser,
    body: { name: string; members: { role: 'doctor' | 'nurse' | 'patient'; id: string }[] },
  ) {
    const ur = user.role as string;
    if (ur !== 'doctor' && ur !== 'nurse') throw new ForbiddenException();
    const uid = this.uid(user);
    const name = String(body.name || '').trim().slice(0, 120);
    if (!name) throw new BadRequestException('Nom du groupe requis');
    const raw = Array.isArray(body.members) ? body.members : [];
    if (raw.length < 2) throw new BadRequestException('Au moins 2 membres (vous inclus)');
    const norm = raw.map((m) => {
      const r = String(m.role || '').toLowerCase();
      const id = String(m.id || '').trim();
      if (r === 'patient') return { role: 'patient' as const, id };
      if (r === 'nurse') return { role: 'nurse' as const, id };
      return { role: 'doctor' as const, id };
    });
    if (norm.some((m) => !m.id)) throw new BadRequestException('Membre invalide');
    const uniq = new Set(norm.map((m) => `${m.role}:${m.id}`));
    if (uniq.size !== norm.length) throw new BadRequestException('Membres en double');
    const hasSelf = norm.some((m) => m.id === uid && m.role === ur);
    if (!hasSelf) throw new BadRequestException('Vous devez être membre du groupe');
    for (const m of norm) {
      if (m.role === 'doctor') {
        const d = await this.doctorModel.findById(m.id).select('_id').lean().exec();
        if (!d) throw new BadRequestException('Médecin introuvable');
      } else if (m.role === 'nurse') {
        const n = await this.nurseModel.findById(m.id).select('_id').lean().exec();
        if (!n) throw new BadRequestException('Infirmier introuvable');
      } else {
        const p = await this.patientModel.findById(m.id).select('doctorId nurseId').lean().exec();
        if (!p) throw new BadRequestException('Patient introuvable');
        if (ur === 'doctor' && String((p as any).doctorId || '') !== uid) {
          throw new ForbiddenException('Vous ne pouvez ajouter que vos patients assignés');
        }
        if (ur === 'nurse' && String((p as any).nurseId || '') !== uid) {
          throw new ForbiddenException('Vous ne pouvez ajouter que vos patients assignés');
        }
      }
    }
    const doc = await this.staffGroupModel.create({
      name,
      members: norm,
      createdByRole: ur as 'doctor' | 'nurse',
      createdById: uid,
    });
    return {
      id: String(doc._id),
      name: doc.name,
      members: doc.members,
      createdAt: (doc as any).createdAt,
    };
  }

  async listStaffGroups(user: JwtUser) {
    const ur = user.role as string;
    if (ur !== 'doctor' && ur !== 'nurse' && ur !== 'patient') throw new ForbiddenException();
    const uid = this.uid(user);
    const rows = await this.staffGroupModel
      .find({ members: { $elemMatch: { id: uid, role: ur } } })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
    return rows.map((x: any) => ({
      id: String(x._id),
      name: x.name,
      members: x.members,
      updatedAt: x.updatedAt,
    }));
  }

  async getMessagesGroup(user: JwtUser, groupId: string, beforeIso?: string, limit = 50) {
    await this.assertGroupMember(user, groupId);
    return this.fetchMessagesQuery({ peerThreadKey: this.groupThreadKey(groupId) }, beforeIso, limit);
  }

  async markReadGroup(user: JwtUser, groupId: string) {
    await this.assertGroupMember(user, groupId);
    const ur = user.role as 'doctor' | 'nurse' | 'patient';
    if (ur !== 'doctor' && ur !== 'nurse' && ur !== 'patient') throw new ForbiddenException();
    const key = this.groupThreadKey(groupId);
    const now = new Date();
    await this.readStateModel.findOneAndUpdate(
      { peerThreadKey: key, readerId: this.uid(user), readerRole: ur },
      { $set: { lastReadAt: now } },
      { upsert: true, new: true },
    );
    return { ok: true, lastReadAt: now };
  }

  /** Fil « Mon fil patient » : messages sans peerThreadKey (ancien fil équipe partagé). */
  private legacyThreadFilter(): Record<string, unknown> {
    return {
      $or: [
        { peerThreadKey: { $exists: false } },
        { peerThreadKey: null },
        { peerThreadKey: '' },
      ],
    };
  }

  private async unreadCountPatientLegacy(
    patientOid: Types.ObjectId,
    readerId: string,
    readerRole: 'patient' | 'doctor' | 'nurse',
  ): Promise<number> {
    const rs = await this.readStateModel
      .findOne({ patientId: patientOid, readerId, readerRole })
      .lean()
      .exec();
    const since = rs?.lastReadAt || new Date(0);
    return this.messageModel.countDocuments({
      patientId: patientOid,
      ...this.legacyThreadFilter(),
      createdAt: { $gt: since },
      $nor: [{ senderId: readerId, senderRole: readerRole }],
    });
  }

  private async unreadCountPeer(
    key: string,
    readerId: string,
    readerRole: 'patient' | 'doctor' | 'nurse' | 'carecoordinator',
  ): Promise<number> {
    const rs = await this.readStateModel
      .findOne({ peerThreadKey: key, readerId, readerRole })
      .lean()
      .exec();
    const since = rs?.lastReadAt || new Date(0);
    return this.messageModel.countDocuments({
      peerThreadKey: key,
      createdAt: { $gt: since },
      $nor: [{ senderId: readerId, senderRole: readerRole }],
    });
  }

  async getConversations(user: JwtUser) {
    const role = user.role as string;
    const uid = this.uid(user);

    if (role === 'patient') {
      const id = this.pid(uid);
      const p = await this.patientModel.findById(id).select('firstName lastName').lean().exec();
      if (!p) throw new NotFoundException('Patient introuvable');
      const last = await this.messageModel
        .findOne({ patientId: id, ...this.legacyThreadFilter() })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      const name = `${(p as any).firstName || ''} ${(p as any).lastName || ''}`.trim() || 'Patient';
      const unread = await this.unreadCountPatientLegacy(id, uid, 'patient');
      return [
        {
          patientId: String(id),
          patientName: name,
          lastMessage: this.lastMessagePreview(last),
          lastAt: last ? (last as any).createdAt : null,
          unreadCount: unread,
        },
      ];
    }

    if (role === 'doctor') {
      const patients = await this.patientModel
        .find({ doctorId: uid })
        .select('firstName lastName')
        .sort({ lastName: 1, firstName: 1 })
        .lean()
        .exec();
      const out: any[] = [];
      for (const p of patients) {
        const pid = (p as any)._id as Types.ObjectId;
        const key = patientStaffThreadKey(String(pid), 'doctor', uid);
        const last = await this.messageModel.findOne({ peerThreadKey: key }).sort({ createdAt: -1 }).lean().exec();
        const name = `${(p as any).firstName || ''} ${(p as any).lastName || ''}`.trim() || 'Patient';
        const unread = await this.unreadCountPeer(key, uid, 'doctor');
        out.push({
          patientId: String(pid),
          patientName: name,
          lastMessage: this.lastMessagePreview(last),
          lastAt: last ? (last as any).createdAt : null,
          unreadCount: unread,
        });
      }
      return out;
    }

    if (role === 'nurse') {
      const patients = await this.patientModel
        .find({ nurseId: uid })
        .select('firstName lastName')
        .sort({ lastName: 1, firstName: 1 })
        .lean()
        .exec();
      const out: any[] = [];
      for (const p of patients) {
        const pid = (p as any)._id as Types.ObjectId;
        const key = patientStaffThreadKey(String(pid), 'nurse', uid);
        const last = await this.messageModel.findOne({ peerThreadKey: key }).sort({ createdAt: -1 }).lean().exec();
        const name = `${(p as any).firstName || ''} ${(p as any).lastName || ''}`.trim() || 'Patient';
        const unread = await this.unreadCountPeer(key, uid, 'nurse');
        out.push({
          patientId: String(pid),
          patientName: name,
          lastMessage: this.lastMessagePreview(last),
          lastAt: last ? (last as any).createdAt : null,
          unreadCount: unread,
        });
      }
      return out;
    }

    if (role === 'carecoordinator') {
      return [];
    }

    throw new ForbiddenException('Rôle non autorisé');
  }

  /** Aperçu liste conversations : déchiffre le corps et gère les vocaux. */
  private lastMessagePreview(doc: any | null): string {
    if (!doc) return '';
    const kind = (doc as any).kind || 'text';
    if (kind === 'voice') return 'Message vocal';
    if (kind === 'image') return 'Photo';
    if (kind === 'video') return 'Vidéo';
    if (kind === 'document') return 'Document';
    if (kind === 'vital_alert') return 'Alerte constantes vitales';
    if (kind === 'escalation') return 'Escalade infirmier → médecin';
    if (kind === 'call') {
      const raw = this.messageCrypto.decryptField(String((doc as any).body || ''));
      try {
        const j = JSON.parse(raw) as { outcome?: string; durationSec?: number };
        if (j?.outcome === 'ended' && j.durationSec != null && j.durationSec >= 0) {
          const m = Math.floor(j.durationSec / 60);
          const s = j.durationSec % 60;
          return m > 0 ? `Appel · ${m} min ${s} s` : `Appel · ${s} s`;
        }
        if (j?.outcome === 'declined') return 'Appel refusé';
        if (j?.outcome === 'missed') return 'Appel manqué';
        if (j?.outcome === 'cancelled') return 'Appel annulé';
      } catch {
        /* ignore */
      }
      return 'Appel vocal';
    }
    const body = this.messageCrypto.decryptField(String((doc as any).body || ''));
    return body.slice(0, 120);
  }

  /** Chiffre les champs sensibles avant insertion (si clé configurée). */
  private sealForDb(payload: {
    body: string;
    kind: 'text' | 'voice' | 'image' | 'video' | 'document' | 'call' | 'vital_alert' | 'escalation';
    audioUrl?: string;
    mediaUrl?: string;
    mimeType?: string;
    fileName?: string;
  }) {
    const out: Record<string, unknown> = {
      body: this.messageCrypto.encryptField(payload.body),
      kind: payload.kind,
    };
    if (payload.audioUrl != null && payload.audioUrl !== '') {
      out.audioUrl = this.messageCrypto.encryptField(payload.audioUrl);
    }
    if (payload.mediaUrl != null && payload.mediaUrl !== '') {
      out.mediaUrl = this.messageCrypto.encryptField(payload.mediaUrl);
    }
    if (payload.mimeType != null && payload.mimeType !== '') {
      out.mimeType = this.messageCrypto.encryptField(payload.mimeType);
    }
    if (payload.fileName != null && payload.fileName !== '') {
      out.fileName = this.messageCrypto.encryptField(payload.fileName);
    }
    return out as {
      body: string;
      kind: 'text' | 'voice' | 'image' | 'video' | 'document' | 'call' | 'vital_alert' | 'escalation';
      audioUrl?: string;
      mediaUrl?: string;
      mimeType?: string;
      fileName?: string;
    };
  }

  private mapDoc(d: any) {
    return {
      id: String(d._id),
      role: 'doctor' as const,
      firstName: d.firstName,
      lastName: d.lastName,
      displayName: `${d.firstName || ''} ${d.lastName || ''}`.trim(),
      profileImage: d.profileImage || '/assets/images/user/11.png',
      subtitle: d.specialty || d.department || '',
      department: d.department || '',
    };
  }

  private mapNurse(n: any) {
    return {
      id: String(n._id),
      role: 'nurse' as const,
      firstName: n.firstName,
      lastName: n.lastName,
      displayName: `${n.firstName || ''} ${n.lastName || ''}`.trim(),
      profileImage: n.profileImage || '/assets/images/user/11.png',
      subtitle: n.specialty || n.department || '',
      department: n.department || '',
    };
  }

  private mapCoordinatorUser(c: any) {
    const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || 'Coordinateur';
    return {
      id: String(c._id),
      role: 'carecoordinator' as const,
      firstName: c.firstName,
      lastName: c.lastName,
      displayName: name,
      profileImage: c.profileImage || '/assets/images/user/11.png',
      subtitle: c.department || '',
      department: c.department || '',
    };
  }

  /** Profils du même département + patients assignés (staff) pour alimenter la sidebar /chat */
  async getDepartmentContacts(user: JwtUser) {
    const role = user.role as string;
    const uid = this.uid(user);

    if (role === 'patient') {
      const p = await this.patientModel.findById(this.pid(uid)).select('-password').lean().exec();
      if (!p) throw new NotFoundException('Patient introuvable');
      const dept = ((p as any).department || (p as any).service || '').trim();
      let doctors: any[] = [];
      let nurses: any[] = [];
      let coordinators: any[] = [];
      if (dept) {
        [doctors, nurses, coordinators] = await Promise.all([
          this.doctorModel.find({ department: dept }).select('-password').sort({ lastName: 1 }).lean().exec(),
          this.nurseModel.find({ department: dept }).select('-password').sort({ lastName: 1 }).lean().exec(),
          this.userModel.find({ role: 'carecoordinator', department: dept }).select('-password').sort({ lastName: 1 }).lean().exec(),
        ]);
      }
      const assignedDoctorId = (p as any).doctorId ? String((p as any).doctorId) : '';
      const assignedNurseId = (p as any).nurseId ? String((p as any).nurseId) : '';
      let assignedDoctor = null;
      let assignedNurse = null;
      if (assignedDoctorId) {
        const d = await this.doctorModel.findById(assignedDoctorId).select('-password').lean().exec();
        if (d) assignedDoctor = this.mapDoc(d);
      }
      if (assignedNurseId) {
        const n = await this.nurseModel.findById(assignedNurseId).select('-password').lean().exec();
        if (n) assignedNurse = this.mapNurse(n);
      }
      return {
        department: dept,
        myRole: 'patient',
        patientSelf: {
          id: String((p as any)._id),
          displayName: `${(p as any).firstName || ''} ${(p as any).lastName || ''}`.trim(),
          profileImage: (p as any).profileImage || '/assets/images/user/11.png',
        },
        assignedDoctor,
        assignedNurse,
        doctors: doctors.map((d) => this.mapDoc(d)),
        nurses: nurses.map((n) => this.mapNurse(n)),
        coordinators: coordinators.map((c) => this.mapCoordinatorUser(c)),
        assignedPatients: [],
      };
    }

    if (role === 'doctor') {
      const dept = await this.deptOfDoctor(uid);
      const [sameDoctors, sameNurses, allDoctors, allNurses, patients, coordinators] = await Promise.all([
        dept
          ? this.doctorModel.find({ department: dept }).select('-password').sort({ lastName: 1 }).lean().exec()
          : [],
        dept ? this.nurseModel.find({ department: dept }).select('-password').sort({ lastName: 1 }).lean().exec() : [],
        this.doctorModel.find({}).select('-password').sort({ lastName: 1 }).lean().exec(),
        this.nurseModel.find({}).select('-password').sort({ lastName: 1 }).lean().exec(),
        this.patientModel.find({ doctorId: uid }).select('firstName lastName profileImage').sort({ lastName: 1 }).lean().exec(),
        dept
          ? this.userModel.find({ role: 'carecoordinator', department: dept }).select('-password').sort({ lastName: 1 }).lean().exec()
          : [],
      ]);
      return {
        department: dept,
        myRole: 'doctor',
        doctors: sameDoctors.filter((d) => String(d._id) !== uid).map((d) => this.mapDoc(d)),
        nurses: sameNurses.map((n) => this.mapNurse(n)),
        doctorsAll: allDoctors.filter((d) => String(d._id) !== uid).map((d) => this.mapDoc(d)),
        nursesAll: allNurses.map((n) => this.mapNurse(n)),
        coordinators: coordinators.map((c) => this.mapCoordinatorUser(c)),
        assignedPatients: patients.map((p: any) => ({
          id: String(p._id),
          role: 'patient' as const,
          displayName: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
          profileImage: p.profileImage || '/assets/images/user/11.png',
          subtitle: 'Patient',
        })),
      };
    }

    if (role === 'nurse') {
      const dept = await this.deptOfNurse(uid);
      const [sameDoctors, sameNurses, allDoctors, allNurses, patients, coordinators] = await Promise.all([
        dept
          ? this.doctorModel.find({ department: dept }).select('-password').sort({ lastName: 1 }).lean().exec()
          : [],
        dept ? this.nurseModel.find({ department: dept }).select('-password').sort({ lastName: 1 }).lean().exec() : [],
        this.doctorModel.find({}).select('-password').sort({ lastName: 1 }).lean().exec(),
        this.nurseModel.find({}).select('-password').sort({ lastName: 1 }).lean().exec(),
        this.patientModel.find({ nurseId: uid }).select('firstName lastName profileImage').sort({ lastName: 1 }).lean().exec(),
        dept
          ? this.userModel.find({ role: 'carecoordinator', department: dept }).select('-password').sort({ lastName: 1 }).lean().exec()
          : [],
      ]);
      return {
        department: dept,
        myRole: 'nurse',
        doctors: sameDoctors.map((d) => this.mapDoc(d)),
        nurses: sameNurses.filter((n) => String(n._id) !== uid).map((n) => this.mapNurse(n)),
        doctorsAll: allDoctors.map((d) => this.mapDoc(d)),
        nursesAll: allNurses.filter((n) => String(n._id) !== uid).map((n) => this.mapNurse(n)),
        coordinators: coordinators.map((c) => this.mapCoordinatorUser(c)),
        assignedPatients: patients.map((p: any) => ({
          id: String(p._id),
          role: 'patient' as const,
          displayName: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
          profileImage: p.profileImage || '/assets/images/user/11.png',
          subtitle: 'Patient',
        })),
      };
    }

    if (role === 'carecoordinator') {
      const dept = String((user as JwtUser).department || '').trim();
      if (!dept) throw new BadRequestException('Département manquant');
      const [sameDoctors, sameNurses, deptPatients] = await Promise.all([
        this.doctorModel.find({ department: dept }).select('-password').sort({ lastName: 1 }).lean().exec(),
        this.nurseModel.find({ department: dept }).select('-password').sort({ lastName: 1 }).lean().exec(),
        this.patientModel
          .find({
            $or: [{ department: dept }, { service: dept }],
          })
          .select('firstName lastName profileImage department service')
          .sort({ lastName: 1, firstName: 1 })
          .lean()
          .exec(),
      ]);
      return {
        department: dept,
        myRole: 'carecoordinator',
        doctors: sameDoctors.map((d) => this.mapDoc(d)),
        nurses: sameNurses.map((n) => this.mapNurse(n)),
        assignedPatients: deptPatients.map((p: any) => ({
          id: String(p._id),
          role: 'patient' as const,
          displayName: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
          profileImage: p.profileImage || '/assets/images/user/11.png',
          subtitle: 'Patient',
        })),
      };
    }

    throw new ForbiddenException('Rôle non autorisé');
  }

  private mapMessageRow(m: any) {
    const audioRaw = m.audioUrl != null && m.audioUrl !== '' ? String(m.audioUrl) : undefined;
    const mediaRaw = m.mediaUrl != null && m.mediaUrl !== '' ? String(m.mediaUrl) : undefined;
    const mtRaw = m.mimeType != null && m.mimeType !== '' ? String(m.mimeType) : undefined;
    const fnRaw = m.fileName != null && m.fileName !== '' ? String(m.fileName) : undefined;
    const body = this.messageCrypto.decryptField(String(m.body ?? ''));
    let kind = (m.kind as 'text' | 'voice' | 'image' | 'video' | 'document' | 'call' | 'vital_alert' | 'escalation') || 'text';
    if (kind === 'vital_alert' || kind === 'escalation') {
      /* garder le kind pour l’UI */
    } else if (kind === 'text') {
      try {
        const t = body.trim();
        if (t.startsWith('{')) {
          const j = JSON.parse(t) as { outcome?: string };
          if (['ended', 'declined', 'missed', 'cancelled'].includes(String(j?.outcome || ''))) {
            kind = 'call';
          }
        }
      } catch {
        /* ignore */
      }
    }
    return {
      id: String(m._id),
      patientId: m.patientId ? String(m.patientId) : undefined,
      groupId: m.groupId ? String(m.groupId) : undefined,
      healthLogId: m.healthLogId ? String(m.healthLogId) : undefined,
      peerThreadKey: m.peerThreadKey,
      senderRole: m.senderRole,
      senderId: m.senderId,
      body,
      kind,
      audioUrl: audioRaw ? this.messageCrypto.decryptField(audioRaw) : undefined,
      mediaUrl: mediaRaw ? this.messageCrypto.decryptField(mediaRaw) : undefined,
      mimeType: mtRaw ? this.messageCrypto.decryptField(mtRaw) : undefined,
      fileName: fnRaw ? this.messageCrypto.decryptField(fnRaw) : undefined,
      createdAt: m.createdAt,
    };
  }

  private mapCreatedMessage(m: any) {
    return this.mapMessageRow(m);
  }

  /**
   * Envoie texte, vocal ou pièce jointe (image / vidéo / document) selon les mêmes règles de routage.
   */
  private async routePostMessage(
    user: JwtUser,
    content: {
      kind: 'text' | 'voice' | 'image' | 'video' | 'document' | 'call';
      text: string;
      audioUrl?: string;
      mediaUrl?: string;
      mimeType?: string;
      fileName?: string;
    },
    routing: { patientId?: string; peerRole?: 'doctor' | 'nurse' | 'carecoordinator'; peerId?: string; groupId?: string },
  ) {
    const kind = content.kind;
    const text = String(content.text ?? '').trim();
    const isVoice = kind === 'voice';
    const isMedia = kind === 'image' || kind === 'video' || kind === 'document';
    const isCall = kind === 'call';

    if (kind === 'text') {
      if (!text) throw new BadRequestException('Message vide');
      if (text.length > 4000) throw new BadRequestException('Message trop long (4000 caractères max)');
    } else if (isCall) {
      if (!text) throw new BadRequestException('Métadonnées appel manquantes');
      if (text.length > 2000) throw new BadRequestException('Métadonnées appel trop longues');
      try {
        const j = JSON.parse(text) as { outcome?: string; durationSec?: number };
        const ok = ['ended', 'declined', 'missed', 'cancelled'].includes(String(j?.outcome || ''));
        if (!ok) throw new Error('bad');
        if (j.outcome === 'ended' && j.durationSec != null && (typeof j.durationSec !== 'number' || j.durationSec < 0)) {
          throw new BadRequestException('Durée d’appel invalide');
        }
      } catch (e) {
        if (e instanceof BadRequestException) throw e;
        throw new BadRequestException('Métadonnées appel invalides (JSON)');
      }
    } else if (isVoice) {
      if (!content.audioUrl) throw new BadRequestException('Fichier audio invalide');
    } else if (isMedia) {
      if (!content.mediaUrl) throw new BadRequestException('Fichier manquant');
      if (text.length > 4000) throw new BadRequestException('Légende trop longue (4000 caractères max)');
    }

    const role = user.role as string;
    if (!['patient', 'doctor', 'nurse', 'carecoordinator'].includes(role)) {
      throw new ForbiddenException();
    }
    const uid = this.uid(user);
    const base = this.sealForDb({
      body: isVoice ? '' : text,
      kind,
      ...(isVoice && content.audioUrl ? { audioUrl: content.audioUrl } : {}),
      ...(isMedia
        ? {
            mediaUrl: content.mediaUrl!,
            mimeType: content.mimeType || '',
            fileName: content.fileName || '',
          }
        : {}),
    });

    if (routing.groupId && (role === 'doctor' || role === 'nurse' || role === 'patient')) {
      const gid = String(routing.groupId).trim();
      if (!Types.ObjectId.isValid(gid)) throw new BadRequestException('groupId invalide');
      await this.assertGroupMember(user, gid);
      const key = this.groupThreadKey(gid);
      const oid = new Types.ObjectId(gid);
      const doc = await this.messageModel.create({
        ...base,
        peerThreadKey: key,
        groupId: oid,
        senderRole: role,
        senderId: uid,
      });
      const mapped = this.mapCreatedMessage(doc.toObject());
      const g = await this.staffGroupModel.findById(oid).lean().exec();
      if (g) {
        const senderName = await this.notificationService.resolveChatSenderName(role, uid);
        const bodyForNotify = isVoice ? '' : text;
        await this.notificationService
          .notifyGroupChatMessage({
            senderRole: role,
            senderId: uid,
            senderName,
            groupName: String((g as any).name || 'Groupe'),
            members: (g as any).members as { role: 'doctor' | 'nurse' | 'patient'; id: string }[],
            kind,
            bodyText: bodyForNotify,
          })
          .catch(() => {});
      }
      return mapped;
    }

    if (role === 'patient' && routing.peerRole && routing.peerId) {
      const pr = routing.peerRole;
      if (pr !== 'doctor' && pr !== 'nurse' && pr !== 'carecoordinator') throw new BadRequestException('Rôle pair invalide');
      await this.assertPatientCanMessageStaff(uid, pr, routing.peerId);
      const key = patientStaffThreadKey(uid, pr, routing.peerId);
      const doc = await this.messageModel.create({
        ...base,
        peerThreadKey: key,
        patientId: this.pid(uid),
        senderRole: 'patient',
        senderId: uid,
      });
      const mapped = this.mapCreatedMessage(doc.toObject());
      await this.notifyRecipientsAfterMessage(user, routing, { kind, text }, mapped).catch(() => {});
      return mapped;
    }

    if (routing.peerRole && routing.peerId && role !== 'patient') {
      await this.assertPeerStaff(user, routing.peerRole, routing.peerId);
      const ur = user.role as string;
      const key = peerThreadKey({ role: ur, id: uid }, { role: routing.peerRole, id: routing.peerId });
      const senderRole: 'doctor' | 'nurse' | 'carecoordinator' =
        role === 'carecoordinator' ? 'carecoordinator' : (role as 'doctor' | 'nurse');
      const doc = await this.messageModel.create({
        ...base,
        peerThreadKey: key,
        senderRole,
        senderId: uid,
      });
      const mapped = this.mapCreatedMessage(doc.toObject());
      await this.notifyRecipientsAfterMessage(user, routing, { kind, text }, mapped).catch(() => {});
      return mapped;
    }

    if (role === 'patient' && routing.patientId && !routing.peerRole) {
      const pid = String(routing.patientId);
      if (pid !== uid) throw new ForbiddenException();
      const id = this.pid(pid);
      const doc = await this.messageModel.create({
        ...base,
        patientId: id,
        senderRole: 'patient',
        senderId: uid,
      });
      const mapped = this.mapCreatedMessage(doc.toObject());
      await this.notifyRecipientsAfterMessage(user, routing, { kind, text }, mapped).catch(() => {});
      return mapped;
    }

    const patientId = String(routing.patientId || '');
    if (!patientId) throw new BadRequestException('patientId ou pair requis');
    await this.assertParticipant(user, patientId);
    const id = this.pid(patientId);
    const staffRole: 'doctor' | 'nurse' | 'carecoordinator' =
      role === 'carecoordinator' ? 'carecoordinator' : (role as 'doctor' | 'nurse');
    const key = patientStaffThreadKey(patientId, staffRole, uid);
    const doc = await this.messageModel.create({
      ...base,
      peerThreadKey: key,
      patientId: id,
      senderRole: staffRole,
      senderId: uid,
    });
    const mapped = this.mapCreatedMessage(doc.toObject());
    await this.notifyRecipientsAfterMessage(user, routing, { kind, text }, mapped).catch(() => {});
    await this.gamificationService.awardPoints(uid, staffRole, 'chat_sent');
    return mapped;
  }

  private async notifyRecipientsAfterMessage(
    user: JwtUser,
    routing: { patientId?: string; peerRole?: 'doctor' | 'nurse' | 'carecoordinator'; peerId?: string; groupId?: string },
    payload: { kind: string; text: string },
    mapped: { patientId?: string },
  ) {
    const ur = user.role as string;
    if (!['patient', 'doctor', 'nurse', 'carecoordinator'].includes(ur)) return;
    const senderName = await this.notificationService.resolveChatSenderName(ur, this.uid(user));
    await this.notificationService.notifyChatDispatch({
      senderRole: ur as 'patient' | 'doctor' | 'nurse' | 'carecoordinator',
      senderId: this.uid(user),
      senderName,
      routing,
      kind: payload.kind as 'text' | 'voice' | 'image' | 'video' | 'document' | 'call',
      bodyText: payload.text,
      mappedPatientId: mapped.patientId,
    });
  }

  private async fetchMessagesQuery(
    q: Record<string, unknown>,
    beforeIso: string | undefined,
    limit: number,
  ) {
    const lim = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const query: Record<string, unknown> = { ...q };
    if (beforeIso) {
      const d = new Date(beforeIso);
      if (!Number.isNaN(d.getTime())) {
        query.createdAt = { $lt: d };
      }
    }
    const rows = await this.messageModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(lim)
      .lean()
      .exec();
    return rows.reverse().map((m: any) => this.mapMessageRow(m));
  }

  /**
   * Fil par patientId : patient connecté = « Mon fil » (legacy, sans peerThreadKey) ;
   * médecin / infirmier = fil dédié avec ce patient uniquement (peerThreadKey patient–staff).
   */
  async getMessages(user: JwtUser, patientId: string, beforeIso?: string, limit = 50) {
    const role = user.role as string;
    const uid = this.uid(user);
    const id = this.pid(patientId);

    if (role === 'patient') {
      if (uid !== patientId) throw new ForbiddenException();
      const q = { patientId: id, ...this.legacyThreadFilter() };
      return this.fetchMessagesQuery(q, beforeIso, limit);
    }

    if (role === 'doctor' || role === 'nurse' || role === 'carecoordinator') {
      await this.assertParticipant(user, patientId);
      const key = patientStaffThreadKey(
        patientId,
        role as 'doctor' | 'nurse' | 'carecoordinator',
        uid,
      );
      return this.fetchMessagesQuery({ peerThreadKey: key }, beforeIso, limit);
    }

    throw new ForbiddenException();
  }

  /** Patient ouvrant un fil avec un médecin, un infirmier ou un coordinateur (peerRole + peerId). */
  async getMessagesPatientStaff(
    user: JwtUser,
    peerRole: 'doctor' | 'nurse' | 'carecoordinator',
    peerId: string,
    beforeIso?: string,
    limit = 50,
  ) {
    if (user.role !== 'patient') throw new ForbiddenException();
    const pid = this.uid(user);
    await this.assertPatientCanMessageStaff(pid, peerRole, peerId);
    const key = patientStaffThreadKey(pid, peerRole, peerId);
    return this.fetchMessagesQuery({ peerThreadKey: key }, beforeIso, limit);
  }

  async getMessagesPeer(user: JwtUser, peerRole: 'doctor' | 'nurse' | 'carecoordinator', peerId: string, beforeIso?: string, limit = 50) {
    await this.assertPeerStaff(user, peerRole, peerId);
    const ur = user.role as string;
    const key = peerThreadKey({ role: ur, id: this.uid(user) }, { role: peerRole, id: peerId });
    return this.fetchMessagesQuery({ peerThreadKey: key }, beforeIso, limit);
  }

  async postMessage(
    user: JwtUser,
    body: {
      text?: string;
      body?: string;
      kind?: 'text' | 'call';
      patientId?: string;
      peerRole?: 'doctor' | 'nurse' | 'carecoordinator';
      peerId?: string;
      groupId?: string;
    },
  ) {
    const kind = body.kind === 'call' ? 'call' : 'text';
    const text = kind === 'call' ? String(body.body ?? '').trim() : String(body.text ?? body.body ?? '').trim();
    return this.routePostMessage(
      user,
      { kind, text },
      {
        patientId: body.patientId,
        peerRole: body.peerRole,
        peerId: body.peerId,
        groupId: body.groupId,
      },
    );
  }

  async postVoiceMessage(
    user: JwtUser,
    file: { filename: string; mimetype?: string },
    fields: { patientId?: string; peerRole?: string; peerId?: string; groupId?: string },
  ) {
    if (!file?.filename) throw new BadRequestException('Fichier audio requis');
    const mt = String(file.mimetype || '').toLowerCase();
    const ok =
      /^audio\/(webm|ogg|mp4|mpeg|wav|mp3|aac|x-m4a|x-wav)/.test(mt) ||
      mt === 'video/webm' ||
      mt === 'application/ogg';
    if (!ok) {
      throw new BadRequestException('Format audio non supporté (utilisez webm, ogg ou mp4)');
    }
    const audioUrl = `/api/chat/media/${file.filename}`;
    const peerRole =
      fields.peerRole === 'doctor' || fields.peerRole === 'nurse' || fields.peerRole === 'carecoordinator'
        ? (fields.peerRole as 'doctor' | 'nurse' | 'carecoordinator')
        : undefined;
    return this.routePostMessage(
      user,
      { kind: 'voice', text: '', audioUrl },
      {
        patientId: fields.patientId,
        peerRole,
        peerId: fields.peerId,
        groupId: fields.groupId,
      },
    );
  }

  async postMediaMessage(
    user: JwtUser,
    file: { filename: string; originalname?: string; mimetype?: string; size: number },
    fields: {
      category: string;
      caption?: string;
      patientId?: string;
      peerRole?: string;
      peerId?: string;
      groupId?: string;
    },
  ) {
    if (!file?.filename) throw new BadRequestException('Fichier requis');
    const cat = fields.category as 'image' | 'video' | 'document';
    if (!['image', 'video', 'document'].includes(cat)) {
      throw new BadRequestException('category doit être image, video ou document');
    }
    const mt = String(file.mimetype || '').toLowerCase();
    const size = file.size || 0;

    const limits = { image: 8 * 1024 * 1024, video: 40 * 1024 * 1024, document: 15 * 1024 * 1024 };
    if (size > limits[cat]) {
      throw new BadRequestException(`Fichier trop volumineux (max ${limits[cat] / (1024 * 1024)} Mo pour ${cat})`);
    }

    let ok = false;
    if (cat === 'image') {
      ok = mt.startsWith('image/');
    } else if (cat === 'video') {
      ok = mt.startsWith('video/');
    } else {
      ok =
        mt === 'application/pdf' ||
        mt === 'application/msword' ||
        mt === 'text/plain' ||
        /^application\/vnd\.openxmlformats-officedocument\./.test(mt) ||
        /^application\/vnd\.ms-/.test(mt);
    }
    if (!ok) {
      throw new BadRequestException(`Type de fichier non accepté pour ${cat}`);
    }

    const mediaUrl = `/api/chat/media/${file.filename}`;
    const caption = String(fields.caption ?? '').trim().slice(0, 4000);
    const peerRole =
      fields.peerRole === 'doctor' || fields.peerRole === 'nurse' || fields.peerRole === 'carecoordinator'
        ? (fields.peerRole as 'doctor' | 'nurse' | 'carecoordinator')
        : undefined;
    const orig = (file.originalname || file.filename || 'fichier').slice(0, 900);

    return this.routePostMessage(
      user,
      {
        kind: cat,
        text: caption,
        mediaUrl,
        mimeType: file.mimetype || '',
        fileName: orig,
      },
      {
        patientId: fields.patientId,
        peerRole,
        peerId: fields.peerId,
        groupId: fields.groupId,
      },
    );
  }

  async markRead(user: JwtUser, patientId: string) {
    await this.assertParticipant(user, patientId);
    const role = user.role as 'patient' | 'doctor' | 'nurse' | 'carecoordinator';
    if (!['patient', 'doctor', 'nurse', 'carecoordinator'].includes(role)) throw new ForbiddenException();
    const uid = this.uid(user);
    const now = new Date();

    if (role === 'patient') {
      const id = this.pid(patientId);
      await this.readStateModel.findOneAndUpdate(
        { patientId: id, readerId: uid, readerRole: 'patient' },
        { $set: { lastReadAt: now } },
        { upsert: true, new: true },
      );
      return { ok: true, lastReadAt: now };
    }

    const key = patientStaffThreadKey(patientId, role, uid);
    await this.readStateModel.findOneAndUpdate(
      { peerThreadKey: key, readerId: uid, readerRole: role },
      { $set: { lastReadAt: now } },
      { upsert: true, new: true },
    );
    return { ok: true, lastReadAt: now };
  }

  async markReadPatientStaff(user: JwtUser, peerRole: 'doctor' | 'nurse' | 'carecoordinator', peerId: string) {
    if (user.role !== 'patient') throw new ForbiddenException();
    const pid = this.uid(user);
    await this.assertPatientCanMessageStaff(pid, peerRole, peerId);
    const key = patientStaffThreadKey(pid, peerRole, peerId);
    const now = new Date();
    await this.readStateModel.findOneAndUpdate(
      { peerThreadKey: key, readerId: pid, readerRole: 'patient' },
      { $set: { lastReadAt: now } },
      { upsert: true, new: true },
    );
    return { ok: true, lastReadAt: now };
  }

  async markReadPeer(user: JwtUser, peerRole: 'doctor' | 'nurse' | 'carecoordinator', peerId: string) {
    await this.assertPeerStaff(user, peerRole, peerId);
    const ur = user.role as string;
    const key = peerThreadKey({ role: ur, id: this.uid(user) }, { role: peerRole, id: peerId });
    const now = new Date();
    await this.readStateModel.findOneAndUpdate(
      { peerThreadKey: key, readerId: this.uid(user), readerRole: ur },
      { $set: { lastReadAt: now } },
      { upsert: true, new: true },
    );
    return { ok: true, lastReadAt: now };
  }

  /** Fil patient–infirmier : message auto (alerte constantes), expéditeur = patient. */
  async insertVitalAlertPatientToNurse(patientId: string, nurseId: string, body: string, healthLogId: Types.ObjectId) {
    const pid = this.pid(patientId);
    const key = patientStaffThreadKey(patientId, 'nurse', nurseId);
    const sealed = this.sealForDb({ body, kind: 'vital_alert' });
    await this.messageModel.create({
      ...sealed,
      peerThreadKey: key,
      patientId: pid,
      senderRole: 'patient',
      senderId: String(patientId),
      healthLogId,
    });
  }

  /** Pas d’infirmier assigné : même contenu sur le fil patient–médecin. */
  async insertVitalAlertPatientToDoctor(patientId: string, doctorId: string, body: string, healthLogId: Types.ObjectId) {
    const pid = this.pid(patientId);
    const key = patientStaffThreadKey(patientId, 'doctor', doctorId);
    const sealed = this.sealForDb({ body, kind: 'vital_alert' });
    await this.messageModel.create({
      ...sealed,
      peerThreadKey: key,
      patientId: pid,
      senderRole: 'patient',
      senderId: String(patientId),
      healthLogId,
    });
  }

  /** Fil patient–médecin : escalade infirmier → médecin. */
  async insertEscalationNurseToDoctor(
    patientId: string,
    doctorId: string,
    nurseId: string,
    body: string,
    healthLogId: Types.ObjectId,
  ) {
    const pid = this.pid(patientId);
    const key = patientStaffThreadKey(patientId, 'doctor', doctorId);
    const sealed = this.sealForDb({ body, kind: 'escalation' });
    await this.messageModel.create({
      ...sealed,
      peerThreadKey: key,
      patientId: pid,
      senderRole: 'nurse',
      senderId: nurseId,
      healthLogId,
    });
  }

  /** Fil patient–médecin : clôture par le médecin (notif patient comme un message classique). */
  async insertDoctorResolutionCloture(patientId: string, doctorId: string, body: string, healthLogId: Types.ObjectId) {
    const pid = this.pid(patientId);
    const key = patientStaffThreadKey(patientId, 'doctor', doctorId);
    const sealed = this.sealForDb({ body, kind: 'text' });
    await this.messageModel.create({
      ...sealed,
      peerThreadKey: key,
      patientId: pid,
      senderRole: 'doctor',
      senderId: doctorId,
      healthLogId,
    });
    const text = String(body || '');
    const senderName = await this.notificationService.resolveChatSenderName('doctor', String(doctorId));
    await this.notificationService
      .notifyChatDispatch({
        senderRole: 'doctor',
        senderId: String(doctorId),
        senderName,
        routing: { patientId: String(patientId) },
        kind: 'text',
        bodyText: text.slice(0, 500),
        mappedPatientId: String(patientId),
      })
      .catch(() => {});
  }
}
