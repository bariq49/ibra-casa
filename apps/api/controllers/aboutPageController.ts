import { Request, Response } from "express";
import AboutPageConfig from "../models/aboutPageModel.js";

// @desc    Get about page config
// @route   GET /api/about-page
// @access  Public
export const getAboutPageConfig = async (req: Request, res: Response) => {
  try {
    let config = await AboutPageConfig.findOne().populate(
      "createdBy updatedBy",
      "name email",
    );

    if (!config) {
      // Return a default skeleton if not configured yet
      return res.status(200).json({
        success: true,
        data: {
          title: "Empowering Better Health at Home",
          mission: "",
          vision: "",
          stats: [
            { value: "12+", label: "Years of Trusted Service" },
            { value: "1M", label: "Orders Delivered Safely" },
            { value: "10K+", label: "Verified 5-Star Reviews" },
            { value: "99%", label: "Customer Satisfaction Rate" },
          ],
          heroImage: "",
          heroImageSmall: "",
          features: [],
        },
      });
    }

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update about page config
// @route   PUT /api/about-page
// @access  Private (Admin)
export const updateAboutPageConfig = async (req: any, res: Response) => {
  try {
    const { title, mission, vision, stats, heroImage, heroImageSmall, features } = req.body;

    let config = await AboutPageConfig.findOne();

    if (config) {
      config.title = title ?? config.title;
      config.mission = mission ?? config.mission;
      config.vision = vision ?? config.vision;
      config.stats = stats ?? config.stats;
      config.heroImage = heroImage ?? config.heroImage;
      config.heroImageSmall = heroImageSmall ?? config.heroImageSmall;
      config.features = features ?? config.features;
      config.updatedBy = (req as any).user?._id;

      const updatedConfig = await config.save();
      return res.status(200).json({
        success: true,
        data: updatedConfig,
      });
    } else {
      // Create new config if it doesn't exist
      const newConfig = await AboutPageConfig.create({
        title,
        mission,
        vision,
        stats,
        heroImage,
        heroImageSmall,
        features,
        createdBy: (req as any).user?._id,
      });

      return res.status(201).json({
        success: true,
        data: newConfig,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
