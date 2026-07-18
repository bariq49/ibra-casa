import asyncHandler from "express-async-handler";
import BannerPage from "../models/bannerPageModel.js";

// @desc    Get all banner pages
// @route   GET /api/banner-pages
// @access  Private
const getBannerPages = asyncHandler(async (req, res) => {
  const bannerPages = await BannerPage.find({});
  res.json(bannerPages);
});

// @desc    Create a banner page
// @route   POST /api/banner-pages
// @access  Private/Admin
const createBannerPage = asyncHandler(async (req, res) => {
  const { name, title, slug, description } = req.body;

  const bannerPageExists = await BannerPage.findOne({ slug });

  if (bannerPageExists) {
    res.status(400);
    throw new Error("Banner Page with this slug already exists");
  }

  const bannerPage = await BannerPage.create({
    name,
    title,
    slug,
    description,
  });

  if (bannerPage) {
    res.status(201).json(bannerPage);
  } else {
    res.status(400);
    throw new Error("Invalid banner page data");
  }
});

// @desc    Update a banner page
// @route   PUT /api/banner-pages/:id
// @access  Private/Admin
const updateBannerPage = asyncHandler(async (req, res) => {
  const bannerPage = await BannerPage.findById(req.params.id);

  if (bannerPage) {
    bannerPage.name = req.body.name || bannerPage.name;
    bannerPage.title = req.body.title || bannerPage.title;
    bannerPage.slug = req.body.slug || bannerPage.slug;
    bannerPage.description = req.body.description || bannerPage.description;

    const updatedBannerPage = await bannerPage.save();
    res.json(updatedBannerPage);
  } else {
    res.status(404);
    throw new Error("Banner Page not found");
  }
});

// @desc    Delete a banner page
// @route   DELETE /api/banner-pages/:id
// @access  Private/Admin
const deleteBannerPage = asyncHandler(async (req, res) => {
  const bannerPage = await BannerPage.findById(req.params.id);

  if (bannerPage) {
    await bannerPage.deleteOne();
    res.json({ message: "Banner Page removed" });
  } else {
    res.status(404);
    throw new Error("Banner Page not found");
  }
});

export { getBannerPages, createBannerPage, updateBannerPage, deleteBannerPage };
