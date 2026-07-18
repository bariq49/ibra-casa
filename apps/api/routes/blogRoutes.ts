import express from "express";
import {
  getBlogs,
  getBlogsAdmin,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { preventReadOnlyActions } from "../middleware/readOnlyMiddleware.js";

const router = express.Router();

// Admin/All routes
router.get("/all", protect, admin, getBlogsAdmin);

// Public routes
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);

// Admin CRUD routes
router.post("/", protect, admin, preventReadOnlyActions, createBlog);
router.put("/:id", protect, admin, preventReadOnlyActions, updateBlog);
router.delete("/:id", protect, admin, preventReadOnlyActions, deleteBlog);

export default router;
