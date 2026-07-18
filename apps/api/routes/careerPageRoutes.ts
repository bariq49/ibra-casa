import express from "express";
import {
  getCareerPageConfig,
  updateCareerPageConfig,
} from "../controllers/careerPageController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getCareerPageConfig)
  .put(protect, admin, updateCareerPageConfig);

export default router;
