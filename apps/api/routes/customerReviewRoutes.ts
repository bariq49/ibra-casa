import express from "express";
import {
  getCustomerReviews,
  createCustomerReview,
  updateCustomerReview,
  deleteCustomerReview,
} from "../controllers/customerReviewController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getCustomerReviews).post(protect, admin, createCustomerReview);
router
  .route("/:id")
  .put(protect, admin, updateCustomerReview)
  .delete(protect, admin, deleteCustomerReview);

export default router;
