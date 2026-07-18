import asyncHandler from "express-async-handler";
import BlogTag from "../models/blogTagModel.js";

// @desc    Get all blog tags
// @route   GET /api/blog-tags
// @access  Public
const getBlogTags = asyncHandler(async (req, res) => {
  const tags = await BlogTag.find({ isActive: true }).sort({
    order: 1,
  });
  res.json(tags);
});

// @desc    Get all blog tags for admin
// @route   GET /api/blog-tags/admin
// @access  Private (Admin)
const getBlogTagsAdmin = asyncHandler(async (req, res) => {
  const tags = await BlogTag.find({}).sort({ order: 1 });
  res.json(tags);
});

// @desc    Get blog tag by ID
// @route   GET /api/blog-tags/:id
// @access  Public
const getBlogTagById = asyncHandler(async (req, res) => {
  const tag = await BlogTag.findById(req.params.id);
  if (tag) {
    res.json(tag);
  } else {
    res.status(404);
    throw new Error("Tag not found");
  }
});

// @desc    Create a blog tag
// @route   POST /api/blog-tags
// @access  Private/Admin
const createBlogTag = asyncHandler(async (req, res) => {
  const { name, description, isActive, order, slug } = req.body;

  const tagExists = await BlogTag.findOne({ name });
  if (tagExists) {
    res.status(400);
    throw new Error("Tag already exists");
  }

  const tag = await BlogTag.create({
    name,
    slug,
    description,
    isActive: isActive === undefined ? true : isActive,
    order: order || 0,
  });

  if (tag) {
    res.status(201).json(tag);
  } else {
    res.status(400);
    throw new Error("Invalid tag data");
  }
});

// @desc    Update a blog tag
// @route   PUT /api/blog-tags/:id
// @access  Private/Admin
const updateBlogTag = asyncHandler(async (req, res) => {
  const tag = await BlogTag.findById(req.params.id);

  if (tag) {
    tag.name = req.body.name || tag.name;
    tag.slug = req.body.slug || tag.slug;
    tag.description = req.body.description || tag.description;
    tag.order = req.body.order !== undefined ? req.body.order : tag.order;
    if (req.body.isActive !== undefined) tag.isActive = req.body.isActive;

    const updatedTag = await tag.save();
    res.json(updatedTag);
  } else {
    res.status(404);
    throw new Error("Tag not found");
  }
});

// @desc    Delete a blog tag
// @route   DELETE /api/blog-tags/:id
// @access  Private/Admin
const deleteBlogTag = asyncHandler(async (req, res) => {
  const tag = await BlogTag.findById(req.params.id);

  if (tag) {
    await tag.deleteOne();
    res.json({ message: "Tag removed" });
  } else {
    res.status(404);
    throw new Error("Tag not found");
  }
});

export {
  getBlogTags,
  getBlogTagsAdmin,
  getBlogTagById,
  createBlogTag,
  updateBlogTag,
  deleteBlogTag,
};
