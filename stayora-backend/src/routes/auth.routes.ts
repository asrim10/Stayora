import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";
import {
  loginLimiter,
  registerLimiter,
  passwordResetRequestLimiter,
  passwordResetLimiter,
} from "../middlewares/rateLimiter.middleware";
import { captchaMiddleware } from "../middlewares/captcha.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", registerLimiter, captchaMiddleware, authController.register);
router.post("/login", loginLimiter, captchaMiddleware, authController.login);
router.patch("/users/:id", authController.updateProfile);
router.delete("/users/:id", authController.delete);
router.get("/whoami", authorizedMiddleware, authController.getProfile);

router.put(
  "/update-profile",
  authorizedMiddleware,
  uploads.single("image"), // "image" - field name from frontend/client
  authController.updateProfile,
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

export default router;
