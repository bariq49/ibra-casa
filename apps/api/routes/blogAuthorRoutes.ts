import express from "express";
import {
  getBlogAuthors,
  getBlogAuthorsAdmin,
  getBlogAuthorById,
  createBlogAuthor,
  updateBlogAuthor,
  deleteBlogAuthor,
} from "../controllers/blogAuthorController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { preventReadOnlyActions } from "../middleware/readOnlyMiddleware.js";

const router = express.Router();

// Admin/All routes
router.get("/all", protect, admin, getBlogAuthorsAdmin);

// Public routes
router.get("/", getBlogAuthors);
router.get("/:id", getBlogAuthorById);

// Admin CRUD routes
router.post("/", protect, admin, preventReadOnlyActions, createBlogAuthor);
router.put("/:id", protect, admin, preventReadOnlyActions, updateBlogAuthor);
router.delete("/:id", protect, admin, preventReadOnlyActions, deleteBlogAuthor);

export default router;
