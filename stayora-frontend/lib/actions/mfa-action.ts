"use server";

import {
  mfaSetup,
  mfaVerify,
  mfaDisable,
  mfaChallenge,
  mfaStatus,
} from "@/lib/api/mfa";
import { setAuthToken, setUserData, setTempMfaToken } from "../cookie";

export const handleMfaSetup = async (password: string) => {
  try {
    const response = await mfaSetup(password);
    if (response.success) {
      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    }
    return { success: false, message: response.message || "MFA setup failed" };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "MFA setup action failed",
    };
  }
};

export const handleMfaVerify = async (token: string, password: string) => {
  try {
    const response = await mfaVerify(token, password);
    if (response.success) {
      return { success: true, message: response.message };
    }
    return {
      success: false,
      message: response.message || "MFA verification failed",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "MFA verify action failed",
    };
  }
};

export const handleMfaDisable = async (password: string, token: string) => {
  try {
    const response = await mfaDisable(password, token);
    if (response.success) {
      return { success: true, message: response.message };
    }
    return {
      success: false,
      message: response.message || "Failed to disable MFA",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "MFA disable action failed",
    };
  }
};

export const handleMfaChallenge = async (tempToken: string, token: string) => {
  try {
    const response = await mfaChallenge(tempToken, token);
    if (response.success) {
      // Set the real auth cookie and user data after successful MFA challenge
      await setAuthToken(response.token);
      await setUserData(response.data);
      return {
        success: true,
        message: "MFA verification successful",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "MFA challenge failed",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "MFA challenge action failed",
    };
  }
};

export const handleMfaStatus = async () => {
  try {
    const response = await mfaStatus();
    if (response.success) {
      return { success: true, data: response.data };
    }
    return { success: false, message: "Failed to get MFA status" };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to get MFA status",
    };
  }
};
