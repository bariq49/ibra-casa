import express from "express";
import {
  getBlogTags,
  getBlogTagsAdmin,
  getBlogTagById,
  createBlogTag,
  updateBlogTag,
  deleteBlogTag,
} from "../controllers/blogTagController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { preventReadOnlyActions } from "../middleware/readOnlyMiddleware.js";

const router = express.Router();

// Admin/All routes
router.get("/all", protect, admin, getBlogTagsAdmin);

// Public routes
router.get("/", getBlogTags);
router.get("/:id", getBlogTagById);

// Admin CRUD routes
router.post("/", protect, admin, preventReadOnlyActions, createBlogTag);
router.put("/:id", protect, admin, preventReadOnlyActions, updateBlogTag);
router.delete(
  "/:id",
  protect,
  admin,
  preventReadOnlyActions,
  deleteBlogTag,
);

export default router;
