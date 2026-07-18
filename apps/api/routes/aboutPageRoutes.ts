import express from "express";
import {
  getAboutPageConfig,
  updateAboutPageConfig,
} from "../controllers/aboutPageController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAboutPageConfig);
router.put("/", protect, admin, updateAboutPageConfig);

export default router;
