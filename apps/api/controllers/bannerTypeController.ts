import asyncHandler from "express-async-handler";
import BannerType from "../models/bannerTypeModel.js";

// @desc    Get all banner types
// @route   GET /api/banner-types
// @access  Private/Admin
const getBannerTypes = asyncHandler(async (req, res) => {
  const bannerTypes = await BannerType.find({}).sort({ createdAt: -1 });
  res.json(bannerTypes);
});

// @desc    Get banner type by ID
// @route   GET /api/banner-types/:id
// @access  Private/Admin
const getBannerTypeById = asyncHandler(async (req, res) => {
  const bannerType = await BannerType.findById(req.params.id);

  if (bannerType) {
    res.json(bannerType);
  } else {
    res.status(404);
    throw new Error("Banner Type not found");
  }
});

// @desc    Create a banner type
// @route   POST /api/banner-types
// @access  Private/Admin
const createBannerType = asyncHandler(async (req, res) => {
  const { title, slug, base } = req.body;

  const bannerTypeExists = await BannerType.findOne({ slug });

  if (bannerTypeExists) {
    res.status(400);
    throw new Error("Banner Type with this slug already exists");
  }

  const bannerType = await BannerType.create({
    title,
    slug,
    // @ts-ignore
    base,
  });

  if (bannerType) {
    res.status(201).json(bannerType);
  } else {
    res.status(400);
    throw new Error("Invalid banner type data");
  }
});

// @desc    Update a banner type
// @route   PUT /api/banner-types/:id
// @access  Private/Admin
const updateBannerType = asyncHandler(async (req, res) => {
  const bannerType = await BannerType.findById(req.params.id);

  if (bannerType) {
    bannerType.title = req.body.title || bannerType.title;
    bannerType.slug = req.body.slug || bannerType.slug;
    // @ts-ignore
    bannerType.base = req.body.base || bannerType.base;

    const updatedBannerType = await bannerType.save();
    res.json(updatedBannerType);
  } else {
    res.status(404);
    throw new Error("Banner Type not found");
  }
});

// @desc    Delete a banner type
// @route   DELETE /api/banner-types/:id
// @access  Private/Admin
const deleteBannerType = asyncHandler(async (req, res) => {
  const bannerType = await BannerType.findById(req.params.id);

  if (bannerType) {
    await bannerType.deleteOne();
    res.json({ message: "Banner Type removed" });
  } else {
    res.status(404);
    throw new Error("Banner Type not found");
  }
});

export {
  getBannerTypes,
  getBannerTypeById,
  createBannerType,
  updateBannerType,
  deleteBannerType,
};
