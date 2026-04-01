import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from './schemas/appointment.schema';

@Injectable()
export class AppointmentService {
  constructor(@InjectModel(Appointment.name) private appointmentModel: Model<Appointment>) {}

  async create(data: any) {
    return this.appointmentModel.create(data);
  }

  async getByPatient(patientId: string) {
    return this.appointmentModel
      .find({ patientId })
      .sort({ date: 1, time: 1 })
      .exec();
  }

  async getUpcoming(patientId: string) {
    const today = new Date().toISOString().split('T')[0];
    return this.appointmentModel
      .find({ patientId, date: { $gte: today }, status: { $ne: 'cancelled' } })
      .sort({ date: 1, time: 1 })
      .limit(5)
      .exec();
  }

  async update(id: string, data: any) {
    return this.appointmentModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async remove(id: string) {
    return this.appointmentModel.findByIdAndUpdate(id, { $set: { status: 'cancelled' } }, { new: true }).exec();
  }
}
