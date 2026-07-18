import express from "express";
import { syncSeedData } from "../controllers/setupController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/setup/sync-seed:
 *   post:
 *     summary: Synchronize database seeds without data loss
 *     description: Reads exported JSON structures from data/seed and upserts them over existing schema. Expects an administrator token.
 *     tags: [Setup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully synchronized settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       500:
 *         description: Import setup failed
 */
router.post("/sync-seed", protect, admin, syncSeedData);

export default router;
