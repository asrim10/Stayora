import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { GoogleOAuthController } from "../controllers/google-oauth.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";
import {
  loginLimiter,
  registerLimiter,
  passwordResetRequestLimiter,
  passwordResetLimiter,
  googleOAuthLimiter,
} from "../middlewares/rateLimiter.middleware";
import { captchaMiddleware } from "../middlewares/captcha.middleware";

let authController = new AuthController();
const googleOAuthController = new GoogleOAuthController();
const router = Router();

// Email/password auth
router.post("/register", registerLimiter, captchaMiddleware, authController.register);
router.post("/login", loginLimiter, captchaMiddleware, authController.login);
router.patch("/users/:id", authorizedMiddleware, authController.updateProfile);
router.delete("/users/:id", authorizedMiddleware, authController.delete);
router.get("/whoami", authorizedMiddleware, authController.getProfile);

router.put(
  "/update-profile",
  authorizedMiddleware,
  uploads.single("image"), // "image" - field name from frontend/client
  authController.updateProfile,
);

// Set password (for OAuth users who don't have one yet)
router.post(
  "/set-password",
  passwordResetLimiter,
  authorizedMiddleware,
  authController.setPassword,
);
router.post(
  "/request-password-reset",
  passwordResetRequestLimiter,
  captchaMiddleware,
  authController.requestPasswordReset,
);
router.post(
  "/reset-password/:token",
  passwordResetLimiter,
  authController.resetPassword,
);

// Google OAuth
router.get("/google", googleOAuthLimiter, googleOAuthController.redirectToGoogle);
router.get("/google/callback", googleOAuthLimiter, googleOAuthController.handleGoogleCallback);
router.post("/google/token", googleOAuthLimiter, captchaMiddleware, googleOAuthController.googleLoginWithIdToken);

export default router;
