import { Request, Response } from "express";
import TeamMember from "../models/teamMemberModel.js";

// @desc    Get all team members
// @route   GET /api/team-members
// @access  Public
export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const isPublic = req.query.public === "true";
    const filter = isPublic ? { isActive: true } : {};
    
    const teamMembers = await TeamMember.find(filter).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: teamMembers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// @desc    Create a team member
// @route   POST /api/team-members
// @access  Private/Admin
export const createTeamMember = async (req: Request, res: Response) => {
  try {
    const member = await TeamMember.create(req.body);
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating team member", error });
  }
};

// @desc    Update a team member
// @route   PUT /api/team-members/:id
// @access  Private/Admin
export const updateTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!member) {
      res.status(404).json({ success: false, message: "Team member not found" });
      return;
    }
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating team member", error });
  }
};

// @desc    Delete a team member
// @route   DELETE /api/team-members/:id
// @access  Private/Admin
export const deleteTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      res.status(404).json({ success: false, message: "Team member not found" });
      return;
    }
    await member.deleteOne();
    res.status(200).json({ success: true, message: "Team member removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting team member", error });
  }
};
