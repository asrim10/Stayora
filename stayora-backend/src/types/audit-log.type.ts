import z from "zod";

export const AuditLogSchema = z.object({
  userId: z.string(),
  action: z.string(),
  details: z.string().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.date().optional().default(() => new Date()),
});

export type AuditLogType = z.infer<typeof AuditLogSchema>;
