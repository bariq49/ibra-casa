import express from "express";
import {
  getSizes,
  getSizeById,
  createSize,
  updateSize,
  deleteSize,
} from "../controllers/sizeController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { preventReadOnlyActions } from "../middleware/readOnlyMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getSizes)
  .post(protect, admin, preventReadOnlyActions, createSize);

router
  .route("/:id")
  .get(getSizeById)
  .put(protect, admin, preventReadOnlyActions, updateSize)
  .delete(protect, admin, preventReadOnlyActions, deleteSize);

export default router;
