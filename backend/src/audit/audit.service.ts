import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import type { AuditActionType } from './schemas/audit-log.schema';

export interface AuditLogInput {
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  actionType?: AuditActionType;
  resourceType?: string;
  resourceLabel?: string;
  ipAddress?: string;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
  category?: string;
  severity?: 'info' | 'warning' | 'critical';
  suspicious?: boolean;
  statusCode?: number;
  method?: string;
  path?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogsQuery {
  page?: number;
  limit?: number;
  userSearch?: string;
  actorRole?: string;
  actionType?: string;
  resourceType?: string;
  datePreset?: 'today' | 'week' | 'month' | 'all';
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class AuditService implements OnModuleInit {
  private readonly logger = new Logger(AuditService.name);

  constructor(@InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>) {}

  async onModuleInit() {
    try {
      const r = await this.auditLogModel
        .deleteMany({
          $or: [
            { actorEmail: { $regex: /@demo\.local$/i } },
            { actorId: { $regex: /^demo\d+$/i } },
          ],
        })
        .exec();
      if (r.deletedCount > 0) {
        this.logger.log(`Audit : ${r.deletedCount} entrée(s) de démo (legacy) supprimée(s).`);
      }
      await this.auditLogModel
        .updateMany(
          { $or: [{ actionType: { $exists: false } }, { actionType: null }] },
          { $set: { actionType: 'OTHER', resourceType: 'other' } },
        )
        .exec();
    } catch (e) {
      this.logger.warn(`Audit init : ${String(e)}`);
    }
  }

  async log(entry: AuditLogInput): Promise<void> {
    try {
      await this.auditLogModel.create({
        ...entry,
        actionType: entry.actionType || 'OTHER',
        resourceType: entry.resourceType || 'other',
        category: entry.category || 'system',
        severity: entry.severity || 'info',
        suspicious: entry.suspicious ?? false,
      });
    } catch (e) {
      this.logger.warn(`Audit log insert failed: ${String(e)}`);
    }
  }

  async findLogs(q: AuditLogsQuery) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(5, q.limit ?? 25));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (q.userSearch?.trim()) {
      const esc = q.userSearch.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.actorEmail = { $regex: esc, $options: 'i' };
    }
    if (q.actorRole?.trim()) filter.actorRole = q.actorRole.trim();
    if (q.actionType?.trim()) filter.actionType = q.actionType.trim();
    if (q.resourceType?.trim()) filter.resourceType = q.resourceType.trim();

    const { from, to } = this.resolveDateRange(q);
    if (from || to) {
      filter.createdAt = {};
      if (from) (filter.createdAt as Record<string, Date>).$gte = from;
      if (to) (filter.createdAt as Record<string, Date>).$lte = to;
    }

    const [items, total] = await Promise.all([
      this.auditLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      this.auditLogModel.countDocuments(filter).exec(),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      items: items.map((r) => this.toListDto(r as Record<string, unknown>)),
    };
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Log introuvable');
    const r = await this.auditLogModel.findById(id).lean().exec();
    if (!r) throw new NotFoundException('Log introuvable');
    return this.toDetailDto(r as Record<string, unknown>);
  }

  private resolveDateRange(q: AuditLogsQuery): { from?: Date; to?: Date } {
    if (q.dateFrom || q.dateTo) {
      return {
        from: q.dateFrom ? new Date(q.dateFrom) : undefined,
        to: q.dateTo ? new Date(q.dateTo) : undefined,
      };
    }
    const now = new Date();
    const preset = q.datePreset || 'week';
    if (preset === 'all') return {};
    if (preset === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { from: start, to: now };
    }
    if (preset === 'week') {
      return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to: now };
    }
    if (preset === 'month') {
      return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now };
    }
    return {};
  }

  private toListDto(r: Record<string, unknown>) {
    return {
      id: String(r._id),
      actorEmail: r.actorEmail,
      actorRole: r.actorRole,
      action: r.action,
      actionType: r.actionType,
      resourceType: r.resourceType,
      resourceLabel: r.resourceLabel,
      ipAddress: r.ipAddress,
      category: r.category,
      severity: r.severity,
      suspicious: r.suspicious,
      statusCode: r.statusCode,
      method: r.method,
      path: r.path,
      createdAt: r.createdAt,
      visual: this.visualHint(String(r.actionType || ''), Number(r.statusCode)),
    };
  }

  private toDetailDto(r: Record<string, unknown>) {
    return {
      id: String(r._id),
      actorId: r.actorId,
      actorEmail: r.actorEmail,
      actorRole: r.actorRole,
      action: r.action,
      actionType: r.actionType,
      resourceType: r.resourceType,
      resourceLabel: r.resourceLabel,
      ipAddress: r.ipAddress,
      beforeSnapshot: r.beforeSnapshot,
      afterSnapshot: r.afterSnapshot,
      category: r.category,
      severity: r.severity,
      suspicious: r.suspicious,
      statusCode: r.statusCode,
      method: r.method,
      path: r.path,
      metadata: r.metadata,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      visual: this.visualHint(String(r.actionType || ''), Number(r.statusCode)),
    };
  }

  private visualHint(actionType: string, statusCode?: number): 'danger' | 'warning' | 'neutral' {
    if (actionType === 'DELETE') return 'danger';
    if (actionType === 'LOGIN_FAILED' || (statusCode != null && statusCode >= 400)) return 'warning';
    return 'neutral';
  }

  async getDashboard() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last14days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const notAuditorNorSuperAdmin = { actorRole: { $nin: ['auditor', 'superadmin'] } };

    const [
      logsToday,
      activeUsersAgg,
      totalActions,
      suspiciousCount,
      activitySeries,
      distribution,
      recent,
    ] = await Promise.all([
      this.auditLogModel
        .countDocuments({ createdAt: { $gte: startOfToday }, ...notAuditorNorSuperAdmin })
        .exec(),
      this.auditLogModel.distinct('actorId', {
        createdAt: { $gte: last24h },
        actorId: { $exists: true, $nin: [null, ''] },
        ...notAuditorNorSuperAdmin,
      }),
      this.auditLogModel
        .countDocuments({ createdAt: { $gte: last30days }, ...notAuditorNorSuperAdmin })
        .exec(),
      this.auditLogModel
        .countDocuments({
          suspicious: true,
          createdAt: { $gte: last30days },
          ...notAuditorNorSuperAdmin,
        })
        .exec(),
      this.auditLogModel
        .aggregate([
          { $match: { createdAt: { $gte: last14days }, ...notAuditorNorSuperAdmin } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .exec(),
      this.auditLogModel
        .aggregate([
          { $match: { createdAt: { $gte: last14days }, ...notAuditorNorSuperAdmin } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .exec(),
      this.auditLogModel
        .find({ createdAt: { $gte: last14days }, ...notAuditorNorSuperAdmin })
        .sort({ createdAt: -1 })
        .limit(25)
        .select(
          'actorEmail actorRole action category severity suspicious statusCode method path createdAt actionType resourceType ipAddress',
        )
        .lean()
        .exec(),
    ]);

    return {
      kpis: {
        logsToday,
        activeUsers: activeUsersAgg.length,
        totalActions,
        suspiciousActions: suspiciousCount,
      },
      charts: {
        activityOverTime: activitySeries.map((r: { _id: string; count: number }) => ({
          date: r._id,
          count: r.count,
        })),
        actionsDistribution: distribution.map((r: { _id: string; count: number }) => ({
          category: r._id || 'other',
          count: r.count,
        })),
      },
      recentLogs: recent.map((r: Record<string, unknown>) => ({
        id: String(r._id),
        actorEmail: r.actorEmail,
        actorRole: r.actorRole,
        action: r.action,
        category: r.category,
        severity: r.severity,
        suspicious: r.suspicious,
        statusCode: r.statusCode,
        method: r.method,
        path: r.path,
        createdAt: r.createdAt,
        actionType: r.actionType,
        resourceType: r.resourceType,
        ipAddress: r.ipAddress,
      })),
    };
  }
}
