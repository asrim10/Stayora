import { Response } from "express";

const isProduction = process.env.NODE_ENV === "production";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

/**
 * Set the JWT as an httpOnly, secure, sameSite cookie so it's not accessible
 * from client-side JavaScript, mitigating XSS token theft.
 */
export const setAuthCookie = (res: Response, token: string) => {
  res.cookie("auth_token", token, COOKIE_OPTIONS);
};

/**
 * Set the user_data cookie (non-httpOnly, same security, JSON-serialized).
 * Stores non-sensitive user info like id, email, username, fullName, role.
 * This cookie is readable by client-side JS for UI display purposes.
 */
export const setUserDataCookie = (res: Response, user: any) => {
  const safeData = {
    _id: user._id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    imageUrl: user.imageUrl,
  };
  res.cookie("user_data", JSON.stringify(safeData), COOKIE_OPTIONS);
};
