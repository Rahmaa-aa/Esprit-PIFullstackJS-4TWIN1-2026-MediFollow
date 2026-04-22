import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QuestionnaireTemplate } from './schemas/questionnaire-template.schema';
import { ProtocolTemplate } from './schemas/protocol-template.schema';
import { PatientProtocolAssignment } from './schemas/patient-protocol-assignment.schema';
import { QuestionnaireAddon } from './schemas/questionnaire-addon.schema';
import { QuestionnaireSubmission } from './schemas/questionnaire-submission.schema';
import { Patient } from '../patient/schemas/patient.schema';

export function addDaysYmd(dischargeYmd: string, dayOffset: number): string {
  const raw = String(dischargeYmd || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new BadRequestException({ message: 'Date de sortie invalide (YYYY-MM-DD).', code: 'INVALID_DATE' });
  }
  const [y, m, d] = raw.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + dayOffset);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

function todayYmdUtc(): string {
  const t = new Date();
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectModel(QuestionnaireTemplate.name) private tmplModel: Model<QuestionnaireTemplate>,
    @InjectModel(ProtocolTemplate.name) private protoModel: Model<ProtocolTemplate>,
    @InjectModel(PatientProtocolAssignment.name) private assignModel: Model<PatientProtocolAssignment>,
    @InjectModel(QuestionnaireAddon.name) private addonModel: Model<QuestionnaireAddon>,
    @InjectModel(QuestionnaireSubmission.name) private subModel: Model<QuestionnaireSubmission>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
  ) {}

  private toOid(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Identifiant invalide');
    return new Types.ObjectId(id);
  }

  // ─── Admin : templates ───────────────────────────────────────────────────
  async adminListTemplates() {
    return this.tmplModel.find().sort({ department: 1, title: 1 }).lean().exec();
  }

  async adminCreateTemplate(body: { title: string; department: string; description?: string; questions?: unknown[] }) {
    const department = String(body.department || '').trim();
    if (!department) throw new BadRequestException('Département requis');
    const questions = this.normalizeQuestions(body.questions);
    return this.tmplModel.create({
      title: String(body.title || '').trim() || 'Questionnaire',
      department,
      description: body.description,
      questions,
      isActive: true,
    });
  }

  async adminUpdateTemplate(id: string, body: Partial<{ title: string; department: string; description: string; questions: unknown[]; isActive: boolean }>) {
    const doc = await this.tmplModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Questionnaire introuvable');
    if (body.title != null) doc.title = String(body.title).trim();
    if (body.department != null) doc.department = String(body.department).trim();
    if (body.description !== undefined) doc.description = body.description;
    if (body.isActive !== undefined) doc.isActive = !!body.isActive;
    if (body.questions != null) doc.questions = this.normalizeQuestions(body.questions);
    await doc.save();
    return doc;
  }

  async adminDeleteTemplate(id: string) {
    const r = await this.tmplModel.findByIdAndDelete(id).exec();
    if (!r) throw new NotFoundException();
    return { ok: true };
  }

  private normalizeQuestions(
    raw: unknown,
  ): {
    qid: string;
    label: string;
    type: 'yes_no' | 'scale_10' | 'text' | 'multiple_choice';
    order: number;
    options?: string[];
  }[] {
    if (!Array.isArray(raw) || raw.length === 0) {
      return [
        { qid: 'q1', label: 'Comment évaluez-vous votre état général ?', type: 'scale_10' as const, order: 0 },
        { qid: 'q2', label: 'Avez-vous une douleur importante ?', type: 'yes_no' as const, order: 1 },
      ];
    }
    return raw.map((q: any, i: number) => {
      const type = ['yes_no', 'scale_10', 'text', 'multiple_choice'].includes(q.type) ? q.type : 'text';
      let options: string[] | undefined;
      if (type === 'multiple_choice') {
        const rawOpts = q.options;
        const list = Array.isArray(rawOpts)
          ? rawOpts.map((x: unknown) => String(x ?? '').trim()).filter(Boolean)
          : String(rawOpts || '')
              .split(/\r?\n/)
              .map((s) => s.trim())
              .filter(Boolean);
        options = list.length >= 2 ? list : ['Option A', 'Option B'];
      }
      const row: {
        qid: string;
        label: string;
        type: 'yes_no' | 'scale_10' | 'text' | 'multiple_choice';
        order: number;
        options?: string[];
      } = {
        qid: String(q.qid || `q${i + 1}`),
        label: String(q.label || 'Question'),
        type,
        order: typeof q.order === 'number' ? q.order : i,
      };
      if (options) row.options = options;
      return row;
    });
  }

  // ─── Admin : protocols ───────────────────────────────────────────────────
  async adminListProtocols() {
    return this.protoModel.find().sort({ department: 1, name: 1 }).lean().exec();
  }

  async adminCreateProtocol(body: { name: string; department: string; description?: string; milestones?: { dayOffset: number; questionnaireTemplateId: string }[] }) {
    const department = String(body.department || '').trim();
    if (!department) throw new BadRequestException('Département requis');
    const milestones = await this.normalizeMilestones(body.milestones);
    return this.protoModel.create({
      name: String(body.name || '').trim() || 'Protocole',
      department,
      description: body.description,
      milestones,
      isActive: true,
    });
  }

  async adminUpdateProtocol(
    id: string,
    body: Partial<{
      name: string;
      department: string;
      description: string;
      milestones: { dayOffset: number; questionnaireTemplateId: string }[];
      isActive: boolean;
    }>,
  ) {
    const doc = await this.protoModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Protocole introuvable');
    if (body.name != null) doc.name = String(body.name).trim();
    if (body.department != null) doc.department = String(body.department).trim();
    if (body.description !== undefined) doc.description = body.description;
    if (body.isActive !== undefined) doc.isActive = !!body.isActive;
    if (body.milestones != null) doc.milestones = await this.normalizeMilestones(body.milestones);
    await doc.save();
    return doc;
  }

  async adminDeleteProtocol(id: string) {
    const r = await this.protoModel.findByIdAndDelete(id).exec();
    if (!r) throw new NotFoundException();
    return { ok: true };
  }

  private async normalizeMilestones(raw: unknown) {
    if (!Array.isArray(raw) || raw.length === 0) {
      throw new BadRequestException({ message: 'Définissez au moins un jalon avec un questionnaire.', code: 'MILESTONES_REQUIRED' });
    }
    const out: { dayOffset: number; questionnaireTemplateId: Types.ObjectId }[] = [];
    for (const m of raw as any[]) {
      const dayOffset = Number(m.dayOffset);
      if (!Number.isFinite(dayOffset) || dayOffset < 0) continue;
      const tid = String(m.questionnaireTemplateId || '').trim();
      if (!Types.ObjectId.isValid(tid)) continue;
      out.push({ dayOffset, questionnaireTemplateId: new Types.ObjectId(tid) });
    }
    if (!out.length) throw new BadRequestException('Jalons invalides');
    return out;
  }

  // ─── Doctor ───────────────────────────────────────────────────────────────
  private async assertDoctorOwnsPatient(doctorId: string, patientId: Types.ObjectId) {
    const p = await this.patientModel.findById(patientId).select('doctorId').lean().exec();
    if (!p) throw new NotFoundException('Patient introuvable');
    if (String((p as any).doctorId || '') !== String(doctorId)) {
      throw new ForbiddenException('Ce patient n’est pas dans votre liste.');
    }
  }

  async doctorAssignProtocol(doctorId: string, body: { patientId: string; protocolTemplateId: string; dischargeDate: string }) {
    const patientId = this.toOid(body.patientId);
    await this.assertDoctorOwnsPatient(doctorId, patientId);

    const proto = await this.protoModel.findById(body.protocolTemplateId).exec();
    if (!proto || !proto.isActive) throw new NotFoundException('Protocole introuvable ou inactif');

    const dischargeDate = String(body.dischargeDate || '').slice(0, 10);
    addDaysYmd(dischargeDate, 0);

    const p = await this.patientModel.findById(patientId).select('department service').lean().exec();
    const dept = String((p as any)?.department || (p as any)?.service || '').trim();
    if (dept && String(proto.department).trim() !== dept) {
      throw new BadRequestException({
        message: `Le protocole est pour « ${proto.department} » ; le patient est rattaché à « ${dept || '—'} ».`,
        code: 'DEPARTMENT_MISMATCH',
      });
    }

    await this.assignModel.updateMany({ patientId, isActive: true }, { $set: { isActive: false } }).exec();

    const milestones = [];
    for (const m of proto.milestones || []) {
      const tid = m.questionnaireTemplateId;
      const t = await this.tmplModel.findById(tid).exec();
      if (!t || !t.isActive) continue;
      const dueDate = addDaysYmd(dischargeDate, m.dayOffset);
      milestones.push({
        dayOffset: m.dayOffset,
        questionnaireTemplateId: tid,
        dueDate,
        status: 'pending',
      });
    }
    if (!milestones.length) throw new BadRequestException('Aucun jalon valide dans ce protocole');

    return this.assignModel.create({
      patientId,
      doctorId: String(doctorId),
      protocolTemplateId: proto._id,
      dischargeDate,
      milestones,
      isActive: true,
    });
  }

  async doctorAddAddon(
    doctorId: string,
    body: { patientId: string; questionnaireTemplateId: string; dueDate?: string },
  ) {
    const patientId = this.toOid(body.patientId);
    await this.assertDoctorOwnsPatient(doctorId, patientId);

    const t = await this.tmplModel.findById(body.questionnaireTemplateId).exec();
    if (!t || !t.isActive) throw new NotFoundException('Questionnaire introuvable');

    let dueDate = String(body.dueDate || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) dueDate = todayYmdUtc();

    return this.addonModel.create({
      patientId,
      doctorId: String(doctorId),
      questionnaireTemplateId: t._id,
      dueDate,
      status: 'pending',
    });
  }

  async doctorPatientSummary(doctorId: string, patientId: string): Promise<Record<string, unknown>> {
    const pid = this.toOid(patientId);
    await this.assertDoctorOwnsPatient(doctorId, pid);

    const assignment = await this.assignModel
      .findOne({ patientId: pid, isActive: true })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const addons = await this.addonModel.find({ patientId: pid }).sort({ dueDate: 1 }).lean().exec();

    const enrichMilestones = async (ms: any[]) => {
      const out = [];
      for (const m of ms || []) {
        const qt = await this.tmplModel.findById(m.questionnaireTemplateId).select('title').lean().exec();
        out.push({
          ...m,
          questionnaireTemplateId: String(m.questionnaireTemplateId),
          questionnaireTitle: qt ? (qt as any).title : '',
          submissionId: m.submissionId ? String(m.submissionId) : null,
        });
      }
      return out;
    };

    let milestones: any[] = [];
    if (assignment?.milestones) milestones = await enrichMilestones(assignment.milestones);

    const addonEnriched = [];
    for (const a of addons) {
      const qt = await this.tmplModel.findById(a.questionnaireTemplateId).select('title').lean().exec();
      addonEnriched.push({
        ...a,
        _id: String(a._id),
        questionnaireTemplateId: String(a.questionnaireTemplateId),
        questionnaireTitle: qt ? (qt as any).title : '',
        submissionId: a.submissionId ? String(a.submissionId) : null,
      });
    }

    return {
      assignment: assignment
        ? {
            ...assignment,
            _id: String(assignment._id),
            patientId: String(assignment.patientId),
            protocolTemplateId: String(assignment.protocolTemplateId),
            milestones,
          }
        : null,
      addons: addonEnriched,
    };
  }

  /** Détail des réponses d’une soumission (médecin référent du patient uniquement). */
  async doctorGetSubmissionDetail(
    doctorId: string,
    patientId: string,
    submissionId: string,
  ): Promise<Record<string, unknown>> {
    const pid = this.toOid(patientId);
    await this.assertDoctorOwnsPatient(doctorId, pid);
    if (!Types.ObjectId.isValid(submissionId)) throw new BadRequestException('Identifiant invalide');
    const sub = await this.subModel.findById(submissionId).lean().exec();
    if (!sub) throw new NotFoundException('Réponse introuvable');
    if (String((sub as any).patientId) !== String(pid)) throw new ForbiddenException();

    const tmpl = await this.tmplModel.findById((sub as any).questionnaireTemplateId).lean().exec();
    const title = tmpl ? String((tmpl as any).title || '') : '';
    const questions: { qid: string; label: string; type: string }[] = ((tmpl as any)?.questions || []).slice();
    const qMap = new Map(questions.map((q) => [q.qid, q]));

    const rows = ((sub as any).answers || []).map((a: { questionId: string; value: unknown }) => {
      const meta = qMap.get(a.questionId);
      const t = meta?.type || 'text';
      return {
        questionId: a.questionId,
        label: meta?.label || a.questionId,
        type: t,
        displayValue: this.formatAnswerForDoctor(a.value, t),
      };
    });

    return {
      questionnaireTitle: title,
      submittedAt: (sub as any).createdAt,
      rows,
    };
  }

  private formatAnswerForDoctor(value: unknown, type: string): string {
    if (type === 'yes_no') {
      if (value === true) return 'Oui';
      if (value === false) return 'Non';
    }
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
  }

  /** Protocoles du département du patient (pour liste déroulante médecin). */
  async doctorProtocolsForPatientDepartment(doctorId: string, patientId: string) {
    const pid = this.toOid(patientId);
    await this.assertDoctorOwnsPatient(doctorId, pid);
    const p = await this.patientModel.findById(pid).select('department service').lean().exec();
    const dept = String((p as any)?.department || (p as any)?.service || '').trim();
    if (!dept) return [];
    return this.protoModel.find({ department: dept, isActive: true }).sort({ name: 1 }).lean().exec();
  }

  async doctorTemplatesForPatientDepartment(doctorId: string, patientId: string) {
    const pid = this.toOid(patientId);
    await this.assertDoctorOwnsPatient(doctorId, pid);
    const p = await this.patientModel.findById(pid).select('department service').lean().exec();
    const dept = String((p as any)?.department || (p as any)?.service || '').trim();
    if (!dept) return [];
    return this.tmplModel.find({ department: dept, isActive: true }).sort({ title: 1 }).lean().exec();
  }

  // ─── Patient ──────────────────────────────────────────────────────────────
  private async assertPatientSelf(patientUserId: string, patientId: Types.ObjectId) {
    if (String(patientId) !== String(patientUserId)) {
      throw new ForbiddenException();
    }
  }

  async patientPending(patientUserId: string) {
    const pid = this.toOid(patientUserId);
    await this.assertPatientSelf(patientUserId, pid);
    const today = todayYmdUtc();

    const assignment = await this.assignModel.findOne({ patientId: pid, isActive: true }).lean().exec();
    const protocolItems: any[] = [];
    if (assignment?.milestones) {
      for (const m of assignment.milestones) {
        if (m.status !== 'pending') continue;
        if (m.dueDate > today) continue;
        const t = await this.tmplModel.findById(m.questionnaireTemplateId).lean().exec();
        if (!t) continue;
        protocolItems.push({
          kind: 'protocol' as const,
          assignmentId: String(assignment._id),
          dayOffset: m.dayOffset,
          dueDate: m.dueDate,
          questionnaire: this.serializeTemplate(t),
        });
      }
    }

    const addons = await this.addonModel.find({ patientId: pid, status: 'pending', dueDate: { $lte: today } }).lean().exec();
    const addonItems: any[] = [];
    for (const a of addons) {
      const t = await this.tmplModel.findById(a.questionnaireTemplateId).lean().exec();
      if (!t) continue;
      addonItems.push({
        kind: 'addon' as const,
        addonId: String(a._id),
        dueDate: a.dueDate,
        questionnaire: this.serializeTemplate(t),
      });
    }

    return { protocol: protocolItems, addons: addonItems };
  }

  private serializeTemplate(t: any) {
    return {
      id: String(t._id),
      title: t.title,
      description: t.description,
      questions: (t.questions || []).slice().sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
    };
  }

  async patientSubmit(
    patientUserId: string,
    body: {
      questionnaireTemplateId: string;
      assignmentId?: string;
      dayOffset?: number;
      addonId?: string;
      answers: { questionId: string; value: unknown }[];
    },
  ) {
    const pid = this.toOid(patientUserId);
    await this.assertPatientSelf(patientUserId, pid);

    const tmpl = await this.tmplModel.findById(body.questionnaireTemplateId).exec();
    if (!tmpl) throw new NotFoundException('Questionnaire introuvable');

    const allowed = new Set((tmpl.questions || []).map((q) => q.qid));
    const answers = (body.answers || []).filter((a) => allowed.has(a.questionId));

    if (body.addonId) {
      const addon = await this.addonModel.findById(body.addonId).exec();
      if (!addon || String(addon.patientId) !== String(pid)) throw new ForbiddenException();
      if (addon.status !== 'pending') throw new BadRequestException('Déjà complété');
      if (String(addon.questionnaireTemplateId) !== String(tmpl._id)) throw new BadRequestException('Questionnaire incorrect');

      const sub = await this.subModel.create({
        patientId: pid,
        questionnaireTemplateId: tmpl._id,
        addonId: addon._id,
        answers,
      });
      addon.status = 'completed';
      addon.submissionId = sub._id as Types.ObjectId;
      await addon.save();
      return { ok: true, submissionId: String(sub._id) };
    }

    if (body.assignmentId != null && body.dayOffset != null) {
      const ass = await this.assignModel.findById(body.assignmentId).exec();
      if (!ass || String(ass.patientId) !== String(pid)) throw new ForbiddenException();
      const m = (ass.milestones || []).find((x) => x.dayOffset === Number(body.dayOffset));
      if (!m) throw new BadRequestException('Jalon introuvable');
      if (m.status !== 'pending') throw new BadRequestException('Déjà complété');
      if (String(m.questionnaireTemplateId) !== String(tmpl._id)) throw new BadRequestException('Questionnaire incorrect');

      const sub = await this.subModel.create({
        patientId: pid,
        questionnaireTemplateId: tmpl._id,
        assignmentId: ass._id,
        milestoneDayOffset: m.dayOffset,
        answers,
      });
      m.status = 'completed';
      m.submissionId = sub._id as Types.ObjectId;
      await ass.save();
      return { ok: true, submissionId: String(sub._id) };
    }

    throw new BadRequestException('Indiquez assignmentId+jour ou addonId');
  }

  async patientSchedule(patientUserId: string) {
    const pid = this.toOid(patientUserId);
    await this.assertPatientSelf(patientUserId, pid);

    const assignment = await this.assignModel.findOne({ patientId: pid, isActive: true }).lean().exec();
    const addons = await this.addonModel.find({ patientId: pid }).sort({ dueDate: 1 }).lean().exec();

    const milestones = [];
    if (assignment?.milestones) {
      for (const m of assignment.milestones) {
        const t = await this.tmplModel.findById(m.questionnaireTemplateId).select('title').lean().exec();
        milestones.push({
          dayOffset: m.dayOffset,
          dueDate: m.dueDate,
          status: m.status,
          title: t ? (t as any).title : '',
        });
      }
    }

    return {
      dischargeDate: assignment?.dischargeDate,
      milestones,
      addons: addons.map((a) => ({
        _id: String(a._id),
        dueDate: a.dueDate,
        status: a.status,
      })),
    };
  }
}
