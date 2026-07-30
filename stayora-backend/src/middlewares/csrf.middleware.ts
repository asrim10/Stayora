import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const TOKEN_BYTES = 32;
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24h

// Routes that are exempt from CSRF validation because the user has no
// established session (and therefore no CSRF cookie) when calling them.
// - Login / Register: first interaction, no session exists yet
// - Password reset: user may not be logged in
// - Google OAuth: redirect-based flow
// - MFA challenge: uses a short-lived temp token, not a full session
const CSRF_EXEMPT_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/request-password-reset",
  "/api/auth/reset-password",
  "/api/auth/google",
  "/api/auth/google/callback",
  "/api/auth/google/token",
  "/api/auth/mfa/challenge",
];

function generateToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

function isExemptRoute(path: string): boolean {
  return CSRF_EXEMPT_ROUTES.some((route) => path.startsWith(route));
}

function setCsrfCookie(res: Response): void {
  const token = generateToken();
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // readable by frontend JS
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/**
 * Returns the full pathname without query string.
 *
 * Important: Express's `req.path` is relative to the mount point when
 * middleware is registered via `app.use("/api", fn)`. For a request to
 * `/api/auth/login`, inside the middleware `req.path` is `/auth/login`.
 * We must use the reconstructed full path (`baseUrl + path`) to match
 * against our exempt route list.
 */
function getFullPath(req: Request): string {
  return req.baseUrl + req.path;
}

// Double-submit cookie pattern:
// - GET/HEAD/OPTIONS: sets csrf_token cookie (readable by JS)
// - POST/PUT/PATCH/DELETE: checks X-CSRF-Token header matches cookie (unless exempt)
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
      setCsrfCookie(res);
    }
    return next();
  }

  // Skip CSRF validation for exempt routes (login, register, password reset,
  // OAuth, MFA challenge) — these are called before the user has a session,
  // so the CSRF cookie wouldn't exist yet.
  const fullPath = getFullPath(req);
  if (isExemptRoute(fullPath)) {
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
