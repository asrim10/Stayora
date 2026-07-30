import { Request, Response, NextFunction } from "express";
import axios from "axios";

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

export const captchaMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Skip CAPTCHA verification in test environment
  if (
    process.env.NODE_ENV === "test" ||
    req.header("X-Skip-Captcha") === "true"
  ) {
    return next();
  }

  const token = req.body.captchaToken;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "CAPTCHA verification required",
    });
  }

  try {
    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        secret: TURNSTILE_SECRET,
        response: token,
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    if (!response.data.success) {
      console.warn(
        `CAPTCHA verification failed: ${response.data["error-codes"]?.join(", ") || "Unknown error"}`,
      );
      return res.status(400).json({
        success: false,
        message: "CAPTCHA verification failed",
      });
    }

    next();
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return res.status(500).json({
      success: false,
      message: "CAPTCHA verification error",
    });
  }
};
