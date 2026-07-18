import express from "express";
import {
  createBannerType,
  deleteBannerType,
  getBannerTypeById,
  getBannerTypes,
  updateBannerType,
} from "../controllers/bannerTypeController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getBannerTypes)
  .post(protect, admin, createBannerType);
router
  .route("/:id")
  .get(protect, getBannerTypeById)
  .put(protect, admin, updateBannerType)
  .delete(protect, admin, deleteBannerType);

export default router;
