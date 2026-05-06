import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VideoMeeting } from './schemas/video-meeting.schema';
import { Patient } from '../patient/schemas/patient.schema';
import { Nurse } from '../nurse/schemas/nurse.schema';
import * as crypto from 'crypto';
import { StaffNotification } from '../notification/schemas/notification.schema';

@Injectable()
export class VideoMeetingService {
  constructor(
    @InjectModel(VideoMeeting.name) private meetingModel: Model<VideoMeeting>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Nurse.name) private nurseModel: Model<Nurse>,
    @InjectModel(StaffNotification.name) private notificationModel: Model<StaffNotification>,
  ) {}

  private generateCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g. "A1B2C3D4"
  }

  async create(data: {
    title: string;
    scheduledAt: string | Date;
    duration?: number;
    notes?: string;
    invitedUsers?: { userId: string; name: string; role: string }[];
  }, user: { id: string; name?: string; role: string }) {
    let code: string;
    // ensure unique code
    do {
      code = this.generateCode();
    } while (await this.meetingModel.exists({ meetingCode: code }));

    const meeting = await this.meetingModel.create({
      title: data.title,
      scheduledAt: new Date(data.scheduledAt),
      duration: data.duration || 30,
      createdBy: user.id,
      creatorName: user.name || 'Organizer',
      creatorRole: user.role,
      participants: [],
      invitedUsers: data.invitedUsers || [],
      meetingCode: code,
      status: 'scheduled',
      notes: data.notes || '',
    });

    // Notify all invited users
    if (data.invitedUsers && data.invitedUsers.length > 0) {
      const notifications = data.invitedUsers.map((invited) => ({
        recipientId: invited.userId,
        recipientRole: invited.role,
        type: 'video_meeting_invite',
        title: `Invitation to Video Meeting: ${data.title}`,
        body: `You have been invited to join a video consultation organized by ${user.name || 'Organizer'}.`,
        read: false,
        meta: {
          kind: 'video_meeting_invite',
          meetingCode: code,
          meetingTitle: data.title,
          organizerName: user.name || 'Organizer',
        },
      }));
      await this.notificationModel.insertMany(notifications);
    }

    return meeting;
  }

  async findByUser(userId: string) {
    return this.meetingModel
      .find({
        $or: [
          { createdBy: userId },
          { 'participants.userId': userId },
          { 'invitedUsers.userId': userId },
        ],
      })
      .sort({ scheduledAt: -1 })
      .lean()
      .exec();
  }

  async getInvitableUsers() {
    const [patients, nurses] = await Promise.all([
      this.patientModel.find({ isActive: true }).select('firstName lastName role email').lean().exec(),
      this.nurseModel.find({ isActive: true }).select('firstName lastName role email').lean().exec(),
    ]);

    const formattedPatients = patients.map(p => ({
      userId: p._id.toString(),
      name: `${p.firstName} ${p.lastName}`,
      role: 'patient',
      email: p.email,
    }));

    const formattedNurses = nurses.map(n => ({
      userId: n._id.toString(),
      name: `${n.firstName} ${n.lastName}`,
      role: 'nurse',
      email: n.email,
    }));

    return [...formattedPatients, ...formattedNurses];
  }

  async findAll() {
    return this.meetingModel
      .find()
      .sort({ scheduledAt: -1 })
      .limit(200)
      .lean()
      .exec();
  }

  async findByCode(code: string) {
    const meeting = await this.meetingModel.findOne({ meetingCode: code.toUpperCase() }).lean().exec();
    if (!meeting) throw new NotFoundException('Meeting not found');
    return meeting;
  }

  async findById(id: string) {
    const meeting = await this.meetingModel.findById(id).lean().exec();
    if (!meeting) throw new NotFoundException('Meeting not found');
    return meeting;
  }

  async update(id: string, data: Partial<{
    title: string;
    scheduledAt: string | Date;
    duration: number;
    notes: string;
    status: string;
  }>, userId: string) {
    const meeting = await this.meetingModel.findById(id).exec();
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.createdBy !== userId) throw new ForbiddenException('Only the organizer can edit');

    const patch: any = {};
    if (data.title) patch.title = data.title;
    if (data.scheduledAt) patch.scheduledAt = new Date(data.scheduledAt);
    if (data.duration) patch.duration = data.duration;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.status) patch.status = data.status;

    return this.meetingModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean().exec();
  }

  async cancel(id: string, userId: string) {
    const meeting = await this.meetingModel.findById(id).exec();
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.createdBy !== userId) throw new ForbiddenException('Only the organizer can cancel');
    return this.meetingModel.findByIdAndUpdate(id, { $set: { status: 'cancelled' } }, { new: true }).lean().exec();
  }

  async join(code: string, user: { id: string; name?: string; role: string }) {
    const meeting = await this.meetingModel.findOne({ meetingCode: code.toUpperCase() }).exec();
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.status === 'cancelled') throw new ForbiddenException('Meeting was cancelled');

    const already = meeting.participants.some(p => p.userId === user.id);
    if (!already) {
      meeting.participants.push({
        userId: user.id,
        name: user.name || 'Participant',
        role: user.role,
        joinedAt: new Date(),
      });
      await meeting.save();
    }

    // auto-transition to in-progress
    if (meeting.status === 'scheduled') {
      meeting.status = 'in-progress';
      await meeting.save();
    }

    return meeting.toObject();
  }
}
