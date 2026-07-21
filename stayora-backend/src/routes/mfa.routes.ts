import { Router } from "express";
import { MfaController } from "../controllers/mfa.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const mfaController = new MfaController();
const router = Router();

// Public route — no auth required (uses temp token from login)
router.post("/challenge", mfaController.challenge);

// Protected routes — require authentication
router.post("/setup", authorizedMiddleware, mfaController.setup);
router.post("/verify", authorizedMiddleware, mfaController.verify);
router.post("/disable", authorizedMiddleware, mfaController.disable);
router.get("/status", authorizedMiddleware, mfaController.status);

export default router;
