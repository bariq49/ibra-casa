import express from "express";
import {
  getBannerPages,
  createBannerPage,
  updateBannerPage,
  deleteBannerPage,
} from "../controllers/bannerPageController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getBannerPages).post(protect, admin, createBannerPage);
router
  .route("/:id")
  .put(protect, admin, updateBannerPage)
  .delete(protect, admin, deleteBannerPage);

export default router;
