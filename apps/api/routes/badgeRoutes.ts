import express from "express";
import {
  getBadges,
  getBadgeById,
  createBadge,
  updateBadge,
  deleteBadge,
} from "../controllers/badgeController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { preventReadOnlyActions } from "../middleware/readOnlyMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getBadges)
  .post(protect, admin, preventReadOnlyActions, createBadge);

router
  .route("/:id")
  .get(getBadgeById)
  .put(protect, admin, preventReadOnlyActions, updateBadge)
  .delete(protect, admin, preventReadOnlyActions, deleteBadge);

export default router;
