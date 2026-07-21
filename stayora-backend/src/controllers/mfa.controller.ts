import { Request, Response } from "express";
import z from "zod";
import {
  generateMfaSetup,
  enableMfa,
  disableMfa,
  completeMfaChallenge,
  getMfaStatus,
} from "../services/mfa.service";
import { SetupMfaDTO, VerifyMfaDTO, DisableMfaDTO, MfaChallengeDTO } from "../dtos/mfa.dto";

export class MfaController {
  // POST /api/auth/mfa/setup — Generate TOTP secret & otpauth URL for the authenticated user
  async setup(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // Validate password confirmation
      const parsed = SetupMfaDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        });
      }

      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(400).json({ success: false, message: "User email not found" });
      }

      const result = await generateMfaSetup(userId.toString(), userEmail);
      return res.status(200).json({
        success: true,
        message: "MFA setup initialized. Scan the QR code with your authenticator app.",
        data: result,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // POST /api/auth/mfa/verify — Verify TOTP code and enable MFA for the user
  async verify(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = VerifyMfaDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        });
      }

      const password = req.body.password;
      if (!password) {
        return res.status(400).json({ success: false, message: "Password is required" });
      }

      const result = await enableMfa(userId.toString(), parsed.data.token, password);
      return res.status(200).json({ success: true, ...result });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // POST /api/auth/mfa/disable — Disable MFA (requires password + valid TOTP code)
  async disable(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = DisableMfaDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        });
      }

      const result = await disableMfa(userId.toString(), parsed.data.password, parsed.data.token);
      return res.status(200).json({ success: true, ...result });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // POST /api/auth/mfa/challenge — validate temp token + TOTP, return real JWT
  async challenge(req: Request, res: Response) {
    try {
      const parsed = MfaChallengeDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        });
      }

      const { token: realToken, user } = await completeMfaChallenge(
        parsed.data.tempToken,
        parsed.data.token,
      );

      // Set the real auth cookie
      const isProduction = process.env.NODE_ENV === "production";
      res.cookie("auth_token", realToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return res.status(200).json({
        success: true,
        message: "MFA verification successful",
        data: user,
        token: realToken,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // GET /api/auth/mfa/status — Return the current user's MFA enabled/disabled status
  async status(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const result = await getMfaStatus(userId.toString());
      return res.status(200).json({ success: true, data: result });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
