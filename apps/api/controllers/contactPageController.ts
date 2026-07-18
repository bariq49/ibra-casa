import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import ContactPageConfig from "../models/contactPageModel.js";

// @desc    Get contact page config
// @route   GET /api/contact-page
// @access  Public
export const getContactPageConfig = asyncHandler(
  async (req: Request, res: Response) => {
    let config = await ContactPageConfig.findOne();

    if (!config) {
      // Return default if not populated yet
      config = new ContactPageConfig({
        title: "We are happy to assist you",
        subtitle: "Here to help, anytime you need us.",
        faqs: [],
        createdBy: req.user ? (req.user as any)._id : null,
      });
      // Don't save it here because it might be a public request with no user
    }

    res.status(200).json({
      success: true,
      data: config,
    });
  },
);

// @desc    Update contact page config
// @route   PUT /api/contact-page
// @access  Private/Admin
export const updateContactPageConfig = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, subtitle, faqs } = req.body;

    let config = await ContactPageConfig.findOne();

    if (config) {
      config.title = title || config.title;
      config.subtitle = subtitle || config.subtitle;
      if (faqs) config.faqs = faqs;
      config.updatedBy = (req.user as any)._id;

      const updatedConfig = await config.save();
      res.status(200).json({
        success: true,
        data: updatedConfig,
      });
    } else {
      // Create if it doesn't exist
      const newConfig = new ContactPageConfig({
        title,
        subtitle,
        faqs,
        createdBy: (req.user as any)._id,
      });

      const createdConfig = await newConfig.save();
      res.status(201).json({
        success: true,
        data: createdConfig,
      });
    }
  },
);
