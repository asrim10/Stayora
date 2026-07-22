import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  CLIENT_URL,
} from "../config";
import { GoogleOAuthService } from "../services/google-oauth.service";
import { setAuthCookie, setUserDataCookie } from "../utils/auth-cookie";

const googleOAuthService = new GoogleOAuthService();

const oAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
);

const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];

export class GoogleOAuthController {
  /**
   * GET /api/auth/google
   * Redirect the user to Google's OAuth consent screen.
   */
  async redirectToGoogle(_req: Request, res: Response) {
    try {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent",
      });
      return res.redirect(authUrl);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to initiate Google OAuth",
      });
    }
  }

  /**
   * GET /api/auth/google/callback
   * Handle the OAuth callback from Google. Exchange the code for tokens,
   * find or create a user, generate a JWT, set the httpOnly cookie,
   * and redirect to the frontend.
   */
  async handleGoogleCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;
      if (!code || typeof code !== "string") {
        return res.redirect(`${CLIENT_URL}/login?error=missing_code`);
      }

      // Exchange authorization code for tokens
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      // Verify the ID token
      const ticket = await oAuth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.sub) {
        return res.redirect(`${CLIENT_URL}/login?error=invalid_token`);
      }

      // Find or create user
      const { user, isNew } = await googleOAuthService.findOrCreateUser({
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      });

      // Generate JWT and set cookies
      const token = googleOAuthService.generateToken(user);
      setAuthCookie(res, token);
      setUserDataCookie(res, user);

      // Redirect to frontend with success
      const redirectUrl = isNew
        ? `${CLIENT_URL}/login?oauth=success&firstLogin=true`
        : `${CLIENT_URL}/login?oauth=success`;

      return res.redirect(redirectUrl);
    } catch (error: any) {
      return res.redirect(
        `${CLIENT_URL}/login?error=${encodeURIComponent(error.message || "oauth_failed")}`,
      );
    }
  }

  /**
   * POST /api/auth/google/token
   * Alternative endpoint for frontend to send an ID token directly
   * (useful for the Google One Tap / popup flow).
   */
  async googleLoginWithIdToken(req: Request, res: Response) {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({
          success: false,
          message: "ID token is required",
        });
      }

      // Verify the Google ID token
      const payload = await googleOAuthService.verifyGoogleToken(idToken);

      // Find or create user
      const { user } = await googleOAuthService.findOrCreateUser({
        sub: payload.sub!,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      });

      // Generate JWT and set cookies
      const token = googleOAuthService.generateToken(user);
      setAuthCookie(res, token);
      setUserDataCookie(res, user);

      return res.status(200).json({
        success: true,
        message: "Google login successful",
        data: user,
        token,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Google login failed",
      });
    }
  }
}
