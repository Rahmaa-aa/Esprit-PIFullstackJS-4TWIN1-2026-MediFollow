import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Patient } from '../patient/schemas/patient.schema';
import { Doctor } from '../doctor/schemas/doctor.schema';
import { Nurse } from '../nurse/schemas/nurse.schema';
import { User } from '../auth/schemas/user.schema';
import { DepartmentCatalog } from './schemas/department-catalog.schema';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(DepartmentCatalog.name) private departmentCatalogModel: Model<DepartmentCatalog>,
  ) {}

  /** Patients sans department explicite : repli sur le champ service (anciennes données). */
  private patientDeptFilter(name: string) {
    return {
      $or: [
        { department: name },
        {
          $and: [
            { $or: [{ department: null }, { department: '' }, { department: { $exists: false } }] },
            { service: name },
          ],
        },
      ],
    };
  }

  /** Liste pour les listes déroulantes : catalogue + données existantes. */
  async listMergedDepartmentNames(): Promise<string[]> {
    const [catalogNames, pDepts, pServices, dDepts, nDepts, uDepts] = await Promise.all([
      this.departmentCatalogModel.distinct('name').exec(),
      this.patientModel.distinct('department').exec(),
      this.patientModel.distinct('service').exec(),
      this.doctorModel.distinct('department').exec(),
      this.nurseModel.distinct('department').exec(),
      this.userModel.distinct('department').exec(),
    ]);
    const names = new Set<string>();
    [...catalogNames, ...pDepts, ...pServices, ...dDepts, ...nDepts, ...uDepts].forEach((v) => {
      if (v && String(v).trim()) names.add(String(v).trim());
    });
    return [...names].sort((a, b) => a.localeCompare(b, 'fr'));
  }

  /** Noms présents uniquement dans department_catalog (pas de fusion patients / utilisateurs). */
  async listCatalogDepartmentNamesOnly(): Promise<string[]> {
    const raw = await this.departmentCatalogModel.distinct('name').exec();
    return [...new Set(raw.map((n) => String(n).trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'fr'),
    );
  }

  /** Catalogue uniquement : départements sans administrateur assigné. */
  async listCatalogDepartmentNamesWithoutAssignedAdmin(): Promise<string[]> {
    const docs = await this.departmentCatalogModel
      .find({})
      .select('name assignedAdminId')
      .lean()
      .exec();
    const names = docs
      .filter((d) => !d.assignedAdminId)
      .map((d) => d.name)
      .filter((n): n is string => Boolean(n && String(n).trim()));
    return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'fr'));
  }

  async createCatalogDepartment(rawName: string) {
    const name = (rawName || '').trim();
    if (!name) {
      throw new BadRequestException('Le nom du département est requis');
    }
    try {
      const doc = await this.departmentCatalogModel.create({ name });
      return { id: String(doc._id), name: doc.name };
    } catch (e: unknown) {
      const code = (e as { code?: number })?.code;
      if (code === 11000) {
        throw new ConflictException('Ce département existe déjà');
      }
      throw e;
    }
  }

  /** Crée l’entrée catalogue si absente (idempotent). */
  async ensureCatalogDepartment(rawName: string) {
    const name = (rawName || '').trim();
    if (!name) {
      throw new BadRequestException('Le nom du département est requis');
    }
    const existing = await this.departmentCatalogModel.findOne({ name }).exec();
    if (existing) {
      return { id: String(existing._id), name: existing.name };
    }
    return this.createCatalogDepartment(name);
  }

  async listSummaries() {
    const [pDepts, pServices, dDepts, nDepts, catalogNames, uDepts] = await Promise.all([
      this.patientModel.distinct('department').exec(),
      this.patientModel.distinct('service').exec(),
      this.doctorModel.distinct('department').exec(),
      this.nurseModel.distinct('department').exec(),
      this.departmentCatalogModel.distinct('name').exec(),
      this.userModel.distinct('department').exec(),
    ]);
    const names = new Set<string>();
    [...pDepts, ...pServices, ...dDepts, ...nDepts, ...catalogNames, ...uDepts].forEach((v) => {
      if (v && String(v).trim()) names.add(String(v).trim());
    });
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'fr'));

    const catalogDocs = await this.departmentCatalogModel.find().lean().exec();
    const catalogByName = new Map(catalogDocs.map((c) => [c.name, c]));
    const adminIds = catalogDocs
      .map((c) => (c as { assignedAdminId?: unknown }).assignedAdminId)
      .filter(Boolean)
      .map((id) => new Types.ObjectId(String(id)));
    const admins =
      adminIds.length > 0
        ? await this.userModel
            .find({ _id: { $in: adminIds }, role: 'admin' })
            .select('firstName lastName email name')
            .lean()
            .exec()
        : [];
    const adminById = new Map(admins.map((s) => [String(s._id), s]));

    const summaries = await Promise.all(
      sorted.map(async (name) => {
        const [patientCount, doctorCount, nurseCount] = await Promise.all([
          this.patientModel.countDocuments(this.patientDeptFilter(name)).exec(),
          this.doctorModel.countDocuments({ department: name }).exec(),
          this.nurseModel.countDocuments({ department: name }).exec(),
        ]);
        const cat = catalogByName.get(name);
        const catalogId = cat?._id ? String(cat._id) : null;
        const rawCat = cat as { assignedAdminId?: unknown } | undefined;
        const assignedAdminId = rawCat?.assignedAdminId ? String(rawCat.assignedAdminId) : null;
        const adm = assignedAdminId ? adminById.get(assignedAdminId) : undefined;
        const assignedAdminLabel = adm
          ? [adm.firstName, adm.lastName].filter(Boolean).join(' ').trim() ||
            (adm as { name?: string }).name ||
            adm.email
          : null;
        return {
          name,
          patientCount,
          doctorCount,
          nurseCount,
          total: patientCount + doctorCount + nurseCount,
          catalogId,
          assignedAdminId,
          assignedAdminLabel,
        };
      }),
    );
    return summaries;
  }

  async updateCatalogDepartment(catalogId: string, rawNewName: string) {
    if (!Types.ObjectId.isValid(catalogId)) {
      throw new BadRequestException('Identifiant catalogue invalide');
    }
    const doc = await this.departmentCatalogModel.findById(catalogId).exec();
    if (!doc) {
      throw new NotFoundException('Département catalogue introuvable');
    }
    const oldName = doc.name;
    const newName = (rawNewName || '').trim();
    if (!newName) {
      throw new BadRequestException('Le nom du département est requis');
    }
    if (newName === oldName) {
      return { id: String(doc._id), name: doc.name };
    }
    const duplicate = await this.departmentCatalogModel
      .findOne({ name: newName, _id: { $ne: doc._id } })
      .exec();
    if (duplicate) {
      throw new ConflictException('Ce nom existe déjà dans le catalogue');
    }

    await this.patientModel.updateMany({ department: oldName }, { $set: { department: newName } }).exec();
    await this.patientModel
      .updateMany(
        {
          $or: [{ department: null }, { department: '' }, { department: { $exists: false } }],
          service: oldName,
        },
        { $set: { service: newName } },
      )
      .exec();
    await this.doctorModel.updateMany({ department: oldName }, { $set: { department: newName } }).exec();
    await this.nurseModel.updateMany({ department: oldName }, { $set: { department: newName } }).exec();
    await this.userModel.updateMany({ department: oldName }, { $set: { department: newName } }).exec();

    doc.name = newName;
    await doc.save();
    return { id: String(doc._id), name: doc.name };
  }

  async deleteCatalogDepartment(catalogId: string) {
    if (!Types.ObjectId.isValid(catalogId)) {
      throw new BadRequestException('Identifiant catalogue invalide');
    }
    const doc = await this.departmentCatalogModel.findById(catalogId).exec();
    if (!doc) {
      throw new NotFoundException('Département catalogue introuvable');
    }
    const name = doc.name;
    const [patientCount, doctorCount, nurseCount] = await Promise.all([
      this.patientModel.countDocuments(this.patientDeptFilter(name)).exec(),
      this.doctorModel.countDocuments({ department: name }).exec(),
      this.nurseModel.countDocuments({ department: name }).exec(),
    ]);
    const total = patientCount + doctorCount + nurseCount;
    if (total > 0) {
      throw new BadRequestException(
        `Impossible de supprimer : ${total} profil(s) sont encore rattaché(s) à ce département`,
      );
    }
    const prevAdminId = doc.assignedAdminId;
    if (prevAdminId) {
      await this.userModel
        .updateOne(
          { _id: prevAdminId, department: name },
          { $set: { department: '' } },
        )
        .exec();
    }
    await doc.deleteOne();
    return { ok: true };
  }

  /** Un administrateur (role admin) par département catalogue ; synchronise User.department. */
  async assignAdminToCatalogDepartment(catalogId: string, adminUserId: string | null) {
    if (!Types.ObjectId.isValid(catalogId)) {
      throw new BadRequestException('Identifiant catalogue invalide');
    }
    const doc = await this.departmentCatalogModel.findById(catalogId).exec();
    if (!doc) {
      throw new NotFoundException('Département catalogue introuvable');
    }
    const deptName = doc.name;

    if (adminUserId === null || adminUserId === '') {
      const prev = doc.assignedAdminId;
      await this.departmentCatalogModel
        .updateOne({ _id: doc._id }, { $unset: { assignedAdminId: '', assignedSuperAdminId: '' } })
        .exec();
      if (prev) {
        await this.userModel
          .updateOne({ _id: prev, department: deptName }, { $set: { department: '' } })
          .exec();
      }
      return { id: String(doc._id), name: doc.name, assignedAdminId: null };
    }
    if (!Types.ObjectId.isValid(adminUserId)) {
      throw new BadRequestException('Identifiant administrateur invalide');
    }
    const user = await this.userModel.findById(adminUserId).select('role').lean().exec();
    if (!user || user.role !== 'admin') {
      throw new BadRequestException('Seuls les comptes administrateur peuvent être assignés au département');
    }

    await this.departmentCatalogModel
      .updateMany(
        { assignedAdminId: new Types.ObjectId(adminUserId), _id: { $ne: doc._id } },
        { $unset: { assignedAdminId: '', assignedSuperAdminId: '' } },
      )
      .exec();

    const prevOnDept = doc.assignedAdminId;
    if (prevOnDept && String(prevOnDept) !== adminUserId) {
      await this.userModel
        .updateOne({ _id: prevOnDept, department: deptName }, { $set: { department: '' } })
        .exec();
    }

    const admOid = new Types.ObjectId(adminUserId);
    await this.userModel.updateOne({ _id: admOid }, { $set: { department: deptName } }).exec();
    await this.departmentCatalogModel
      .updateOne(
        { _id: doc._id },
        { $set: { assignedAdminId: admOid }, $unset: { assignedSuperAdminId: '' } },
      )
      .exec();

    return {
      id: String(doc._id),
      name: doc.name,
      assignedAdminId: String(admOid),
    };
  }

  async getUsersByDepartment(department: string) {
    const name = (department || '').trim();
    if (!name) {
      return { department: '', patients: [], doctors: [], nurses: [] };
    }
    const [patients, doctors, nurses] = await Promise.all([
      this.patientModel
        .find(this.patientDeptFilter(name))
        .select('-password')
        .sort({ lastName: 1 })
        .lean()
        .exec(),
      this.doctorModel.find({ department: name }).select('-password').sort({ lastName: 1 }).lean().exec(),
      this.nurseModel.find({ department: name }).select('-password').sort({ lastName: 1 }).lean().exec(),
    ]);
    const mapPatient = (p: any) => ({
      id: p._id?.toString(),
      role: 'patient' as const,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      department: p.department || p.service,
      doctorId: p.doctorId ? String(p.doctorId) : '',
      nurseId: p.nurseId ? String(p.nurseId) : '',
      isActive: p.isActive !== false,
    });
    const mapDoctor = (d: any) => ({
      id: d._id?.toString(),
      role: 'doctor' as const,
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      department: d.department,
      specialty: d.specialty,
      isActive: d.isActive !== false,
    });
    const mapNurse = (n: any) => ({
      id: n._id?.toString(),
      role: 'nurse' as const,
      firstName: n.firstName,
      lastName: n.lastName,
      email: n.email,
      department: n.department,
      specialty: n.specialty,
      isActive: n.isActive !== false,
    });
    return {
      department: name,
      patients: patients.map(mapPatient),
      doctors: doctors.map(mapDoctor),
      nurses: nurses.map(mapNurse),
    };
  }

  /** Infirmiers du même département que le médecin (champ department sur Doctor). */
  async getNursesForDoctor(doctorId: string) {
    const doctor = await this.doctorModel.findById(doctorId).select('department').lean().exec();
    if (!doctor?.department?.trim()) {
      return { department: '', nurses: [] };
    }
    const name = doctor.department.trim();
    const nurses = await this.nurseModel
      .find({ department: name })
      .select('-password')
      .sort({ lastName: 1, firstName: 1 })
      .lean()
      .exec();
    return { department: name, nurses };
  }

  /** Médecins du même département (champ department sur Doctor). */
  async getDoctorsForDoctor(currentDoctorId: string) {
    const doctor = await this.doctorModel.findById(currentDoctorId).select('department').lean().exec();
    if (!doctor?.department?.trim()) {
      return { department: '', doctors: [] };
    }
    const name = doctor.department.trim();
    const doctors = await this.doctorModel
      .find({ department: name })
      .select('-password')
      .sort({ lastName: 1, firstName: 1 })
      .lean()
      .exec();
    return { department: name, doctors };
  }
}
