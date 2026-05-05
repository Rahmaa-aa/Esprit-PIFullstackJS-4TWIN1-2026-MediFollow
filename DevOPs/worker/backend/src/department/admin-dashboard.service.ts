import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient } from '../patient/schemas/patient.schema';
import { Doctor } from '../doctor/schemas/doctor.schema';
import { Nurse } from '../nurse/schemas/nurse.schema';
import { Appointment } from '../appointment/schemas/appointment.schema';
import { User } from '../auth/schemas/user.schema';
import { DepartmentCatalog } from './schemas/department-catalog.schema';

function localTodayYmd(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

function startOfDayDaysAgo(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d;
}

function lastNDatesLabels(n: number): { iso: string[]; weekdayShortFr: string[] } {
  const iso: string[] = [];
  const fr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const weekdayShortFr: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    iso.push(`${y}-${m}-${day}`);
    weekdayShortFr.push(fr[d.getDay()]);
  }
  return { iso, weekdayShortFr };
}

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(DepartmentCatalog.name) private catalogModel: Model<DepartmentCatalog>,
  ) {}

  async getDashboardStats() {
    const today = localTodayYmd();
    const start7 = startOfDayDaysAgo(6);

    const [
      doctorsCount,
      nursesCount,
      patientsCount,
      appointmentsPending,
      appointmentsUpcoming,
      departmentsCount,
      staffAccountsCount,
      patientsWithDoctor,
      patientDaily,
      appointmentDaily,
      recentAppointments,
    ] = await Promise.all([
      this.doctorModel.countDocuments({}).exec(),
      this.nurseModel.countDocuments({}).exec(),
      this.patientModel.countDocuments({}).exec(),
      this.appointmentModel.countDocuments({ status: 'pending' }).exec(),
      this.appointmentModel
        .countDocuments({
          status: { $in: ['confirmed', 'scheduled'] },
          date: { $gte: today },
        })
        .exec(),
      this.catalogModel.countDocuments({}).exec(),
      this.userModel
        .countDocuments({
          role: { $in: ['admin', 'superadmin', 'carecoordinator', 'auditor'] },
        })
        .exec(),
      this.patientModel
        .countDocuments({
          doctorId: { $exists: true, $nin: [null, ''] },
        })
        .exec(),
      this.patientModel
        .aggregate([
          { $match: { createdAt: { $gte: start7 } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
        ])
        .exec(),
      this.appointmentModel
        .aggregate([
          { $match: { createdAt: { $gte: start7 } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
        ])
        .exec(),
      this.appointmentModel
        .find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('patientId', 'firstName lastName email')
        .lean()
        .exec(),
    ]);

    const { iso: dateKeys, weekdayShortFr } = lastNDatesLabels(7);
    const patientMap = new Map((patientDaily as { _id: string; count: number }[]).map((x) => [x._id, x.count]));
    const apptMap = new Map((appointmentDaily as { _id: string; count: number }[]).map((x) => [x._id, x.count]));
    const patientsSeries = dateKeys.map((d) => patientMap.get(d) ?? 0);
    const appointmentsSeries = dateKeys.map((d) => apptMap.get(d) ?? 0);

    const totalApptActive = appointmentsPending + appointmentsUpcoming;
    const pendingPressure =
      totalApptActive > 0 ? Math.round((appointmentsPending / totalApptActive) * 100) : 0;
    const coveragePct =
      patientsCount > 0 ? Math.round((patientsWithDoctor / patientsCount) * 100) : 0;
    const nurseRatio = doctorsCount > 0 ? Math.min(100, Math.round((nursesCount / (nursesCount + doctorsCount)) * 100)) : 0;

    const recentActivity = (recentAppointments as any[]).map((a) => {
      const p = a.patientId;
      const patientLabel = p
        ? [p.firstName, p.lastName].filter(Boolean).join(' ').trim() || p.email || 'Patient'
        : 'Patient';
      const createdAt = a.createdAt ? new Date(a.createdAt).toISOString() : '';
      return {
        id: String(a._id),
        patientLabel,
        title: String(a.title || 'Rendez-vous'),
        status: String(a.status || ''),
        date: String(a.date || ''),
        time: String(a.time || ''),
        createdAt,
      };
    });

    return {
      counts: {
        doctors: doctorsCount,
        nurses: nursesCount,
        patients: patientsCount,
        appointmentsPending,
        appointmentsUpcoming,
        departments: departmentsCount,
        staffAccounts: staffAccountsCount,
      },
      chart: {
        categories: weekdayShortFr,
        dateKeys,
        series: [
          { nameKey: 'newPatients', data: patientsSeries },
          { nameKey: 'newAppointments', data: appointmentsSeries },
        ],
      },
      occupation: [
        {
          key: 'pendingShare',
          percent: pendingPressure,
        },
        {
          key: 'patientCoverage',
          percent: coveragePct,
        },
        {
          key: 'nursingStaffShare',
          percent: nurseRatio,
        },
      ],
      recentActivity,
    };
  }
}
