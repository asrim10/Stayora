import { AuditLogRepository } from "../repositories/audit-log.repository";
import { Request } from "express";

const auditLogRepository = new AuditLogRepository();

export class AuditLogService {
  async log(
    userId: string,
    action: string,
    details?: string,
    req?: Request
  ) {
    return await auditLogRepository.create({
      userId,
      action,
      details,
      ip: req?.ip || req?.headers?.["x-forwarded-for"] as string || undefined,
      userAgent: req?.headers?.["user-agent"] || undefined,
    });
  }

  async getByUser(userId: string, page = 1, size = 20) {
    return await auditLogRepository.getByUserId(userId, page, size);
  }

  async getAll(page = 1, size = 20, action?: string) {
    return await auditLogRepository.getAll(page, size, action);
  }
}
