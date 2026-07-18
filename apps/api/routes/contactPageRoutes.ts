import express from "express";
import {
  getContactPageConfig,
  updateContactPageConfig,
} from "../controllers/contactPageController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getContactPageConfig)
  .put(protect, admin, updateContactPageConfig);

export default router;
