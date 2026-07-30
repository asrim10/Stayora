import { AuditLogModel, IAuditLog } from "../models/audit-log.model";

export interface IAuditLogRepository {
  create(data: Partial<IAuditLog>): Promise<IAuditLog>;
  getByUserId(userId: string, page: number, size: number): Promise<{ logs: IAuditLog[]; total: number }>;
  getAll(page: number, size: number, action?: string): Promise<{ logs: IAuditLog[]; total: number }>;
}

export class AuditLogRepository implements IAuditLogRepository {
  async create(data: Partial<IAuditLog>): Promise<IAuditLog> {
    const log = new AuditLogModel(data);
    return await log.save();
  }

  async getByUserId(
    userId: string,
    page: number,
    size: number
  ): Promise<{ logs: IAuditLog[]; total: number }> {
    const filter = { userId };
    const [logs, total] = await Promise.all([
      AuditLogModel.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * size)
        .limit(size),
      AuditLogModel.countDocuments(filter),
    ]);
    return { logs, total };
  }

  async getAll(
    page: number,
    size: number,
    action?: string
  ): Promise<{ logs: IAuditLog[]; total: number }> {
    const filter: any = {};
    if (action) filter.action = action;

    const [logs, total] = await Promise.all([
      AuditLogModel.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * size)
        .limit(size),
      AuditLogModel.countDocuments(filter),
    ]);
    return { logs, total };
  }
}
