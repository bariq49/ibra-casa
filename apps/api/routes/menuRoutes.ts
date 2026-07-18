import express from "express";
import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleMenuStatus,
  reorderMenus,
  getMenusPublic,
} from "../controllers/menuController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route
router.get("/public", getMenusPublic);

// Admin routes
router.get("/", protect, admin, getMenus);
router.post("/", protect, admin, createMenu);
router.put("/reorder", protect, admin, reorderMenus);
router.put("/:id", protect, admin, updateMenu);
router.delete("/:id", protect, admin, deleteMenu);
router.patch("/:id/toggle", protect, admin, toggleMenuStatus);

export default router;
