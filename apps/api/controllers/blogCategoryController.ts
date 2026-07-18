import asyncHandler from "express-async-handler";
import BlogCategory from "../models/blogCategoryModel.js";

// @desc    Get all blog categories
// @route   GET /api/blog-categories
// @access  Public
const getBlogCategories = asyncHandler(async (req, res) => {
  const categories = await BlogCategory.find({ isActive: true }).sort({
    order: 1,
  });
  res.json(categories);
});

// @desc    Get all blog categories for admin
// @route   GET /api/blog-categories/admin
// @access  Private (Admin)
const getBlogCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await BlogCategory.find({}).sort({ order: 1 });
  res.json(categories);
});

// @desc    Get blog category by ID
// @route   GET /api/blog-categories/:id
// @access  Public
const getBlogCategoryById = asyncHandler(async (req, res) => {
  const category = await BlogCategory.findById(req.params.id);
  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

// @desc    Create a blog category
// @route   POST /api/blog-categories
// @access  Private/Admin
const createBlogCategory = asyncHandler(async (req, res) => {
  const { name, description, isActive, order } = req.body;

  const categoryExists = await BlogCategory.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await BlogCategory.create({
    name,
    description,
    isActive: isActive === undefined ? true : isActive,
    order: order || 0,
  });

  if (category) {
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error("Invalid category data");
  }
});

// @desc    Update a blog category
// @route   PUT /api/blog-categories/:id
// @access  Private/Admin
const updateBlogCategory = asyncHandler(async (req, res) => {
  const category = await BlogCategory.findById(req.params.id);

  if (category) {
    category.name = req.body.name || category.name;
    category.description = req.body.description || category.description;
    category.order =
      req.body.order !== undefined ? req.body.order : category.order;
    if (req.body.isActive !== undefined) category.isActive = req.body.isActive;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

// @desc    Delete a blog category
// @route   DELETE /api/blog-categories/:id
// @access  Private/Admin
const deleteBlogCategory = asyncHandler(async (req, res) => {
  const category = await BlogCategory.findById(req.params.id);

  if (category) {
    await category.deleteOne();
    res.json({ message: "Category removed" });
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

export {
  getBlogCategories,
  getBlogCategoriesAdmin,
  getBlogCategoryById,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
};
