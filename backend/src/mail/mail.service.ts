import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MailMessage } from './schemas/mail-message.schema';
import { MailUserState, MailFolder } from './schemas/mail-user-state.schema';
import { MailLabel } from './schemas/mail-label.schema';
import { MailPolicyService, MailPeer } from './mail-policy.service';
import { EmailService } from '../auth/email.service';
import { NotificationService } from '../notification/notification.service';
import { Patient } from '../patient/schemas/patient.schema';
import { Doctor } from '../doctor/schemas/doctor.schema';
import { Nurse } from '../nurse/schemas/nurse.schema';

const MAIL_QUOTA_BYTES = 15 * 1024 * 1024 * 1024; // 15 Go

function normDept(s?: string): string {
  return String(s || '')
    .trim()
    .toLowerCase();
}

type JwtUser = { id: unknown; role: string };

function uid(u: JwtUser): string {
  return String(u.id ?? '');
}

function computeTotalSize(subject: string, body: string, attachmentSizeBytes: number): number {
  const s = Buffer.byteLength(subject || '', 'utf8');
  const b = Buffer.byteLength(body || '', 'utf8');
  return s + b + (attachmentSizeBytes || 0);
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @InjectModel(MailMessage.name) private messageModel: Model<MailMessage>,
    @InjectModel(MailUserState.name) private stateModel: Model<MailUserState>,
    @InjectModel(MailLabel.name) private labelModel: Model<MailLabel>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
    private readonly policy: MailPolicyService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {}

  /** Adresse e-mail du compte (pour copie SMTP → Gmail, etc.). */
  private async lookupUserEmail(role: string, id: string): Promise<string | null> {
    const oid = this.oid(id);
    if (role === 'doctor') {
      const d = await this.doctorModel.findById(oid).select('email').lean().exec();
      return (d as any)?.email ? String((d as any).email).trim() : null;
    }
    if (role === 'nurse') {
      const n = await this.nurseModel.findById(oid).select('email').lean().exec();
      return (n as any)?.email ? String((n as any).email).trim() : null;
    }
    if (role === 'patient') {
      const p = await this.patientModel.findById(oid).select('email').lean().exec();
      return (p as any)?.email ? String((p as any).email).trim() : null;
    }
    return null;
  }

  /** Copie SMTP quasi instantanée vers la boîte du destinataire (désactivable : MAIL_MIRROR_SMTP=false). */
  private scheduleMirrorToRecipients(
    recipients: MailPeer[],
    subject: string,
    body: string,
    senderRole: string,
    senderId: string,
  ): void {
    if (process.env.MAIL_MIRROR_SMTP === 'false' || process.env.MAIL_MIRROR_SMTP === '0') {
      return;
    }
    void this.sendMirrorCopies(recipients, subject, body, senderRole, senderId).catch((err) => {
      console.error('[Mail] Copie SMTP échouée (message interne tout de même enregistré):', err?.message || err);
    });
  }

  private async sendMirrorCopies(
    recipients: MailPeer[],
    subject: string,
    body: string,
    senderRole: string,
    senderId: string,
  ): Promise<void> {
    const fromDisplay = await this.lookupPersonName(senderRole as 'patient' | 'doctor' | 'nurse', senderId);
    for (const r of recipients) {
      const email = await this.lookupUserEmail(r.role, r.id);
      if (!email) {
        this.logger.warn(
          `[Mirror] Pas d’e-mail sur le profil ${r.role} id=${r.id} — aucune copie SMTP (renseignez le champ email en base).`,
        );
        continue;
      }
      await this.emailService.sendInternalMailMirror({
        toEmail: email,
        subject,
        bodyPlain: body,
        fromDisplay: fromDisplay || senderRole,
      });
    }
  }

  /** Notification cloche app pour chaque destinataire (échec ignoré, l’e-mail est déjà en base). */
  private async notifyRecipientsNewMail(
    recipientStates: { role: 'patient' | 'doctor' | 'nurse'; id: string; stateId: string }[],
    messageId: Types.ObjectId,
    subject: string,
    senderRole: string,
    senderId: string,
  ): Promise<void> {
    if (!recipientStates.length) return;
    try {
      const senderName = await this.lookupPersonName(
        senderRole as 'patient' | 'doctor' | 'nurse',
        senderId,
      );
      await this.notificationService.notifyNewInternalMail({
        messageId: String(messageId),
        subject,
        senderName: senderName || senderRole,
        recipients: recipientStates,
      });
    } catch (e: any) {
      this.logger.warn(`[Mail] Notification réception: ${e?.message || e}`);
    }
  }

  private oid(id: string): Types.ObjectId {
    const s = String(id).trim();
    if (!Types.ObjectId.isValid(s)) throw new BadRequestException('Identifiant invalide');
    return new Types.ObjectId(s);
  }

  private userKey(role: string, id: string) {
    return { userRole: role, userId: this.oid(id) };
  }

  /** Vérifie quota avant envoi (approximation : stockage des messages où l’utilisateur participe). */
  async assertQuotaOk(user: JwtUser, additionalBytes: number): Promise<void> {
    const used = await this.getStorageUsedBytes(user);
    if (used + additionalBytes > MAIL_QUOTA_BYTES) {
      throw new ForbiddenException('Quota de stockage e-mail dépassé (15 Go max)');
    }
  }

  async getStorageUsedBytes(user: JwtUser): Promise<number> {
    const ur = String(user.role);
    const id = uid(user);
    const mid = this.oid(id);

    const pipeline = [
      {
        $match: {
          $or: [
            { senderId: mid, senderRole: ur },
            { recipients: { $elemMatch: { id: mid, role: ur } } },
          ],
        },
      },
      { $group: { _id: '$_id', totalSizeBytes: { $first: '$totalSizeBytes' } } },
      { $group: { _id: null, sum: { $sum: '$totalSizeBytes' } } },
    ];
    const agg = await this.messageModel.aggregate(pipeline).exec();
    return agg[0]?.sum || 0;
  }

  async getStorageStats(user: JwtUser) {
    const used = await this.getStorageUsedBytes(user);
    return {
      usedBytes: used,
      quotaBytes: MAIL_QUOTA_BYTES,
      percent: Math.min(100, Math.round((used / MAIL_QUOTA_BYTES) * 1000) / 10),
    };
  }

  async getFolderCounts(user: JwtUser) {
    const { userRole, userId } = this.userKey(String(user.role), uid(user));
    const base = { userRole, userId };

    const [
      inboxUnread,
      draftCount,
      trashCount,
      spamCount,
      importantCount,
    ] = await Promise.all([
      this.stateModel.countDocuments({
        ...base,
        folder: 'inbox',
        readAt: null,
        $or: [{ snoozedUntil: null }, { snoozedUntil: { $lte: new Date() } }],
      }),
      this.stateModel.countDocuments({ ...base, folder: 'drafts' }),
      this.stateModel.countDocuments({ ...base, folder: 'trash' }),
      this.stateModel.countDocuments({ ...base, folder: 'spam' }),
      this.stateModel.countDocuments({ ...base, folder: 'important' }),
    ]);

    return {
      inboxUnread,
      drafts: draftCount,
      trash: trashCount,
      spam: spamCount,
      important: importantCount,
    };
  }

  async send(
    user: JwtUser,
    body: {
      to: MailPeer[];
      subject: string;
      body: string;
      attachmentSizeBytes?: number;
    },
  ) {
    const ur = String(user.role);
    const id = uid(user);
    if (!['patient', 'doctor', 'nurse'].includes(ur)) {
      throw new ForbiddenException('Messagerie réservée aux patients et au personnel soignant');
    }

    const recipients = body.to || [];
    const subject = String(body.subject || '').slice(0, 500);
    const text = String(body.body || '');
    const att = Math.max(0, Number(body.attachmentSizeBytes) || 0);
    const totalSize = computeTotalSize(subject, text, att);

    await this.policy.assertCanSend(ur, id, recipients);
    await this.assertQuotaOk(user, totalSize);

    const recipientsOid = recipients.map((r) => ({
      role: r.role,
      id: this.oid(r.id),
    }));

    const msg = await this.messageModel.create({
      senderRole: ur as 'patient' | 'doctor' | 'nurse',
      senderId: this.oid(id),
      recipients: recipientsOid,
      subject,
      body: text,
      attachmentSizeBytes: att,
      totalSizeBytes: totalSize,
      isDraft: false,
    });

    const msgId = msg._id as Types.ObjectId;

    await this.stateModel.create({
      messageId: msgId,
      userRole: ur,
      userId: this.oid(id),
      folder: 'sent',
      readAt: new Date(),
      isOutgoing: true,
    });

    const recipientStates: { role: 'patient' | 'doctor' | 'nurse'; id: string; stateId: string }[] = [];
    for (const r of recipients) {
      const st = await this.stateModel.create({
        messageId: msgId,
        userRole: r.role,
        userId: this.oid(r.id),
        folder: 'inbox',
        readAt: null,
        isOutgoing: false,
      });
      recipientStates.push({
        role: r.role as 'patient' | 'doctor' | 'nurse',
        id: r.id,
        stateId: String(st._id),
      });
    }

    this.scheduleMirrorToRecipients(recipients, subject, text, ur, id);
    void this.notifyRecipientsNewMail(recipientStates, msgId, subject, ur, id);

    return { id: String(msgId), message: msg };
  }

  /** Brouillon — uniquement le propriétaire. */
  async saveDraft(
    user: JwtUser,
    body: { subject?: string; body?: string; to?: MailPeer[]; attachmentSizeBytes?: number },
  ) {
    const ur = String(user.role);
    const id = uid(user);
    if (!['patient', 'doctor', 'nurse'].includes(ur)) throw new ForbiddenException();

    const subject = String(body.subject || '').slice(0, 500);
    const text = String(body.body || '');
    const att = Math.max(0, Number(body.attachmentSizeBytes) || 0);
    const totalSize = computeTotalSize(subject, text, att);
    await this.assertQuotaOk(user, totalSize);

    const recipientsOid = (body.to || []).map((r) => ({
      role: r.role,
      id: this.oid(r.id),
    }));

    const msg = await this.messageModel.create({
      senderRole: ur as 'patient' | 'doctor' | 'nurse',
      senderId: this.oid(id),
      recipients: recipientsOid,
      subject,
      body: text,
      attachmentSizeBytes: att,
      totalSizeBytes: totalSize,
      isDraft: true,
    });

    await this.stateModel.create({
      messageId: msg._id as Types.ObjectId,
      userRole: ur,
      userId: this.oid(id),
      folder: 'drafts',
      readAt: new Date(),
      isOutgoing: false,
    });

    return { id: String(msg._id), message: msg };
  }

  /** Lecture d’un brouillon pour l’éditeur (propriétaire uniquement). */
  async getDraft(user: JwtUser, messageId: string) {
    const ur = String(user.role);
    const id = uid(user);
    const mid = this.oid(messageId);
    const msg = await this.messageModel.findById(mid).exec();
    if (!msg || !msg.isDraft) throw new NotFoundException('Brouillon introuvable');
    if (String(msg.senderId) !== id || msg.senderRole !== ur) {
      throw new ForbiddenException();
    }
    const st = await this.stateModel
      .findOne({
        messageId: mid,
        userRole: ur,
        userId: this.oid(id),
        folder: 'drafts',
      })
      .select('_id')
      .lean()
      .exec();
    return {
      messageId: String(msg._id),
      stateId: st ? String((st as { _id: Types.ObjectId })._id) : '',
      subject: msg.subject || '',
      body: msg.body || '',
      attachmentSizeBytes: msg.attachmentSizeBytes || 0,
      recipients: (msg.recipients || []).map((r) => ({
        role: r.role as MailPeer['role'],
        id: String(r.id),
      })),
    };
  }

  /** Mise à jour d’un brouillon existant. */
  async updateDraft(
    user: JwtUser,
    messageId: string,
    body: { subject?: string; body?: string; to?: MailPeer[]; attachmentSizeBytes?: number },
  ) {
    const ur = String(user.role);
    const id = uid(user);
    const mid = this.oid(messageId);
    const msg = await this.messageModel.findById(mid).exec();
    if (!msg || !msg.isDraft) throw new NotFoundException('Brouillon introuvable');
    if (String(msg.senderId) !== id || msg.senderRole !== ur) {
      throw new ForbiddenException();
    }

    const subject = String(body.subject !== undefined ? body.subject : msg.subject || '').slice(0, 500);
    const text = String(body.body !== undefined ? body.body : msg.body || '');
    const att = Math.max(
      0,
      body.attachmentSizeBytes !== undefined
        ? Number(body.attachmentSizeBytes) || 0
        : msg.attachmentSizeBytes || 0,
    );
    const totalSize = computeTotalSize(subject, text, att);
    const oldSize = msg.totalSizeBytes || 0;
    await this.assertQuotaOk(user, totalSize - oldSize);

    let recipientsOid: { role: 'patient' | 'doctor' | 'nurse'; id: Types.ObjectId }[];
    if (body.to !== undefined) {
      recipientsOid = (body.to || []).map((r) => ({
        role: r.role as 'patient' | 'doctor' | 'nurse',
        id: this.oid(r.id),
      }));
    } else {
      recipientsOid = (msg.recipients || []).map((r) => ({
        role: r.role as 'patient' | 'doctor' | 'nurse',
        id: r.id as Types.ObjectId,
      }));
    }

    msg.subject = subject;
    msg.body = text;
    msg.recipients = recipientsOid;
    msg.attachmentSizeBytes = att;
    msg.totalSizeBytes = totalSize;
    await msg.save();
    return { id: String(msg._id), message: msg };
  }

  /** Envoie un brouillon existant (vérifie politique). */
  async sendDraft(user: JwtUser, draftMessageId: string) {
    const ur = String(user.role);
    const id = uid(user);
    const mid = this.oid(draftMessageId);

    const msg = await this.messageModel.findById(mid).exec();
    if (!msg || !msg.isDraft) throw new NotFoundException('Brouillon introuvable');
    if (String(msg.senderId) !== id || msg.senderRole !== ur) {
      throw new ForbiddenException();
    }

    const recipients = (msg.recipients || []).map((r) => ({
      role: r.role as MailPeer['role'],
      id: String(r.id),
    }));
    if (!recipients.length) throw new BadRequestException('Ajoutez au moins un destinataire');

    await this.policy.assertCanSend(ur, id, recipients);
    await this.assertQuotaOk(user, 0);

    await this.stateModel.deleteMany({ messageId: mid, userId: this.oid(id), userRole: ur });

    msg.isDraft = false;
    await msg.save();

    await this.stateModel.create({
      messageId: mid,
      userRole: ur,
      userId: this.oid(id),
      folder: 'sent',
      readAt: new Date(),
      isOutgoing: true,
    });

    const recipientStates: { role: 'patient' | 'doctor' | 'nurse'; id: string; stateId: string }[] = [];
    for (const r of msg.recipients) {
      const st = await this.stateModel.create({
        messageId: mid,
        userRole: r.role,
        userId: r.id as Types.ObjectId,
        folder: 'inbox',
        readAt: null,
        isOutgoing: false,
      });
      recipientStates.push({
        role: r.role as 'patient' | 'doctor' | 'nurse',
        id: String(r.id),
        stateId: String(st._id),
      });
    }

    this.scheduleMirrorToRecipients(
      recipients,
      String(msg.subject || ''),
      String(msg.body || ''),
      ur,
      id,
    );
    void this.notifyRecipientsNewMail(
      recipientStates,
      mid,
      String(msg.subject || ''),
      ur,
      id,
    );

    return { id: String(mid), ok: true };
  }

  async listMessages(
    user: JwtUser,
    q: {
      folder?: string;
      starred?: boolean;
      page?: number;
      limit?: number;
    },
  ) {
    const ur = String(user.role);
    const id = uid(user);
    const { userRole, userId } = this.userKey(ur, id);

    const page = Math.max(1, q.page || 1);
    const limit = Math.min(100, Math.max(1, q.limit || 30));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userRole, userId };

    if (q.starred === true || q.folder === 'starred') {
      filter.starred = true;
    } else {
      filter.folder = q.folder && q.folder !== 'starred' ? q.folder : 'inbox';
    }

    const [rows, total] = await Promise.all([
      this.stateModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('messageId')
        .lean()
        .exec(),
      this.stateModel.countDocuments(filter),
    ]);

    const items = await Promise.all(rows.map((r: any) => this.serializeStateEnriched(r)));
    return {
      page,
      limit,
      total,
      items,
    };
  }

  private serializeState(r: any) {
    const m = r.messageId;
    return {
      stateId: String(r._id),
      messageId: m ? String(m._id) : String(r.messageId),
      folder: r.folder,
      readAt: r.readAt,
      starred: r.starred,
      snoozedUntil: r.snoozedUntil,
      labelIds: (r.labelIds || []).map((x: Types.ObjectId) => String(x)),
      isOutgoing: r.isOutgoing,
      isDraft: !!m?.isDraft,
      subject: m?.subject ?? '',
      body: m?.body ?? '',
      senderRole: m?.senderRole,
      senderId: m?.senderId ? String(m.senderId) : '',
      recipients: (m?.recipients || []).map((x: any) => ({ role: x.role, id: String(x.id) })),
      createdAt: m?.createdAt ?? r.createdAt,
    };
  }

  private async serializeStateEnriched(r: any) {
    const base = this.serializeState(r);
    const m = r.messageId;
    const senderDisplay = await this.lookupPersonName(m?.senderRole, m?.senderId);
    const toPreview = await this.firstRecipientsLabel(m?.recipients || []);
    return {
      ...base,
      senderDisplay,
      listTitle: base.isOutgoing ? toPreview : senderDisplay,
      preview: (base.body || '').replace(/\s+/g, ' ').trim().slice(0, 140),
    };
  }

  private async lookupPersonName(role?: string, id?: string): Promise<string> {
    if (!role || !id) return '';
    const sid = String(id);
    if (role === 'doctor') {
      const d = await this.doctorModel.findById(sid).select('firstName lastName email').lean().exec();
      if (!d) return sid;
      const n = `${(d as any).firstName || ''} ${(d as any).lastName || ''}`.trim();
      return n || (d as any).email || sid;
    }
    if (role === 'nurse') {
      const n = await this.nurseModel.findById(sid).select('firstName lastName email').lean().exec();
      if (!n) return sid;
      const name = `${(n as any).firstName || ''} ${(n as any).lastName || ''}`.trim();
      return name || (n as any).email || sid;
    }
    if (role === 'patient') {
      const p = await this.patientModel.findById(sid).select('firstName lastName email').lean().exec();
      if (!p) return sid;
      const name = `${(p as any).firstName || ''} ${(p as any).lastName || ''}`.trim();
      return name || (p as any).email || sid;
    }
    return sid;
  }

  private async firstRecipientsLabel(recipients: { role: string; id: Types.ObjectId }[]): Promise<string> {
    if (!recipients.length) return '';
    const r0 = recipients[0];
    const name = await this.lookupPersonName(r0.role, String(r0.id));
    if (recipients.length === 1) return name;
    return `${name} (+${recipients.length - 1})`;
  }

  async getMessage(user: JwtUser, stateId: string) {
    const ur = String(user.role);
    const id = uid(user);
    const st = await this.stateModel
      .findById(this.oid(stateId))
      .populate('messageId')
      .exec();
    if (!st) throw new NotFoundException();
    if (st.userRole !== ur || String(st.userId) !== id) throw new ForbiddenException();
    return this.serializeStateEnriched(st.toObject() as any);
  }

  async markRead(user: JwtUser, stateId: string, read = true) {
    const st = await this.stateModel.findById(this.oid(stateId)).exec();
    if (!st) throw new NotFoundException();
    this.assertOwner(st, user);
    st.readAt = read ? new Date() : null;
    await st.save();
    return { ok: true };
  }

  async moveFolder(user: JwtUser, stateId: string, folder: MailFolder) {
    const allowed: MailFolder[] = [
      'inbox',
      'sent',
      'drafts',
      'trash',
      'spam',
      'snoozed',
      'important',
    ];
    if (!allowed.includes(folder)) throw new BadRequestException('Dossier invalide');
    const st = await this.stateModel.findById(this.oid(stateId)).exec();
    if (!st) throw new NotFoundException();
    this.assertOwner(st, user);
    const msg = await this.messageModel.findById(st.messageId).exec();
    if (!msg) throw new NotFoundException();

    if (msg.isDraft) {
      if (folder !== 'drafts' && folder !== 'trash') {
        throw new BadRequestException(
          'Brouillon : déplacez uniquement vers la corbeille ou conservez dans Brouillons (utilisez Envoyer pour expédier).',
        );
      }
    } else {
      if (folder === 'drafts') {
        throw new BadRequestException('Impossible de déplacer vers les brouillons');
      }
      if (st.isOutgoing) {
        if (String(folder) === 'inbox' || String(folder) === 'drafts') {
          throw new BadRequestException('Les messages envoyés ne vont pas dans la boîte de réception');
        }
      } else {
        if (folder === 'sent') {
          throw new BadRequestException('Seuls les messages que vous avez envoyés sont dans Envoyés');
        }
      }
    }

    st.folder = folder;
    if (folder !== 'snoozed') st.snoozedUntil = null;
    await st.save();
    return { ok: true };
  }

  /**
   * Suppression : brouillon → efface le message ; sinon depuis corbeille/indésirables → définitif ;
   * sinon → déplace vers la corbeille.
   */
  async deleteMessage(user: JwtUser, stateId: string) {
    const st = await this.stateModel.findById(this.oid(stateId)).exec();
    if (!st) throw new NotFoundException();
    this.assertOwner(st, user);
    const msg = await this.messageModel.findById(st.messageId).exec();
    if (!msg) throw new NotFoundException();

    if (msg.isDraft && st.folder === 'drafts') {
      await this.stateModel.deleteOne({ _id: st._id });
      await this.messageModel.deleteOne({ _id: msg._id });
      return { ok: true, mode: 'draft_deleted' as const };
    }

    if (st.folder === 'trash' || st.folder === 'spam') {
      await this.removeStateAndMaybeMessage(st);
      return { ok: true, mode: 'permanent' as const };
    }

    st.folder = 'trash';
    st.snoozedUntil = null;
    await st.save();
    return { ok: true, mode: 'to_trash' as const };
  }

  /** Vide la corbeille (suppression définitive côté utilisateur, message partagé conservé si d’autres états existent). */
  async emptyTrash(user: JwtUser) {
    const { userRole, userId } = this.userKey(String(user.role), uid(user));
    const trashStates = await this.stateModel
      .find({ userRole, userId, folder: 'trash' })
      .exec();
    for (const s of trashStates) {
      await this.removeStateAndMaybeMessage(s);
    }
    return { ok: true, removed: trashStates.length };
  }

  private async removeStateAndMaybeMessage(st: MailUserState): Promise<void> {
    const mid = st.messageId;
    await this.stateModel.deleteOne({ _id: st._id });
    const remaining = await this.stateModel.countDocuments({ messageId: mid });
    if (remaining === 0) {
      await this.messageModel.deleteOne({ _id: mid });
    }
  }

  async setStar(user: JwtUser, stateId: string, starred: boolean) {
    const st = await this.stateModel.findById(this.oid(stateId)).exec();
    if (!st) throw new NotFoundException();
    this.assertOwner(st, user);
    st.starred = starred;
    await st.save();
    return { ok: true };
  }

  async snooze(user: JwtUser, stateId: string, until: Date | null) {
    const st = await this.stateModel.findById(this.oid(stateId)).exec();
    if (!st) throw new NotFoundException();
    this.assertOwner(st, user);
    st.snoozedUntil = until;
    if (until) st.folder = 'snoozed';
    await st.save();
    return { ok: true };
  }

  private assertOwner(st: MailUserState, user: JwtUser) {
    if (st.userRole !== user.role || String(st.userId) !== uid(user)) {
      throw new ForbiddenException();
    }
  }

  async listLabels(user: JwtUser) {
    const { userRole, userId } = this.userKey(String(user.role), uid(user));
    return this.labelModel.find({ ownerRole: userRole, ownerId: userId }).sort({ name: 1 }).lean().exec();
  }

  async createLabel(user: JwtUser, body: { name: string; color?: string }) {
    const name = String(body.name || '').trim().slice(0, 80);
    if (!name) throw new BadRequestException('Nom requis');
    const { userRole, userId } = this.userKey(String(user.role), uid(user));
    try {
      const doc = await this.labelModel.create({
        ownerRole: userRole,
        ownerId: userId,
        name,
        color: String(body.color || '#6c757d').slice(0, 32),
      });
      return doc.toObject();
    } catch (e: any) {
      if (e?.code === 11000) throw new BadRequestException('Étiquette déjà existante');
      throw e;
    }
  }

  async deleteLabel(user: JwtUser, labelId: string) {
    const { userRole, userId } = this.userKey(String(user.role), uid(user));
    const res = await this.labelModel.deleteOne({
      _id: this.oid(labelId),
      ownerRole: userRole,
      ownerId: userId,
    });
    if (!res.deletedCount) throw new NotFoundException();
    const lid = this.oid(labelId);
    await this.stateModel.updateMany(
      { userRole, userId, labelIds: lid },
      { $pull: { labelIds: lid } },
    );
    return { ok: true };
  }

  async addLabelToMessage(user: JwtUser, stateId: string, labelId: string) {
    const st = await this.stateModel.findById(this.oid(stateId)).exec();
    if (!st) throw new NotFoundException();
    this.assertOwner(st, user);
    const { userRole, userId } = this.userKey(String(user.role), uid(user));
    const lab = await this.labelModel
      .findOne({ _id: this.oid(labelId), ownerRole: userRole, ownerId: userId })
      .exec();
    if (!lab) throw new NotFoundException('Étiquette introuvable');
    await this.stateModel.updateOne(
      { _id: st._id },
      { $addToSet: { labelIds: this.oid(labelId) } },
    );
    return { ok: true };
  }

  async removeLabelFromMessage(user: JwtUser, stateId: string, labelId: string) {
    const st = await this.stateModel.findById(this.oid(stateId)).exec();
    if (!st) throw new NotFoundException();
    this.assertOwner(st, user);
    await this.stateModel.updateOne(
      { _id: st._id },
      { $pull: { labelIds: this.oid(labelId) } },
    );
    return { ok: true };
  }

  /** Contacts autorisés pour composer (UI destinataires). */
  async getAllowedRecipients(user: JwtUser) {
    const ur = String(user.role);
    const id = uid(user);
    if (ur === 'admin' || ur === 'superadmin') {
      return { peers: [], doctors: [], nurses: [], patients: [] };
    }
    if (ur === 'patient') {
      const p = await this.patientModel.findById(this.oid(id)).select('doctorId nurseId').lean().exec();
      if (!p) throw new NotFoundException();
      const peers: { role: 'doctor' | 'nurse'; id: string; displayName: string; email?: string }[] = [];
      if ((p as any).doctorId) {
        const did = String((p as any).doctorId);
        const d = await this.doctorModel.findById(did).select('firstName lastName email').lean().exec();
        const full = d ? `${(d as any).firstName || ''} ${(d as any).lastName || ''}`.trim() : '';
        peers.push({
          role: 'doctor',
          id: did,
          displayName: full ? `Dr. ${full}` : (d as any)?.email || 'Médecin',
          email: (d as any)?.email,
        });
      }
      if ((p as any).nurseId) {
        const nid = String((p as any).nurseId);
        const n = await this.nurseModel.findById(nid).select('firstName lastName email').lean().exec();
        const full = n ? `${(n as any).firstName || ''} ${(n as any).lastName || ''}`.trim() : '';
        peers.push({
          role: 'nurse',
          id: nid,
          displayName: full ? `IDE ${full}` : (n as any)?.email || 'Infirmier(ère)',
          email: (n as any)?.email,
        });
      }
      return { peers };
    }
    if (ur === 'doctor') {
      const doctors = await this.doctorModel.find().select('_id firstName lastName email').lean().exec();
      const nurses = await this.nurseModel.find().select('_id firstName lastName email').lean().exec();
      const patients = await this.patientModel.find({ doctorId: id }).select('_id firstName lastName email').lean().exec();
      return {
        doctors: doctors.map((d: any) => ({ id: String(d._id), ...d })),
        nurses: nurses.map((n: any) => ({ id: String(n._id), ...n })),
        patients: patients.map((p: any) => ({ id: String(p._id), ...p })),
      };
    }
    if (ur === 'nurse') {
      const myDept = await this.policy.deptOfNurse(id);
      const doctors = await this.doctorModel.find().select('_id firstName lastName email department').lean().exec();
      const nurses = await this.nurseModel.find().select('_id firstName lastName email department').lean().exec();
      const patients = await this.patientModel.find({ nurseId: id }).select('_id firstName lastName email').lean().exec();
      return {
        department: myDept,
        doctors: doctors.filter((d: any) => normDept(d.department) === myDept).map((d: any) => ({ id: String(d._id), ...d })),
        nurses: nurses.filter((n: any) => normDept(n.department) === myDept).map((n: any) => ({ id: String(n._id), ...n })),
        patients: patients.map((p: any) => ({ id: String(p._id), ...p })),
      };
    }
    throw new ForbiddenException();
  }
}
