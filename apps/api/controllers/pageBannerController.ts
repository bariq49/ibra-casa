import asyncHandler from "express-async-handler";
import PageBanner from "../models/pageBannerModel.js";

// @desc    Get all page banners
// @route   GET /api/page-banners
// @access  Private
const getPageBanners = asyncHandler(async (req, res) => {
  const pageBanners = await PageBanner.find({})
    .populate("badge", "name slug")
    .populate("bannerType", "name slug")
    .populate("bannerBase", "name slug")
    .sort({ createdAt: -1 });
  res.json(pageBanners);
});

// @desc    Get active page banners for storefront
// @route   GET /api/page-banners/active
// @access  Public
const getActivePageBanners = asyncHandler(async (req, res) => {
  const pageBanners = await PageBanner.find({ isActive: true })
    .populate("badge", "name slug")
    .populate("bannerType", "name slug")
    .populate("bannerBase", "name slug")
    .sort({ createdAt: -1 });
  res.json(pageBanners);
});

// @desc    Get page banner by ID
// @route   GET /api/page-banners/:id
// @access  Private
const getPageBannerById = asyncHandler(async (req, res) => {
  const pageBanner = await PageBanner.findById(req.params.id)
    .populate("badge", "name slug")
    .populate("bannerType", "name slug")
    .populate("bannerBase", "name slug");

  if (pageBanner) {
    res.json(pageBanner);
  } else {
    res.status(404);
    throw new Error("Page Banner not found");
  }
});

// @desc    Create a page banner
// @route   POST /api/page-banners
// @access  Private/Admin
const createPageBanner = asyncHandler(async (req, res) => {
  const {
    badge,
    title,
    subTitle,
    buttonTitle,
    buttonHref,
    buttonBg,
    bannerType,
    bannerBase,
    image,
    isActive,
  } = req.body;

  if (!badge || !title || !image) {
    res.status(400);
    throw new Error("Badge, Title, and Image are required");
  }

  const pageBanner = await PageBanner.create({
    badge,
    title,
    subTitle,
    buttonTitle,
    buttonHref,
    buttonBg,
    bannerType: bannerType || [],
    bannerBase: bannerBase || [],
    image,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json(pageBanner);
});

// @desc    Update a page banner
// @route   PUT /api/page-banners/:id
// @access  Private/Admin
const updatePageBanner = asyncHandler(async (req, res) => {
  const {
    badge,
    title,
    subTitle,
    buttonTitle,
    buttonHref,
    buttonBg,
    bannerType,
    bannerBase,
    image,
    isActive,
  } = req.body;

  const pageBanner = await PageBanner.findById(req.params.id);

  if (pageBanner) {
    pageBanner.badge = badge || pageBanner.badge;
    pageBanner.title = title || pageBanner.title;

    if (subTitle !== undefined) pageBanner.subTitle = subTitle;
    if (buttonTitle !== undefined) pageBanner.buttonTitle = buttonTitle;
    if (buttonHref !== undefined) pageBanner.buttonHref = buttonHref;
    if (buttonBg !== undefined) pageBanner.buttonBg = buttonBg;

    // Arrays can be cleared or updated
    if (bannerType !== undefined) pageBanner.bannerType = bannerType;
    if (bannerBase !== undefined) pageBanner.bannerBase = bannerBase;

    if (image !== undefined) pageBanner.image = image;
    if (isActive !== undefined) pageBanner.isActive = isActive;

    const updatedPageBanner = await pageBanner.save();
    res.json(updatedPageBanner);
  } else {
    res.status(404);
    throw new Error("Page Banner not found");
  }
});

// @desc    Delete a page banner
// @route   DELETE /api/page-banners/:id
// @access  Private/Admin
const deletePageBanner = asyncHandler(async (req, res) => {
  const pageBanner = await PageBanner.findById(req.params.id);

  if (pageBanner) {
    await pageBanner.deleteOne();
    res.json({ message: "Page Banner removed" });
  } else {
    res.status(404);
    throw new Error("Page Banner not found");
  }
});

export {
  getPageBanners,
  getActivePageBanners,
  getPageBannerById,
  createPageBanner,
  updatePageBanner,
  deletePageBanner,
};
