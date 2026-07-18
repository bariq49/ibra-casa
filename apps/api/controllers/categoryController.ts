import asyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import ProductBase from "../models/productBaseModel.js";
import uploadService from "../config/uploadService.js";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.perPage as string) || 20;
  const sortOrder = (req.query.sortOrder as string) || "asc";
  const parentId = req.query.parent as string | undefined;
  const baseSlugs = req.query.bases as string | undefined;

  // Validate page and perPage
  if (page < 1 || perPage < 1) {
    res.status(400);
    throw new Error("Page and perPage must be positive integers");
  }

  // Validate sortOrder
  if (!["asc", "desc"].includes(sortOrder)) {
    res.status(400);
    throw new Error('Sort order must be "asc" or "desc"');
  }

  const filter: any = {
    isActive: true,
  };

  // Only filter by parent if explicitly specified
  if (parentId !== undefined) {
    filter.parent = parentId === "null" ? null : parentId;
  }

  // Filter by productBases slugs if provided (comma-separated)
  if (baseSlugs) {
    const slugArray = baseSlugs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const productBases = await ProductBase.find({
      slug: { $in: slugArray },
    }).select("_id");
    const baseIds = productBases.map((pb) => pb._id);
    if (baseIds.length > 0) {
      filter.productBases = { $in: baseIds };
    } else {
      // No matching productBase found — return empty
      res.json({ categories: [], total: 0, page, perPage, totalPages: 0 });
      return;
    }
  }

  const skip = (page - 1) * perPage;
  const total = await Category.countDocuments(filter);
  const sortValue = sortOrder === "asc" ? 1 : -1;
  const categories = await Category.find(filter)
    .populate("parent", "name slug")
    .skip(skip)
    .limit(perPage)
    .sort({ order: 1, createdAt: sortValue });

  const totalPages = Math.ceil(total / perPage);

  res.json({ categories, total, page, perPage, totalPages });
});

// @desc    Get category tree (hierarchical structure)
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === "true";
  const filter: any = {};
  if (!includeInactive) {
    filter.isActive = true;
  }

  const categories = await Category.find(filter)
    .sort({ level: 1, order: 1, name: 1 })
    .lean();

  const productCounts = await Product.aggregate([
    { $match: { isDeleted: { $ne: true } } }, // Assuming soft delete, adjust if needed
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  productCounts.forEach((p) => {
    if (p._id) countMap.set(p._id.toString(), p.count);
  });

  const categoryMap = new Map<string, any>();
  const roots: any[] = [];

  // First pass: create nodes
  categories.forEach((cat) => {
    categoryMap.set(cat._id.toString(), {
      ...cat,
      productCount: countMap.get(cat._id.toString()) || 0,
      children: [],
    });
  });

  // Second pass: link parent-child
  categories.forEach((cat) => {
    const node = categoryMap.get(cat._id.toString());
    if (cat.parent) {
      const parent = categoryMap.get(cat.parent.toString());
      if (parent) {
        parent.children.push(node);
      } else {
        // Parent inactive or missing, treat as root? Or skip?
        // If strict tree, skip. If loose, root.
        // Given isActive: true filter, if parent is inactive, it won't be in map.
        // So this category becomes orphan.
        // For public tree, we usually hide orphans of inactive parents.
      }
    } else {
      roots.push(node);
    }
  });

  // Sort children by order
  // (Assuming input was sorted by level so parents processed before children largely, but sorting children explicitly is safer)
  // Recursively sort? Or just sort before push?
  // Input sorted by order, so push order roughly correct, but explicit sort is improved.
  const sortNodes = (nodes: any[]) => {
    nodes.sort((a, b) => (a.order || 0) - (b.order || 0));
    nodes.forEach((node) => {
      if (node.children.length > 0) sortNodes(node.children);
    });
  };

  sortNodes(roots);

  res.json(roots);
});

// @desc    Get all subcategories of a category
// @route   GET /api/categories/:id/subcategories
// @access  Public
const getSubcategories = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const subcategories = await Category.find({
    parent: category._id,
    isActive: true,
  }).sort({ order: 1, name: 1 });

  res.json(subcategories);
});

