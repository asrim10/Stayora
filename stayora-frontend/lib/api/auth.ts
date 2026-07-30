import { LoginData, RegisterData } from "@/app/(auth)/schema";
import axios from "./axios";
import { API } from "./endpoints";

export const register = async (registerData: RegisterData) => {
  try {
    const response = await axios.post(API.AUTH.REGISTER, registerData);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Registration failed",
    );
  }
};

export const login = async (loginData: LoginData) => {
  try {
    const response = await axios.post(API.AUTH.LOGIN, loginData);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Login failed",
    );
  }
};
export const whoAmI = async () => {
  try {
    const response = await axios.get(API.AUTH.WHOAMI);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Whoami failed",
    );
  }
};

export const updateProfile = async (profileData: any) => {
  try {
    const response = await axios.put(API.AUTH.UPDATEPROFILE, profileData, {
      headers: {
        "Content-Type": "multipart/form-data", // for file upload/multer
      },
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Update profile failed",
    );
  }
};

export const requestPasswordReset = async (email: string, captchaToken?: string) => {
  try {
    const response = await axios.post(API.AUTH.REQUEST_RESET_PASSWORD, {
      email,
      captchaToken,
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Request password reset failed",
    );
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await axios.post(API.AUTH.RESET_PASSWORD(token), {
      newPassword: newPassword,
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Reset password failed",
    );
  }
};

export const googleLogin = async (idToken: string) => {
  try {
    const response = await axios.post(API.AUTH.GOOGLE_TOKEN, { idToken });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Google login failed",
    );
  }
};

export const setPassword = async (newPassword: string, confirmPassword: string) => {
  try {
    const response = await axios.post(API.AUTH.SET_PASSWORD, {
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Set password failed",
    );
  }
};

export const exportUserData = async (format: "json" | "csv" = "json") => {
  try {
    const response = await axios.get(API.AUTH.EXPORT_DATA, {
      params: { format },
      responseType: "blob",
    });
    return response;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Export failed",
    );
  }
};
