import { Router } from "express";
import {
  authorizedMiddleware,
  adminMiddleware,
} from "../../middlewares/authorized.middleware";
import { AdminAuditLogController } from "../../controllers/admin/audit-log.controller";

const adminAuditLogController = new AdminAuditLogController();
const router = Router();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.get("/", adminAuditLogController.getAllLogs);
router.get("/user/:userId", adminAuditLogController.getUserLogs);

export default router;
