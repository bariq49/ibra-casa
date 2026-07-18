import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/couponController.js";

const router = express.Router();

// Public route to validate a coupon
router.post("/validate", validateCoupon);

// Admin routes for CRUD
router.route("/").get(protect, admin, getCoupons).post(protect, admin, createCoupon);

router
  .route("/:id")
  .get(protect, admin, getCouponById)
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

export default router;
