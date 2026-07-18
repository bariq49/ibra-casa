import express from "express";
import {
  getProductBases,
  getProductBaseById,
  createProductBase,
  updateProductBase,
  deleteProductBase,
} from "../controllers/productBaseController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { preventReadOnlyActions } from "../middleware/readOnlyMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getProductBases)
  .post(protect, admin, preventReadOnlyActions, createProductBase);

router
  .route("/:id")
  .get(getProductBaseById)
  .put(protect, admin, preventReadOnlyActions, updateProductBase)
  .delete(protect, admin, preventReadOnlyActions, deleteProductBase);

export default router;
