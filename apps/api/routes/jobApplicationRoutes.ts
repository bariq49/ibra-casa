import express from "express";
import {
  applyForJob,
  getApplications,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/jobApplicationController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, admin, getApplications);
router.route("/:careerId").post(applyForJob);
router.route("/:id/status").put(protect, admin, updateApplicationStatus);
router.route("/:id").delete(protect, admin, deleteApplication);

export default router;
