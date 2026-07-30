"use server";
import { getAllAuditLogs, getAuditLogsByUser } from "@/lib/api/admin/audit-log";

export const handleGetAllAuditLogs = async (
  page: string,
  size: string,
  action?: string,
) => {
  try {
    const currentPage = parseInt(page) || 1;
    const currentSize = parseInt(size) || 20;

    const response = await getAllAuditLogs(currentPage, currentSize, action);
    if (response.success) {
      return {
        success: true,
        message: "Audit logs retrieved",
        data: response.data,
        pagination: response.pagination,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to retrieve audit logs",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to retrieve audit logs",
    };
  }
};

export const handleGetAuditLogsByUser = async (
  userId: string,
  page: string,
  size: string,
) => {
  try {
    const currentPage = parseInt(page) || 1;
    const currentSize = parseInt(size) || 20;

    const response = await getAuditLogsByUser(userId, currentPage, currentSize);
    if (response.success) {
      return {
        success: true,
        message: "User audit logs retrieved",
        data: response.data,
        pagination: response.pagination,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to retrieve user audit logs",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to retrieve user audit logs",
    };
  }
};
