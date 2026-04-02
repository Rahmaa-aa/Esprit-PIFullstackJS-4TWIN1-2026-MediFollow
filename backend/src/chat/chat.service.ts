import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatMessageCryptoService } from './chat-message-crypto.service';
import { CareMessage } from './schemas/care-message.schema';
import { ChatReadState } from './schemas/chat-read-state.schema';
import { Patient } from '../patient/schemas/patient.schema';
import { Doctor } from '../doctor/schemas/doctor.schema';
import { Nurse } from '../nurse/schemas/nurse.schema';
import { NotificationService } from '../notification/notification.service';

type JwtUser = {
  id: unknown;
  role: string;
};

function peerThreadKey(
  a: { role: string; id: string },
  b: { role: string; id: string },
): string {
  const x = `${a.role}:${a.id}`;
  const y = `${b.role}:${b.id}`;
  return [x, y].sort().join('|');
}

/** Fil dédié patient ↔ médecin ou patient ↔ infirmier (distinct du fil « équipe » partagé). */
function patientStaffThreadKey(patientId: string, staffRole: 'doctor' | 'nurse', staffId: string): string {
  return peerThreadKey({ role: 'patient', id: patientId }, { role: staffRole, id: staffId });
}

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(CareMessage.name) private messageModel: Model<CareMessage>,
    @InjectModel(ChatReadState.name) private readStateModel: Model<ChatReadState>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
    private readonly messageCrypto: ChatMessageCryptoService,
    private readonly notificationService: NotificationService,
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

  async assertParticipant(user: JwtUser, patientId: string): Promise<void> {
    const id = this.pid(patientId);
    const p = await this.patientModel.findById(id).select('doctorId nurseId').lean().exec();
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

  /** Fil pair : médecin ou infirmier ↔ tout médecin / tout infirmier de l'établissement. */
  async assertPeerStaff(user: JwtUser, peerRole: 'doctor' | 'nurse', peerId: string): Promise<void> {
    const ur = user.role as string;
    if (ur === 'patient') throw new ForbiddenException('Messagerie pair réservée au personnel');
    if (peerRole !== 'doctor' && peerRole !== 'nurse') throw new BadRequestException('Rôle pair invalide');
    const uid = this.uid(user);
    if (uid === peerId && ur === peerRole) throw new BadRequestException('Destinataire invalide');

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

  /** Patient ↔ médecin ou patient ↔ infirmier (référent ou même département). */
  async assertPatientCanMessageStaff(
    patientId: string,
    peerRole: 'doctor' | 'nurse',
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
    readerRole: 'patient' | 'doctor' | 'nurse',
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
    kind: 'text' | 'voice' | 'image' | 'video' | 'document' | 'call';
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
      kind: 'text' | 'voice' | 'image' | 'video' | 'document' | 'call';
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
      if (dept) {
        [doctors, nurses] = await Promise.all([
          this.doctorModel.find({ department: dept }).select('-password').sort({ lastName: 1 }).lean().exec(),
          this.nurseModel.find({ department: dept }).select('-password').sort({ lastName: 1 }).lean().exec(),
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
        assignedPatients: [],
      };
    }

    if (role === 'doctor') {
      const dept = await this.deptOfDoctor(uid);
      const [sameDoctors, sameNurses, allDoctors, allNurses, patients] = await Promise.all([
        dept
          ? this.doctorModel.find({ department: dept }).select('-password').sort({ lastName: 1 }).lean().exec()
          : [],
        dept ? this.nurseModel.find({ department: dept }).select('-password').sort({ lastName: 1 }).lean().exec() : [],
        this.doctorModel.find({}).select('-password').sort({ lastName: 1 }).lean().exec(),
        this.nurseModel.find({}).select('-password').sort({ lastName: 1 }).lean().exec(),
        this.patientModel.find({ doctorId: uid }).select('firstName lastName profileImage').sort({ lastName: 1 }).lean().exec(),
      ]);
      return {
        department: dept,
        myRole: 'doctor',
        doctors: sameDoctors.filter((d) => String(d._id) !== uid).map((d) => this.mapDoc(d)),
        nurses: sameNurses.map((n) => this.mapNurse(n)),
        doctorsAll: allDoctors.filter((d) => String(d._id) !== uid).map((d) => this.mapDoc(d)),
        nursesAll: allNurses.map((n) => this.mapNurse(n)),
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
      const [sameDoctors, sameNurses, allDoctors, allNurses, patients] = await Promise.all([
        dept
          ? this.doctorModel.find({ department: dept }).select('-password').sort({ lastName: 1 }).lean().exec()
          : [],
        dept ? this.nurseModel.find({ department: dept }).select('-password').sort({ lastName: 1 }).lean().exec() : [],
        this.doctorModel.find({}).select('-password').sort({ lastName: 1 }).lean().exec(),
        this.nurseModel.find({}).select('-password').sort({ lastName: 1 }).lean().exec(),
        this.patientModel.find({ nurseId: uid }).select('firstName lastName profileImage').sort({ lastName: 1 }).lean().exec(),
      ]);
      return {
        department: dept,
        myRole: 'nurse',
        doctors: sameDoctors.map((d) => this.mapDoc(d)),
        nurses: sameNurses.filter((n) => String(n._id) !== uid).map((n) => this.mapNurse(n)),
        doctorsAll: allDoctors.map((d) => this.mapDoc(d)),
        nursesAll: allNurses.filter((n) => String(n._id) !== uid).map((n) => this.mapNurse(n)),
        assignedPatients: patients.map((p: any) => ({
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
    let kind = (m.kind as 'text' | 'voice' | 'image' | 'video' | 'document' | 'call') || 'text';
    if (kind === 'text') {
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
    routing: { patientId?: string; peerRole?: 'doctor' | 'nurse'; peerId?: string },
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

    const role = user.role as 'patient' | 'doctor' | 'nurse';
    if (!['patient', 'doctor', 'nurse'].includes(role)) {
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

    if (role === 'patient' && routing.peerRole && routing.peerId) {
      await this.assertPatientCanMessageStaff(uid, routing.peerRole, routing.peerId);
      const key = patientStaffThreadKey(uid, routing.peerRole, routing.peerId);
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
      const ur = user.role as 'doctor' | 'nurse';
      const key = peerThreadKey({ role: ur, id: uid }, { role: routing.peerRole, id: routing.peerId });
      const doc = await this.messageModel.create({
        ...base,
        peerThreadKey: key,
        senderRole: role,
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
    const staffRole = role as 'doctor' | 'nurse';
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
    return mapped;
  }

  private async notifyRecipientsAfterMessage(
    user: JwtUser,
    routing: { patientId?: string; peerRole?: 'doctor' | 'nurse'; peerId?: string },
    payload: { kind: string; text: string },
    mapped: { patientId?: string },
  ) {
    const ur = user.role as string;
    if (!['patient', 'doctor', 'nurse'].includes(ur)) return;
    const senderName = await this.notificationService.resolveChatSenderName(ur, this.uid(user));
    await this.notificationService.notifyChatDispatch({
      senderRole: ur as 'patient' | 'doctor' | 'nurse',
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

    if (role === 'doctor' || role === 'nurse') {
      await this.assertParticipant(user, patientId);
      const key = patientStaffThreadKey(patientId, role, uid);
      return this.fetchMessagesQuery({ peerThreadKey: key }, beforeIso, limit);
    }

    throw new ForbiddenException();
  }

  /** Patient ouvrant un fil avec un médecin ou un infirmier (peerRole + peerId). */
  async getMessagesPatientStaff(
    user: JwtUser,
    peerRole: 'doctor' | 'nurse',
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

  async getMessagesPeer(user: JwtUser, peerRole: 'doctor' | 'nurse', peerId: string, beforeIso?: string, limit = 50) {
    await this.assertPeerStaff(user, peerRole, peerId);
    const ur = user.role as 'doctor' | 'nurse';
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
      peerRole?: 'doctor' | 'nurse';
      peerId?: string;
    },
  ) {
    const kind = body.kind === 'call' ? 'call' : 'text';
    const text = kind === 'call' ? String(body.body ?? '').trim() : String(body.text ?? body.body ?? '').trim();
    return this.routePostMessage(
      user,
      { kind, text },
      { patientId: body.patientId, peerRole: body.peerRole, peerId: body.peerId },
    );
  }

  async postVoiceMessage(
    user: JwtUser,
    file: { filename: string; mimetype?: string },
    fields: { patientId?: string; peerRole?: string; peerId?: string },
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
      fields.peerRole === 'doctor' || fields.peerRole === 'nurse' ? fields.peerRole : undefined;
    return this.routePostMessage(
      user,
      { kind: 'voice', text: '', audioUrl },
      { patientId: fields.patientId, peerRole, peerId: fields.peerId },
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
      fields.peerRole === 'doctor' || fields.peerRole === 'nurse' ? fields.peerRole : undefined;
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
      { patientId: fields.patientId, peerRole, peerId: fields.peerId },
    );
  }

  async markRead(user: JwtUser, patientId: string) {
    await this.assertParticipant(user, patientId);
    const role = user.role as 'patient' | 'doctor' | 'nurse';
    if (!['patient', 'doctor', 'nurse'].includes(role)) throw new ForbiddenException();
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

  async markReadPatientStaff(user: JwtUser, peerRole: 'doctor' | 'nurse', peerId: string) {
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

  async markReadPeer(user: JwtUser, peerRole: 'doctor' | 'nurse', peerId: string) {
    await this.assertPeerStaff(user, peerRole, peerId);
    const ur = user.role as 'doctor' | 'nurse';
    const key = peerThreadKey({ role: ur, id: this.uid(user) }, { role: peerRole, id: peerId });
    const now = new Date();
    await this.readStateModel.findOneAndUpdate(
      { peerThreadKey: key, readerId: this.uid(user), readerRole: ur },
      { $set: { lastReadAt: now } },
      { upsert: true, new: true },
    );
    return { ok: true, lastReadAt: now };
  }
}
