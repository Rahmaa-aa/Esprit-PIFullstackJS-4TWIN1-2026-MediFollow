import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Medication } from './schemas/medication.schema';

const localDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

@Injectable()
export class MedicationService {
  constructor(@InjectModel(Medication.name) private medicationModel: Model<Medication>) {}

  async create(data: any) {
    return this.medicationModel.create(data);
  }

  async getByPatient(patientId: string) {
    const meds = await this.medicationModel
      .find({ patientId, isActive: true })
      .sort({ createdAt: -1 })
      .exec();
    const today = localDateString();
    return meds.map(m => ({
      ...m.toObject(),
      takenToday: m.takenDates?.includes(today) ?? false,
    }));
  }

  async toggleTakenToday(id: string) {
    const med = await this.medicationModel.findById(id).exec();
    if (!med) throw new Error('Medication not found');
    const today = localDateString();
    const alreadyTaken = med.takenDates?.includes(today);
    if (alreadyTaken) {
      await this.medicationModel.updateOne({ _id: id }, { $pull: { takenDates: today } });
    } else {
      await this.medicationModel.updateOne({ _id: id }, { $addToSet: { takenDates: today } });
    }
    return { takenToday: !alreadyTaken };
  }

  async update(id: string, data: any) {
    return this.medicationModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async remove(id: string) {
    return this.medicationModel.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true }).exec();
  }
}
