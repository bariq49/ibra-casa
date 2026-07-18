import { Request, Response } from "express";
import CareerPageConfig from "../models/careerPageModel.js";
import uploadService from "../config/uploadService.js";

// @desc    Get career page config
// @route   GET /api/career-page
// @access  Public
export const getCareerPageConfig = async (req: Request, res: Response) => {
  try {
    const config = await CareerPageConfig.findOne().populate(
      "createdBy updatedBy",
      "name email"
    );

    if (!config) {
      return res.status(200).json({
        success: true,
        data: {
          collageImages: [],
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

// @desc    Update career page config
// @route   PUT /api/career-page
// @access  Private (Admin)
export const updateCareerPageConfig = async (req: any, res: Response) => {
  try {
    const { collageImages } = req.body;

    let config = await CareerPageConfig.findOne();

    let finalImages: string[] = [];
    const oldImages = config?.collageImages || [];

    if (Array.isArray(collageImages)) {
      for (let i = 0; i < collageImages.length; i++) {
        const image = collageImages[i];
        const oldImage = oldImages.length > i ? oldImages[i] : undefined;

        if (image && image.startsWith("data:")) {
          // It's a new base64 image, upload it
          const result = await uploadService.uploadImage(image, {
            folder: "career-page",
            originalName: `career_collage_${i}.jpg`,
          });
          finalImages.push(result.url || "");

          // Delete old image if we are replacing it
          if (oldImage && oldImage.startsWith("http")) {
            try {
              await uploadService.deleteImage(oldImage);
            } catch (err) {
              console.error("Failed to delete old career page image:", err);
            }
          }
        } else {
          // It's either an existing URL or empty
          if (!image && oldImage && oldImage.startsWith("http")) {
            // It was removed
            try {
              await uploadService.deleteImage(oldImage);
            } catch (err) {
              console.error("Failed to delete old career page image:", err);
            }
          }
          finalImages.push(image || "");
        }
      }
    } else {
      finalImages = oldImages;
    }

    if (config) {
      config.collageImages = finalImages;
      config.updatedBy = (req as any).user?._id;

      const updatedConfig = await config.save();
      return res.status(200).json({
        success: true,
        data: updatedConfig,
      });
    } else {
      const newConfig = await CareerPageConfig.create({
        collageImages: finalImages,
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
