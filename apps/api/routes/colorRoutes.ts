import express from "express";
import {
  getColors,
  getColorById,
  createColor,
  updateColor,
  deleteColor,
} from "../controllers/colorController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { preventReadOnlyActions } from "../middleware/readOnlyMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getColors)
  .post(protect, admin, preventReadOnlyActions, createColor);

router
  .route("/:id")
  .get(getColorById)
  .put(protect, admin, preventReadOnlyActions, updateColor)
  .delete(protect, admin, preventReadOnlyActions, deleteColor);

export default router;
