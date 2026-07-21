"use server";

import { cookies } from "next/headers";

const isProduction = process.env.NODE_ENV === "production";

interface UserData {
  _id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}
export const setAuthToken = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
};
export const getAuthToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value || null;
};
export const setUserData = async (userData: UserData) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "user_data",
    value: JSON.stringify(userData),
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
};
export const getUserData = async (): Promise<UserData | null> => {
  const cookieStore = await cookies();
  const userData = cookieStore.get("user_data")?.value || null;
  return userData ? JSON.parse(userData) : null;
};

export const setTempMfaToken = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "mfa_temp_token",
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 5 * 60, // 5 minutes (matches JWT expiry)
  });
};

export const getTempMfaToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("mfa_temp_token")?.value || null;
};

export const clearTempMfaToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("mfa_temp_token");
};

export const clearAuthCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("user_data");
  cookieStore.delete("mfa_temp_token");
};
