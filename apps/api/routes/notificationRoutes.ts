import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createTestNotification,
  sendBulkNotification,
  getBulkSends,
  getUsersForNotification,
  getNotificationStats,
  getNotificationHistoryForUser,
  deleteNotificationFromHistory,
  clearNotificationHistoryForUser,
} from "../controllers/notificationController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// User notification routes
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);
router.delete("/", deleteAllNotifications);

// Test endpoint - create a test notification (development only)
router.post("/test", createTestNotification);

// Admin-only routes
router.post("/admin/bulk-send", admin, sendBulkNotification);
router.get("/admin/bulk-sends", admin, getBulkSends);
router.get("/admin/users", admin, getUsersForNotification);
router.get("/admin/stats", admin, getNotificationStats);
router.get("/admin/history/:userId", admin, getNotificationHistoryForUser);
router.delete("/admin/history/:id", admin, deleteNotificationFromHistory);
router.delete("/admin/history/user/:userId", admin, clearNotificationHistoryForUser);

export default router;
