import mongoose, { Document, Schema } from "mongoose";
import { AuditLogType } from "../types/audit-log.type";

const AuditLogSchema: Schema = new Schema<AuditLogType>(
  {
    userId: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });

export interface IAuditLog extends AuditLogType, Document {
  _id: mongoose.Types.ObjectId;
}

export const AuditLogModel = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
