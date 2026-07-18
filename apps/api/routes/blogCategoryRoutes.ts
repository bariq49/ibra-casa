import express from "express";
import {
  getBlogCategories,
  getBlogCategoriesAdmin,
  getBlogCategoryById,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from "../controllers/blogCategoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { preventReadOnlyActions } from "../middleware/readOnlyMiddleware.js";

const router = express.Router();

// Admin/All routes
router.get("/all", protect, admin, getBlogCategoriesAdmin);

// Public routes
router.get("/", getBlogCategories);
router.get("/:id", getBlogCategoryById);

// Admin CRUD routes
router.post("/", protect, admin, preventReadOnlyActions, createBlogCategory);
router.put("/:id", protect, admin, preventReadOnlyActions, updateBlogCategory);
router.delete(
  "/:id",
  protect,
  admin,
  preventReadOnlyActions,
  deleteBlogCategory,
);

export default router;
