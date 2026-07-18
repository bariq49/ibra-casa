import express from "express";
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/teamMemberController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getTeamMembers).post(protect, admin, createTeamMember);
router
  .route("/:id")
  .put(protect, admin, updateTeamMember)
  .delete(protect, admin, deleteTeamMember);

export default router;
