import express from "express";
const router = express.Router();
import {
  getPageBanners,
  getActivePageBanners,
  getPageBannerById,
  createPageBanner,
  updatePageBanner,
  deletePageBanner,
} from "../controllers/pageBannerController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// Public route for active banners
router.route("/active").get(getActivePageBanners);

// Admin / protected routes
router
  .route("/")
  .get(protect, getPageBanners)
  .post(protect, admin, createPageBanner);

router
  .route("/:id")
  .get(protect, getPageBannerById)
  .put(protect, admin, updatePageBanner)
  .delete(protect, admin, deletePageBanner);

export default router;
