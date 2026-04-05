import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient } from '../patient/schemas/patient.schema';
import { Doctor } from '../doctor/schemas/doctor.schema';
import { Nurse } from '../nurse/schemas/nurse.schema';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
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

  async listSummaries() {
    const [pDepts, pServices, dDepts, nDepts] = await Promise.all([
      this.patientModel.distinct('department').exec(),
      this.patientModel.distinct('service').exec(),
      this.doctorModel.distinct('department').exec(),
      this.nurseModel.distinct('department').exec(),
    ]);
    const names = new Set<string>();
    [...pDepts, ...pServices, ...dDepts, ...nDepts].forEach((v) => {
      if (v && String(v).trim()) names.add(String(v).trim());
    });
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'fr'));

    const summaries = await Promise.all(
      sorted.map(async (name) => {
        const [patientCount, doctorCount, nurseCount] = await Promise.all([
          this.patientModel.countDocuments(this.patientDeptFilter(name)).exec(),
          this.doctorModel.countDocuments({ department: name }).exec(),
          this.nurseModel.countDocuments({ department: name }).exec(),
        ]);
        return {
          name,
          patientCount,
          doctorCount,
          nurseCount,
          total: patientCount + doctorCount + nurseCount,
        };
      }),
    );
    return summaries;
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