// @desc    Get all categories for admin with advanced filtering
// @route   GET /api/categories/admin
// @access  Private (Admin)
const getCategoriesAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.perPage as string) || 10;
  const sortOrder = (req.query.sortOrder as string) || "desc";
  const search = req.query.search as string | undefined;

  const parentId = req.query.parent as string | undefined;
  const level = req.query.level as string | undefined;
  const productBase = req.query.productBase as string | undefined;

  // Validate page and perPage
  if (page < 1 || perPage < 1) {
    res.status(400);
    throw new Error("Page and perPage must be positive integers");
  }

  // Validate sortOrder
  if (!["asc", "desc"].includes(sortOrder)) {
    res.status(400);
    throw new Error('Sort order must be "asc" or "desc"');
  }

  // Build filter object
  const filter: any = {};

  // Search filter
  if (search && search.trim()) {
    (filter as any).name = { $regex: search.trim(), $options: "i" };
  }

  // Parent filter
  if (parentId !== undefined) {
    (filter as any).parent =
      parentId === "null" || parentId === "" ? null : parentId;
  }

  // Level filter
  if (level !== undefined) {
    (filter as any).level = parseInt(level);
  }

  // ProductBase filter
  if (productBase && productBase !== "all") {
    (filter as any).productBases = productBase;
  }

  const skip = (page - 1) * perPage;
  const total = await Category.countDocuments(filter);
  const sortValue = sortOrder === "asc" ? 1 : -1;

  const categories = await Category.find(filter)
    .populate("parent", "name slug level")
    .skip(skip)
    .limit(perPage)
    .sort({ level: 1, order: 1, createdAt: sortValue });

  // Add children count to each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const childrenCount = await Category.countDocuments({
        parent: category._id,
      });
      const productCount = await Product.countDocuments({
        $or: [
          { category: category._id },
          { category: category._id.toString() },
        ],
      });
      return {
        ...category.toObject(),
        childrenCount,
        productCount,
      };
    }),
  );

  const totalPages = Math.ceil(total / perPage);

  res.json({
    categories: categoriesWithCount,
    total,
    page,
    perPage,
    totalPages,
  });
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Private
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate(
    "parent",
    "name slug level",
  );

  if (category) {
    // Get ancestors
    const ancestors = await category.getAncestors();
    // Get children
    const children = await Category.find({ parent: category._id }).sort({
      order: 1,
      name: 1,
    });

    res.json({
      ...category.toObject(),
      ancestors,
      children,
    });
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, image, parent, order, description, productBases, isFavorite } = req.body;

  // Validate inputs
  if (!name || typeof name !== "string") {
    res.status(400);
    throw new Error("Category name is required and must be a string");
  }

  // Validate parent if provided
  if (parent) {
    const parentCategory = await Category.findById(parent);
    if (!parentCategory) {
      res.status(400);
      throw new Error("Parent category not found");
    }
    // Optional: Add max depth validation
    if (parentCategory.level >= 3) {
      res.status(400);
      throw new Error("Maximum category depth (4 levels) exceeded");
    }
  }

  // Check for duplicate name at the same level
  const duplicateFilter: any = { name };
  if (parent) {
    duplicateFilter.parent = parent;
  } else {
    duplicateFilter.parent = null;
  }
  const categoryExists = await Category.findOne(duplicateFilter);

  if (categoryExists) {
    res.status(400);
    throw new Error("Category with this name already exists at this level");
  }

  let imageUrl = "";
  if (image) {
    const folderName = `categories/${uploadService.sanitizeFolderName(name)}`;
    const result = await uploadService.uploadImage(image, {
      folder: folderName,
      originalName: `category_${name.replace(/\s+/g, "_").toLowerCase()}.jpg`,
    });
    imageUrl = result.url || "";
  }

  const category = await Category.create({
    name,
    image: imageUrl || undefined,
    icon: req.body.icon || undefined,

    parent: parent || null,
    order: order || 0,
    description: description || "",
    productBases: productBases || [],
    isFavorite: isFavorite || false,
  });

  // Populate parent before sending response
  await category.populate("parent", "name slug level");

  if (category) {
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error("Invalid category data");
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, image, parent, order, description, isActive, productBases, isFavorite } =
    req.body;

  // Validate categoryType

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  console.log(
    "updateCategory received productBases:",
    productBases,
    "for category:",
    category._id,
  );

  // Validate parent change
  if (parent !== undefined && parent !== category.parent?.toString()) {
    // Prevent circular reference
    if (parent === category._id.toString()) {
      res.status(400);
      throw new Error("Category cannot be its own parent");
    }

    // Prevent setting a descendant as parent
    if (parent) {
      const descendants = await category.getDescendants();
      const descendantIds = descendants.map((d) => d._id.toString());
      if (descendantIds.includes(parent)) {
        res.status(400);
        throw new Error("Cannot set a descendant category as parent");
      }

      // Validate parent exists
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        res.status(400);
        throw new Error("Parent category not found");
      }

      // Check max depth
      if (parentCategory.level >= 3) {
        res.status(400);
        throw new Error("Maximum category depth (4 levels) exceeded");
      }
    }

    category.parent = parent || null;
  }

  // Update other fields
  if (name) category.name = name;
  if (req.body.icon !== undefined) category.icon = req.body.icon;

  if (order !== undefined) category.order = order;
  if (description !== undefined)
    category.description = (description || "") as string;
  if (isActive !== undefined) category.isActive = isActive;
  if (isFavorite !== undefined) category.isFavorite = isFavorite;
  if (productBases !== undefined) {
    category.set("productBases", productBases);
    category.markModified("productBases");
  }

  // Handle image update
  if (image !== undefined) {
    if (image) {
      const categoryName = name || category.name || "";
      const folderName = `categories/${uploadService.sanitizeFolderName(categoryName)}`;
      const result = await uploadService.replaceImage(
        image,
        category.image || "",
        {
          folder: folderName,
          originalName: `category_${categoryName
            .replace(/\s+/g, "_")
            .toLowerCase()}.jpg`,
        },
      );
      category.image = result.url;
    } else {
      // Delete old image if clearing the field
      if (category.image) {
        try {
          await uploadService.deleteImage(category.image);
        } catch (error: any) {
          console.error(
            `Failed to delete old category image: ${(error as any).message}`,
          );
        }
      }
      category.image = undefined;
    }
  }

  const updatedCategory = await category.save();
  await updatedCategory.populate("parent", "name slug level");

  res.json(updatedCategory);
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Check if category has children
  const hasChildren = await category.hasChildren();
  if (hasChildren) {
    res.status(400);
    throw new Error(
      "Cannot delete category with subcategories. Please delete or reassign subcategories first.",
    );
  }

  // Check if category has products
  const productCount = await Product.countDocuments({
    $or: [
      { category: category._id },
      { category: category._id.toString() },
    ],
  });
  if (productCount > 0) {
    res.status(400);
    throw new Error(
      `Cannot delete category with ${productCount} associated product(s). Please reassign or delete products first.`,
    );
  }

  // Delete associated image before deleting the category
  if (category.image) {
    try {
      await uploadService.deleteImage(category.image);
    } catch (error: any) {
      console.error(
        `Failed to delete category image: ${(error as any).message}`,
      );
      // Continue with category deletion even if image deletion fails
    }
  }

  await category.deleteOne();
  res.json({
    message: "Category and associated image removed successfully",
    deletedImage: category.image || null,
  });
});

