import { Request, Response } from "express";
import { AuditLogService } from "../../services/audit-log.service";

const auditLogService = new AuditLogService();

export class AdminAuditLogController {
  async getAllLogs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 20;
      const action = req.query.action as string;

      const result = await auditLogService.getAll(page, size, action);
      return res.status(200).json({
        success: true,
        message: "Audit logs retrieved",
        data: result.logs,
        pagination: {
          page,
          size,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / size),
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUserLogs(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 20;

      const result = await auditLogService.getByUser(userId, page, size);
      return res.status(200).json({
        success: true,
        message: "User audit logs retrieved",
        data: result.logs,
        pagination: {
          page,
          size,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / size),
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
