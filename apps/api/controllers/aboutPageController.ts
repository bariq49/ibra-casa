import { Request, Response } from "express";
import mongoose from "mongoose";
import AboutPageConfig from "../models/aboutPageModel.js";
import uploadService from "../config/uploadService.js";

const MAX_IMAGE_FIELD_LEN = 500; // real CDN URLs are short; base64 blobs are huge

async function resolveImage(
  image: string | undefined,
  oldImage: string | undefined,
  filename: string,
): Promise<string> {
  if (image && image.startsWith("data:")) {
    const result = await uploadService.uploadImage(image, {
      folder: "about-page",
      originalName: filename,
    });

    if (oldImage && oldImage.startsWith("http")) {
      try {
        await uploadService.deleteImage(oldImage);
      } catch (err) {
        console.error("Failed to delete old about page image:", err);
      }
    }

    return result.url || "";
  }

  if (!image && oldImage && oldImage.startsWith("http")) {
    try {
      await uploadService.deleteImage(oldImage);
    } catch (err) {
      console.error("Failed to delete removed about page image:", err);
    }
    return "";
  }

  return image || "";
}

/** Inspect image field sizes on the DB side without shipping base64 to Node */
async function getSafeImages(docId: mongoose.Types.ObjectId) {
  const [meta] = await AboutPageConfig.aggregate([
    { $match: { _id: docId } },
    {
      $project: {
        heroLen: { $strLenBytes: { $ifNull: ["$heroImage", ""] } },
        smallLen: { $strLenBytes: { $ifNull: ["$heroImageSmall", ""] } },
        heroPrefix: {
          $substrBytes: [{ $ifNull: ["$heroImage", ""] }, 0, 8],
        },
        smallPrefix: {
          $substrBytes: [{ $ifNull: ["$heroImageSmall", ""] }, 0, 8],
        },
      },
    },
  ]);

  if (!meta) return { heroImage: "", heroImageSmall: "" };

  const heroBloated =
    meta.heroLen > MAX_IMAGE_FIELD_LEN || meta.heroPrefix === "data:ima";
  const smallBloated =
    meta.smallLen > MAX_IMAGE_FIELD_LEN || meta.smallPrefix === "data:ima";

  if (heroBloated || smallBloated) {
    await AboutPageConfig.updateOne(
      { _id: docId },
      {
        $set: {
          ...(heroBloated ? { heroImage: "" } : {}),
          ...(smallBloated ? { heroImageSmall: "" } : {}),
        },
      },
    );
  }

  if (heroBloated && smallBloated) {
    return { heroImage: "", heroImageSmall: "" };
  }

  // Safe to load — fields are short URLs
  const images = await AboutPageConfig.findById(docId)
    .select("heroImage heroImageSmall")
    .lean()
    .maxTimeMS(5000);

  return {
    heroImage: heroBloated ? "" : images?.heroImage || "",
    heroImageSmall: smallBloated ? "" : images?.heroImageSmall || "",
  };
}

// @desc    Get about page config
// @route   GET /api/about-page
// @access  Public
export const getAboutPageConfig = async (req: Request, res: Response) => {
  try {
    // Exclude image fields from the primary query so huge base64 never hits Node
    const config = await AboutPageConfig.findOne()
      .select(
        "title mission vision stats features createdBy updatedBy createdAt updatedAt",
      )
      .populate("createdBy updatedBy", "name email")
      .lean()
      .maxTimeMS(10000);

    if (!config) {
      return res.status(200).json({
        success: true,
        data: {
          title: "",
          mission: "",
          vision: "",
          stats: [],
          heroImage: "",
          heroImageSmall: "",
          features: [],
        },
      });
    }

    const { heroImage, heroImageSmall } = await getSafeImages(config._id);

    res.status(200).json({
      success: true,
      data: {
        ...config,
        heroImage,
        heroImageSmall,
      },
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
    const {
      title,
      mission,
      vision,
      stats,
      heroImage,
      heroImageSmall,
      features,
    } = req.body;

    let config = await AboutPageConfig.findOne()
      .select("-heroImage -heroImageSmall")
      .maxTimeMS(10000);

    const existingId = config?._id;
    const existingImages = existingId
      ? await getSafeImages(existingId)
      : { heroImage: "", heroImageSmall: "" };

    const finalHeroImage = await resolveImage(
      heroImage,
      existingImages.heroImage,
      "about_hero_main.jpg",
    );
    const finalHeroImageSmall = await resolveImage(
      heroImageSmall,
      existingImages.heroImageSmall,
      "about_hero_small.jpg",
    );

    if (config) {
      config.title = title ?? config.title;
      config.mission = mission ?? config.mission;
      config.vision = vision ?? config.vision;
      config.stats = stats ?? config.stats;
      config.heroImage = finalHeroImage;
      config.heroImageSmall = finalHeroImageSmall;
      config.features = features ?? config.features;
      config.updatedBy = req.user?._id;

      const updatedConfig = await config.save();
      return res.status(200).json({
        success: true,
        data: updatedConfig,
      });
    }

    const newConfig = await AboutPageConfig.create({
      title,
      mission,
      vision,
      stats: stats || [],
      heroImage: finalHeroImage,
      heroImageSmall: finalHeroImageSmall,
      features: features || [],
      createdBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      data: newConfig,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
