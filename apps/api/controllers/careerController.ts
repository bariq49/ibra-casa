import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Career from "../models/careerModel.js";

// @desc    Get all careers (active only for public, all for admin)
// @route   GET /api/careers
// @access  Public
export const getCareers = asyncHandler(async (req: Request, res: Response) => {
  const isAdminRequest = req.user && (req.user as any).role === "admin";
  const query = isAdminRequest ? {} : { isActive: true };

  const careers = await Career.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: careers.length,
    data: careers,
  });
});

// @desc    Get single career
// @route   GET /api/careers/:id
// @access  Public
export const getCareerById = asyncHandler(async (req: Request, res: Response) => {
  const career = await Career.findById(req.params.id);

  if (career) {
    res.status(200).json({
      success: true,
      data: career,
    });
  } else {
    res.status(404);
    throw new Error("Career not found");
  }
});

// @desc    Create new career
// @route   POST /api/careers
// @access  Private/Admin
export const createCareer = asyncHandler(async (req: Request, res: Response) => {
  const { title, department, location, type, description, requirements, benefits, isActive } = req.body;

  const career = new Career({
    title,
    department,
    location,
    type,
    description,
    requirements,
    benefits,
    isActive,
    createdBy: (req.user as any)._id,
  });

  const createdCareer = await career.save();

  res.status(201).json({
    success: true,
    data: createdCareer,
  });
});

// @desc    Update career
// @route   PUT /api/careers/:id
// @access  Private/Admin
export const updateCareer = asyncHandler(async (req: Request, res: Response) => {
  const { title, department, location, type, description, requirements, benefits, isActive } = req.body;

  const career = await Career.findById(req.params.id);

  if (career) {
    career.title = title ?? career.title;
    career.department = department ?? career.department;
    career.location = location ?? career.location;
    career.type = type ?? career.type;
    career.description = description ?? career.description;
    career.requirements = requirements ?? career.requirements;
    career.benefits = benefits ?? career.benefits;
    career.isActive = isActive ?? career.isActive;
    career.updatedBy = (req.user as any)._id;

    const updatedCareer = await career.save();
    res.status(200).json({
      success: true,
      data: updatedCareer,
    });
  } else {
    res.status(404);
    throw new Error("Career not found");
  }
});

// @desc    Delete career
// @route   DELETE /api/careers/:id
// @access  Private/Admin
export const deleteCareer = asyncHandler(async (req: Request, res: Response) => {
  const career = await Career.findById(req.params.id);

  if (career) {
    await career.deleteOne();
    res.status(200).json({ message: "Career removed", success: true });
  } else {
    res.status(404);
    throw new Error("Career not found");
  }
});
