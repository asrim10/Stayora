import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const TOKEN_BYTES = 32;
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24h

function generateToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

// Double-submit cookie pattern:
// - GET/HEAD/OPTIONS: sets csrf_token cookie (readable by JS)
// - POST/PUT/PATCH/DELETE: checks X-CSRF-Token header matches cookie
// Uses timingSafeEqual to prevent timing attacks
export const csrfMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV === "test") {
    return next();
  }

  const method = req.method.toUpperCase();

  // Set CSRF cookie on safe requests
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    if (!req.cookies?.[CSRF_COOKIE_NAME]) {
      const token = generateToken();
      res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false, // readable by frontend JS
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    }
    return next();
  }

  // Validate CSRF token on state-changing requests
  const cookieToken: string | undefined = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken: string | undefined = req.headers[CSRF_HEADER_NAME] as
    | string
    | undefined;

  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      success: false,
      message: "CSRF token missing. Please refresh and try again.",
    });
  }

  try {
    const cookieBuf = Buffer.from(cookieToken);
    const headerBuf = Buffer.from(headerToken);

    if (
      cookieBuf.length !== headerBuf.length ||
      !crypto.timingSafeEqual(cookieBuf, headerBuf)
    ) {
      return res.status(403).json({
        success: false,
        message: "CSRF token mismatch. Please refresh and try again.",
      });
    }
  } catch {
    return res.status(403).json({
      success: false,
      message: "CSRF validation failed. Please refresh and try again.",
    });
  }

  next();
};