// @desc    Bulk create categories
// @route   POST /api/categories/bulk
// @access  Private/Admin
const bulkCreateCategories = asyncHandler(async (req, res) => {
  const { categories } = req.body;

  if (!Array.isArray(categories) || categories.length === 0) {
    res.status(400);
    throw new Error("Categories array is required");
  }

  const results: { successful: any[]; failed: any[] } = {
    successful: [],
    failed: [],
  };

  for (const categoryData of categories) {
    try {
      // Validate required fields
      if (!categoryData.name) {
        results.failed.push({
          data: categoryData,
          error: "Category name is required",
        });
        continue;
      }

      // Check if parent exists if provided
      if (categoryData.parent) {
        const parentCategory = await Category.findById(categoryData.parent);
        if (!parentCategory) {
          results.failed.push({
            data: categoryData,
            error: "Parent category not found",
          });
          continue;
        }

        // Check max depth
        if (parentCategory.level >= 3) {
          results.failed.push({
            data: categoryData,
            error: "Maximum category depth exceeded (max 4 levels)",
          });
          continue;
        }
      }

      // Create category
      const category = await Category.create({
        name: categoryData.name,

        parent: categoryData.parent || null,
        order: categoryData.order || 0,
        description: categoryData.description || "",
        icon: categoryData.icon || undefined,
        isActive: true,
      });

      results.successful.push(category);
    } catch (error: any) {
      results.failed.push({
        data: categoryData,
        error: (error as any).message,
      });
    }
  }

  res.status(201).json({
    message: `Bulk upload completed: ${results.successful.length} successful, ${results.failed.length} failed`,
    successful: results.successful,
    failed: results.failed,
  });
});

export {
  getCategories,
  getCategoryTree,
  getSubcategories,
  getCategoriesAdmin,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkCreateCategories,
};
