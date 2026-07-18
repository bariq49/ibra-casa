import express from "express";
import {
  getCommentsByBlog,
  getCommentsAdmin,
  createComment,
  deleteComment,
} from "../controllers/commentController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { preventReadOnlyActions } from "../middleware/readOnlyMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/admin", protect, admin, getCommentsAdmin);

// Public routes
router.get("/blog/:blogId", getCommentsByBlog);

// Protected routes (User)
router.post("/", protect, preventReadOnlyActions, createComment);
router.delete("/:id", protect, preventReadOnlyActions, deleteComment);

export default router;
