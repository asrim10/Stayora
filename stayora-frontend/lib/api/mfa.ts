import axiosInstance from "./axios";
import { API } from "./endpoints";

export const mfaSetup = async (password: string) => {
  try {
    const response = await axiosInstance.post(API.MFA.SETUP, { password });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "MFA setup failed",
    );
  }
};

export const mfaVerify = async (token: string, password: string) => {
  try {
    const response = await axiosInstance.post(API.MFA.VERIFY, { token, password });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "MFA verification failed",
    );
  }
};

export const mfaDisable = async (password: string, token: string) => {
  try {
    const response = await axiosInstance.post(API.MFA.DISABLE, {
      password,
      token,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to disable MFA",
    );
  }
};

export const mfaChallenge = async (tempToken: string, token: string) => {
  try {
    const response = await axiosInstance.post(API.MFA.CHALLENGE, {
      tempToken,
      token,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "MFA verification failed",
    );
  }
};

export const mfaStatus = async () => {
  try {
    const response = await axiosInstance.get(API.MFA.STATUS);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to get MFA status",
    );
  }
};
