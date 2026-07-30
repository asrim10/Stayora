import { API } from "../endpoints";
import axios from "../axios";

export const getAllAuditLogs = async (
  page: number,
  size: number,
  action?: string,
) => {
  try {
    const response = await axios.get(API.ADMIN.AUDIT_LOG.GET_ALL, {
      params: { page, size, action },
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to fetch audit logs",
    );
  }
};

export const getAuditLogsByUser = async (
  userId: string,
  page: number,
  size: number,
) => {
  try {
    const response = await axios.get(API.ADMIN.AUDIT_LOG.GET_BY_USER(userId), {
      params: { page, size },
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to fetch user audit logs",
    );
  }
};
