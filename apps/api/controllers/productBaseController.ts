import asyncHandler from "express-async-handler";
import ProductBase from "../models/productBaseModel.js";

// @desc    Get all product bases
// @route   GET /api/product-bases
// @access  Public
const getProductBases = asyncHandler(async (req, res) => {
  const productBases = await ProductBase.find({}).sort({
    displayOrder: 1,
    createdAt: -1,
  });
  res.json(productBases);
});

// @desc    Get product base by ID
// @route   GET /api/product-bases/:id
// @access  Public
const getProductBaseById = asyncHandler(async (req, res) => {
  const productBase = await ProductBase.findById(req.params.id);

  if (productBase) {
    res.json(productBase);
  } else {
    res.status(404);
    throw new Error("Product base not found");
  }
});

// @desc    Create a product base
// @route   POST /api/product-bases
// @access  Private/Admin
const createProductBase = asyncHandler(async (req, res) => {
  const { title, isActive, displayOrder } = req.body;

  // Auto-generate slug from title
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");

  const productBaseExists = await ProductBase.findOne({
    $or: [{ slug }, { title }],
  });

  if (productBaseExists) {
    res.status(400);
    throw new Error("Product base with this title already exists");
  }

  const productBase = await ProductBase.create({
    title,
    slug,
    isActive: isActive !== undefined ? isActive : true,
    displayOrder: displayOrder !== undefined ? displayOrder : 0,
  });

  if (productBase) {
    res.status(201).json(productBase);
  } else {
    res.status(400);
    throw new Error("Invalid product base data");
  }
});

// @desc    Update a product base
// @route   PUT /api/product-bases/:id
// @access  Private/Admin
const updateProductBase = asyncHandler(async (req, res) => {
  const { title, slug, isActive, displayOrder } = req.body;

  const productBase = await ProductBase.findById(req.params.id);

  if (productBase) {
    // Check for conflicts if title is changing
    if (title && title !== productBase.title) {
      const conflicting = await ProductBase.findOne({
        _id: { $ne: req.params.id as any },
        $or: [
          { title },
          {
            slug: title
              .toLowerCase()
              .trim()
              .replace(/[^\w ]+/g, "")
              .replace(/ +/g, "-"),
          },
        ],
      });
      if (conflicting) {
        res.status(400);
        throw new Error("Product base with this title already exists");
      }
    }

    productBase.title = title !== undefined ? title : productBase.title;
    productBase.isActive =
      isActive !== undefined ? isActive : productBase.isActive;
    productBase.displayOrder =
      displayOrder !== undefined ? displayOrder : productBase.displayOrder;

    // Update slug if provided explicitly, otherwise regenerate from new title
    if (slug !== undefined) {
      productBase.slug = slug;
    } else if (title && title !== productBase.title) {
      productBase.slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
    }

    const updatedProductBase = await productBase.save();
    res.json(updatedProductBase);
  } else {
    res.status(404);
    throw new Error("Product base not found");
  }
});

// @desc    Delete a product base
// @route   DELETE /api/product-bases/:id
// @access  Private/Admin
const deleteProductBase = asyncHandler(async (req, res) => {
  const productBase = await ProductBase.findById(req.params.id);

  if (productBase) {
    await productBase.deleteOne();
    res.json({ message: "Product base removed successfully" });
  } else {
    res.status(404);
    throw new Error("Product base not found");
  }
});

export {
  getProductBases,
  getProductBaseById,
  createProductBase,
  updateProductBase,
  deleteProductBase,
};
