import express from "express";
import {
  createContactMessage,
  getContacts,
} from "../controllers/contactController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Publicly authenticated submission
router.route("/").post(protect, createContactMessage);

// Admin retrieval
router.route("/").get(protect, admin, getContacts);

export default router;
