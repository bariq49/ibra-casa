import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Contact from "../models/contactModel.js";
// @ts-ignore
import { AuthRequest } from "../middleware/authMiddleware.js";

/**
 * @desc    Submit a contact message
 * @route   POST /api/contacts
 * @access  Private
 */
export const createContactMessage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { subject, message, source } = req.body;

    const user = req.user?._id;

    if (!user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    const contact = await Contact.create({
      subject,
      message,
      user,
      source: source || "contact", // Default to "contact" if not provided
    });

    res.status(201).json(contact);
  },
);

/**
 * @desc    Get all contact messages (Admin)
 * @route   GET /api/contacts
 * @access  Private/Admin
 */
export const getContacts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const contacts = await Contact.find({}).populate("user", "name email");
    res.json(contacts);
  },
);
