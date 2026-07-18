import express from "express";
import { globalSearch, publicSearch } from "../controllers/searchController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, globalSearch);
router.get("/public", publicSearch);

export default router;
