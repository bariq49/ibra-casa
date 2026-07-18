import { Request, Response } from "express";
import CustomerReview from "../models/customerReviewModel.js";

// @desc    Get all reviews
// @route   GET /api/customer-reviews
// @access  Public
export const getCustomerReviews = async (req: Request, res: Response) => {
  try {
    const isPublic = req.query.public === "true";
    const filter = isPublic ? { isActive: true } : {};
    
    // Typically sort newest to oldest, but keeping original insert order logic
    const reviews = await CustomerReview.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// @desc    Create a review
// @route   POST /api/customer-reviews
// @access  Private/Admin
export const createCustomerReview = async (req: Request, res: Response) => {
  try {
    const review = await CustomerReview.create(req.body);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating customer review", error });
  }
};

// @desc    Update a review
// @route   PUT /api/customer-reviews/:id
// @access  Private/Admin
export const updateCustomerReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await CustomerReview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!review) {
      res.status(404).json({ success: false, message: "Customer review not found" });
      return;
    }
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating customer review", error });
  }
};

// @desc    Delete a review
// @route   DELETE /api/customer-reviews/:id
// @access  Private/Admin
export const deleteCustomerReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await CustomerReview.findById(req.params.id);
    if (!review) {
      res.status(404).json({ success: false, message: "Customer review not found" });
      return;
    }
    await review.deleteOne();
    res.status(200).json({ success: true, message: "Customer review removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting customer review", error });
  }
};
