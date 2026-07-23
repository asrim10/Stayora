import { Router } from "express";
import {
  authorizedMiddleware,
  adminMiddleware,
} from "../../middlewares/authorized.middleware";
import { AdminReviewController } from "../../controllers/admin/review.controller";

const router = Router();
const adminReviewController = new AdminReviewController();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.get("/", (req, res) =>
  adminReviewController.getAllReviews(req, res),
);
router.get("/:id", (req, res) =>
  adminReviewController.getReviewById(req, res),
);
router.get("/user/:userId", (req, res) =>
  adminReviewController.getReviewsByUserId(req, res),
);
router.get("/hotel/:hotelId", (req, res) =>
  adminReviewController.getReviewsByHotelId(req, res),
);
router.put("/:id", (req, res) =>
  adminReviewController.updateReview(req, res),
);
router.delete("/:id", (req, res) =>
  adminReviewController.deleteReview(req, res),
);
router.get("/stats/all", (req, res) =>
  adminReviewController.getReviewStats(req, res),
);

export default router;
