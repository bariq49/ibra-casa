import express from "express";
import {
  getTodaysOffer,
  getTodaysOfferAdmin,
  updateTodaysOffer,
} from "../controllers/todaysOfferController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { preventReadOnlyActions } from "../middleware/readOnlyMiddleware.js";

const router = express.Router();

router.get("/", getTodaysOffer);
router.get("/admin", protect, admin, getTodaysOfferAdmin);
router.put("/", protect, admin, preventReadOnlyActions, updateTodaysOffer);

export default router;
