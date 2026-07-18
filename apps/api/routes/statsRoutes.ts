import express from "express";
import { getStats, getLowStockProducts, getRecentOrders, getPurchaseDashboardStats } from "../controllers/statsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                   description: Total number of users
 *                 totalProducts:
 *                   type: number
 *                   description: Total number of products
 *                 totalCategories:
 *                   type: number
 *                   description: Total number of categories
 *                 totalBrands:
 *                   type: number
 *                   description: Total number of brands
 *                 totalOrders:
 *                   type: number
 *                   description: Total number of orders
 *                 totalRevenue:
 *                   type: number
 *                   description: Total revenue from all orders
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, getStats);                           // supports ?year=YYYY
router.get("/low-stock", protect, getLowStockProducts);
router.get("/recent-orders", protect, getRecentOrders);
router.get("/purchases", protect, getPurchaseDashboardStats);

export default router;
