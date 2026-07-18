import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import JobApplication from "../models/jobApplicationModel.js";
import Career from "../models/careerModel.js";

// @desc    Apply for a job
// @route   POST /api/applications/:careerId
// @access  Public
export const applyForJob = asyncHandler(async (req: Request, res: Response) => {
  const { careerId } = req.params;
  const { firstName, lastName, email, phone, resumeUrl, portfolioUrl, coverLetter } = req.body;

  // Verify the career exists and is active
  const career = await Career.findById(careerId);
  if (!career || !career.isActive) {
    res.status(404);
    throw new Error("Job posting not found or is no longer active");
  }

  const application = await JobApplication.create({
    careerId,
    firstName,
    lastName,
    email,
    phone,
    resumeUrl,
    portfolioUrl,
    coverLetter,
    status: "Pending",
  });

  res.status(201).json({
    success: true,
    data: application,
    message: "Application submitted successfully",
  });
});

// @desc    Get all job applications
// @route   GET /api/applications
// @access  Private/Admin
export const getApplications = asyncHandler(async (req: Request, res: Response) => {
  const applications = await JobApplication.find()
    .populate("careerId", "title department location")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;

  const validStatuses = ["Pending", "Reviewed", "Shortlisted", "Rejected"];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const application = await JobApplication.findById(req.params.id);

  if (application) {
    application.status = status;
    const updatedApplication = await application.save();

    res.status(200).json({
      success: true,
      data: updatedApplication,
      message: "Status updated successfully",
    });
  } else {
    res.status(404);
    throw new Error("Application not found");
  }
});

// @desc    Delete an application
// @route   DELETE /api/applications/:id
// @access  Private/Admin
export const deleteApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await JobApplication.findById(req.params.id);

  if (application) {
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } else {
    res.status(404);
    throw new Error("Application not found");
  }
});
