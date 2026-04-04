import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment } from './schemas/appointment.schema';
import { Patient } from '../patient/schemas/patient.schema';
import {
  DoctorAvailabilityService,
  normalizeDateString,
  normalizeDoctorId,
  normalizeTime,
} from '../doctor-availability/doctor-availability.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    private doctorAvailabilityService: DoctorAvailabilityService,
    private notificationService: NotificationService,
  ) {}

  private toObjectId(id: string) {
    if (!id) return id;
    return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id;
  }

  /** Date locale YYYY-MM-DD (alignée filtre rendez-vous / calendrier). */
  private localTodayYmd(): string {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }

  async create(data: any) {
    const patientId = this.toObjectId(data.patientId);
    let status = data.status;
    if (status === 'scheduled') status = 'confirmed';
    if (!status) status = 'pending';
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) status = 'pending';

    const date = normalizeDateString(typeof data.date === 'string' ? data.date : String(data.date || ''));
    const time = normalizeTime(String(data.time || ''));

    if (status === 'pending') {
      if (!String(time).trim()) {
        throw new BadRequestException({
          message: 'Indiquez une heure pour votre demande.',
          code: 'TIME_REQUIRED',
        });
      }
      const doctorId = normalizeDoctorId(data.doctorId);
      if (!doctorId) {
        throw new BadRequestException({ message: 'Médecin requis.', code: 'DOCTOR_REQUIRED' });
      }
      if (!date) {
        throw new BadRequestException({ message: 'Date invalide.', code: 'DATE_REQUIRED' });
      }
      const ok = await this.doctorAvailabilityService.isSlotAvailableForRequest(doctorId, date, time);
      if (!ok) {
        const suggestedSlots = await this.doctorAvailabilityService.findSuggestedSlots(doctorId, date, 12);
        throw new BadRequestException({
          message:
            'Ce créneau n’est pas disponible (hors calendrier ou déjà réservé). Choisissez un créneau proposé ou une autre date.',
          code: 'SLOT_UNAVAILABLE',
          suggestedSlots,
        });
      }
    }

    const doc = await this.appointmentModel.create({
      patientId,
      doctorId: normalizeDoctorId(data.doctorId) || String(data.doctorId || ''),
      doctorName: data.doctorName || '',
      title: data.title,
      date,
      time,
      location: data.location || '',
      type: data.type || 'checkup',
      notes: data.notes || '',
      patientMessage: data.patientMessage || '',
      requestedDate: data.requestedDate || date,
      requestedTime: data.requestedTime || time,
      adminNotes: data.adminNotes || '',
      status,
    });

    if (status === 'confirmed' || status === 'scheduled') {
      try {
        await this.notificationService.notifyDoctorNewAppointment(doc.toObject());
      } catch (e) {
        console.error('[Appointment] notifyDoctorNewAppointment:', e);
      }
    }

    if (status === 'pending') {
      try {
        await this.notificationService.notifyAdminsAppointmentRequest(doc.toObject());
      } catch (e) {
        console.error('[Appointment] notifyAdminsAppointmentRequest:', e);
      }
    }

    return doc;
  }

  async getByPatient(patientId: string) {
    return this.appointmentModel
      .find({ patientId: this.toObjectId(patientId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUpcoming(patientId: string) {
    const today = this.localTodayYmd();
    return this.appointmentModel
      .find({
        patientId: this.toObjectId(patientId),
        date: { $gte: today },
        status: { $in: ['confirmed', 'scheduled'] },
      })
      .sort({ date: 1, time: 1 })
      .limit(5)
      .exec();
  }

  /** RDV confirmés à venir pour le médecin connecté (agenda). */
  async findUpcomingByDoctor(doctorId: string) {
    const id = normalizeDoctorId(doctorId);
    const today = this.localTodayYmd();
    return this.appointmentModel
      .find({
        doctorId: id,
        date: { $gte: today },
        status: { $in: ['confirmed', 'scheduled'] },
      })
      .populate('patientId', 'firstName lastName email phone')
      .sort({ date: 1, time: 1 })
      .limit(50)
      .lean()
      .exec();
  }

  /** RDV confirmés / planifiés pour un mois donné (calendrier médecin YYYY-MM). */
  async findConfirmedByDoctorForMonth(doctorId: string, yearMonth: string) {
    const id = normalizeDoctorId(doctorId);
    const ym = String(yearMonth || '').trim();
    const parts = ym.split('-');
    if (parts.length < 2) return [];
    const y = parseInt(parts[0], 10);
    const mo = parseInt(parts[1], 10);
    if (Number.isNaN(y) || Number.isNaN(mo)) return [];
    const lastDay = new Date(y, mo, 0).getDate();
    const start = `${y}-${String(mo).padStart(2, '0')}-01`;
    const end = `${y}-${String(mo).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return this.appointmentModel
      .find({
        doctorId: id,
        date: { $gte: start, $lte: end },
        status: { $in: ['confirmed', 'scheduled'] },
      })
      .populate('patientId', 'firstName lastName email phone')
      .sort({ date: 1, time: 1 })
      .lean()
      .exec();
  }

  /** RDV confirmés à venir (vue admin). */
  async findConfirmedUpcomingForAdmin() {
    const today = this.localTodayYmd();
    return this.appointmentModel
      .find({
        status: { $in: ['confirmed', 'scheduled'] },
        date: { $gte: today },
      })
      .populate('patientId', 'firstName lastName email phone')
      .sort({ date: 1, time: 1 })
      .limit(100)
      .lean()
      .exec();
  }

  async findPending() {
    return this.appointmentModel
      .find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('patientId', 'firstName lastName email phone')
      .lean()
      .exec();
  }

  /** Patients du département (department ou service) — aligné DepartmentService. */
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

  /**
   * Tous les rendez-vous des patients du département (coordinateur de soins).
   * Tri : date décroissante, puis heure.
   */
  async findForCoordinatorDepartment(departmentName: string) {
    const name = String(departmentName || '').trim();
    if (!name) return [];
    const patients = await this.patientModel.find(this.patientDeptFilter(name)).select('_id').lean().exec();
    const ids = patients.map((p: { _id: Types.ObjectId }) => p._id);
    if (!ids.length) return [];
    return this.appointmentModel
      .find({ patientId: { $in: ids } })
      .populate('patientId', 'firstName lastName email phone department service')
      .sort({ date: -1, time: -1 })
      .limit(500)
      .lean()
      .exec();
  }

  async update(id: string, data: any) {
    const prev = await this.appointmentModel.findById(id).exec();
    const patch: any = { ...data };
    if (patch.status === 'scheduled') patch.status = 'confirmed';
    const doc = await this.appointmentModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).exec();
    if (doc) {
      const st = doc.status;
      const prevSt = prev?.status;
      const becameConfirmed =
        (st === 'confirmed' || st === 'scheduled') &&
        prevSt !== 'confirmed' &&
        prevSt !== 'scheduled';
      if (becameConfirmed) {
        try {
          await this.notificationService.notifyDoctorNewAppointment(doc.toObject());
        } catch (e) {
          console.error('[Appointment] notifyDoctorNewAppointment (update):', e);
        }
      }
    }
    return doc;
  }

  async remove(id: string) {
    return this.appointmentModel.findByIdAndUpdate(id, { $set: { status: 'cancelled' } }, { new: true }).exec();
  }
}
