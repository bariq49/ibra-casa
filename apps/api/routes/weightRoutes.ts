import express from "express";
import {
  getWeights,
  getWeightById,
  createWeight,
  updateWeight,
  deleteWeight,
} from "../controllers/weightController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { preventReadOnlyActions } from "../middleware/readOnlyMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getWeights)
  .post(protect, admin, preventReadOnlyActions, createWeight);

router
  .route("/:id")
  .get(getWeightById)
  .put(protect, admin, preventReadOnlyActions, updateWeight)
  .delete(protect, admin, preventReadOnlyActions, deleteWeight);

export default router;
