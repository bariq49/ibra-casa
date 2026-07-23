import { Response } from "express";
import asyncHandler from "express-async-handler";
import Contact from "../models/contactModel.js";
import { sendContactEmails } from "../utils/emailService.js";
// @ts-ignore
import { AuthRequest } from "../middleware/authMiddleware.js";

/**
 * @desc    Submit a contact message (public) + email user & admin
 * @route   POST /api/contacts
 * @access  Public
 */
export const createContactMessage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      firstName,
      lastName,
      phone,
      email,
      subject,
      message,
      source,
    } = req.body;

    if (!firstName?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      res.status(400);
      throw new Error(
        "First name, email, subject, and message are required",
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      res.status(400);
      throw new Error("Please provide a valid email address");
    }

    const payload = {
      firstName: String(firstName).trim(),
      lastName: lastName ? String(lastName).trim() : "",
      phone: phone ? String(phone).trim() : "",
      email: String(email).trim().toLowerCase(),
      subject: String(subject).trim(),
      message: String(message).trim(),
    };

    const contact = await Contact.create({
      ...payload,
      user: req.user?._id || undefined,
      source: source === "faq" ? "faq" : "contact",
    });

    // Send emails after save — do not fail the request if SMTP fails
    try {
      await sendContactEmails(payload);
    } catch (err) {
      console.error("Contact emails failed after save:", err);
    }

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon!",
      data: contact,
    });
  },
);

/**
 * @desc    Get all contact messages (Admin)
 * @route   GET /api/contacts
 * @access  Private/Admin
 */
export const getContacts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const contacts = await Contact.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(contacts);
  },
);
