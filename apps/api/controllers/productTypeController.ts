import asyncHandler from "express-async-handler";
import ProductType from "../models/productTypeModel.js";
import ProductBase from "../models/productBaseModel.js";
import uploadService from "../config/uploadService.js";

// @desc    Get all product types
// @route   GET /api/product-types
// @access  Public
const getProductTypes = asyncHandler(async (req, res) => {
  const { productBase } = req.query;
  const filter: any = { isActive: true };

  // Filter by productBase slug if provided
  if (productBase) {
    const base = await ProductBase.findOne({
      slug: productBase as string,
      isActive: true,
    });
    if (base) {
      filter.productBases = { $in: [base._id] };
    } else {
      res.json([]);
      return;
    }
  }

  // Filter by productType slug if provided
  const { slug } = req.query;
  if (slug) {
    filter.slug = slug as string;
  }

  const productTypes = await ProductType.find(filter).sort({
    displayOrder: 1,
    createdAt: -1,
  });
  res.json(productTypes);
});

// @desc    Get all product types for admin with advanced filtering
// @route   GET /api/product-types/admin
// @access  Private (Admin)
const getProductTypesAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.perPage as string) || 10;
  const sortOrder = (req.query.sortOrder as string) || "desc";
  const search = req.query.search as string;
  const isActive = req.query.isActive as string;
  const productBase = req.query.productBase as string;

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
    filter.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // Active filter
  if (isActive !== undefined && isActive !== "") {
    filter.isActive = isActive === "true";
  }

  // productBase filter
  if (productBase && productBase.trim()) {
    filter.productBases = productBase.trim();
  }

  const skip = (page - 1) * perPage;
  const total = await ProductType.countDocuments(filter);
  const sortValue = sortOrder === "asc" ? 1 : -1;

  const productTypes = await ProductType.find(filter)
    .skip(skip)
    .limit(perPage)
    .sort({ createdAt: sortValue });

  const totalPages = Math.ceil(total / perPage);

  res.json({ productTypes, total, page, perPage, totalPages });
});

// @desc    Get product type by ID
// @route   GET /api/product-types/:id
// @access  Public
const getProductTypeById = asyncHandler(async (req, res) => {
  const productType = await ProductType.findById(req.params.id);

  if (productType) {
    res.json(productType);
  } else {
    res.status(404);
    throw new Error("Product type not found");
  }
});

// @desc    Create a product type
// @route   POST /api/product-types
// @access  Private/Admin
const createProductType = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      title,
      description,
      banner,
      bannerImages,
      isActive,
      displayOrder,
      bgColor,
      productBasesBg,
      productBases,
    } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");

    // Check if product type already exists
    const typeExists = await ProductType.findOne({
      $or: [{ name }, { slug }],
    });

    if (typeExists) {
      res.status(400);
      throw new Error("Product type with this name already exists");
    }

    // Upload banner image if provided
    let uploadedBanner = "";
    if (banner) {
      const result = await uploadService.uploadImage(banner as string, {
        folder: "product-types/banners",
        originalName: `${slug}_banner_main.jpg`,
      });
      uploadedBanner = result.url || "";
    }

    // Upload banner images if provided
    let uploadedBannerImages: string[] = [];
    if (
      bannerImages &&
      Array.isArray(bannerImages) &&
      bannerImages.length > 0
    ) {
      for (const [index, image] of bannerImages.entries()) {
        const result = await uploadService.uploadImage(image as string, {
          folder: "product-types/banners",
          originalName: `${slug}_banner_${index + 1}.jpg`,
        });
        uploadedBannerImages.push(result.url || "");
      }
    }

    const productType = await ProductType.create({
      name,
      slug,
      title: title || "",
      description: description || "",
      banner: uploadedBanner,
      bannerImages: uploadedBannerImages,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
      bgColor: bgColor || "#ffffff",
      productBasesBg: productBasesBg || {},
      productBases: productBases || [],
    });

    if (productType) {
      res.status(201).json(productType);
    } else {
      res.status(400);
      throw new Error("Invalid product type data");
    }
  } catch (error: any) {
    console.error("Error creating product type:", error);
    throw error;
  }
});

// @desc    Update a product type
// @route   PUT /api/product-types/:id
// @access  Private/Admin
const updateProductType = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      title,
      description,
      banner,
      bannerImages,
      isActive,
      displayOrder,
      bgColor,
      productBasesBg,
      productBases,
    } = req.body;

    const productType = await ProductType.findById(req.params.id);

    if (productType) {
      // Check if name is being changed and conflicts with another product type
      if (name && name !== productType.name) {
        const conflictingType = await ProductType.findOne({
          _id: { $ne: req.params.id as any },
          $or: [
            ...(name ? [{ name }] : []),
            ...(name
              ? [
                  {
                    slug: name
                      .toLowerCase()
                      .trim()
                      .replace(/[^\w ]+/g, "")
                      .replace(/ +/g, "-"),
                  },
                ]
              : []),
          ],
        });

        if (conflictingType) {
          res.status(400);
          throw new Error("Product type with this name already exists");
        }
      }

      // Capture old name for slug check
      const nameChanged = name && name !== productType.name;

      productType.name = name || productType.name;
      productType.title = title !== undefined ? title : productType.title;
      productType.description =
        description !== undefined ? description : productType.description;
      productType.isActive =
        isActive !== undefined ? isActive : productType.isActive;
      productType.displayOrder =
        displayOrder !== undefined ? displayOrder : productType.displayOrder;
      productType.bgColor =
        bgColor !== undefined ? bgColor : productType.bgColor;
      if (productBasesBg !== undefined) {
        productType.productBasesBg = productBasesBg;
      }
      productType.productBases =
        productBases !== undefined ? productBases : productType.productBases;

      // Update slug if name changed
      if (nameChanged) {
        productType.slug = productType.name
          .toLowerCase()
          .trim()
          .replace(/[^\w ]+/g, "")
          .replace(/ +/g, "-");
      }

      // Handle main banner image update
      if (banner !== undefined) {
        if (banner) {
          const result = await uploadService.replaceImage(
            banner as string,
            productType.banner || "",
            {
              folder: "product-types/banners",
              originalName: `${productType.slug}_banner_main.jpg`,
            },
          );
          productType.banner = result.url || "";
        } else {
          // Delete old banner
          if (productType.banner) {
            try {
              await uploadService.deleteImage(productType.banner);
            } catch (error: any) {
              console.error(`Failed to delete old banner: ${error.message}`);
            }
          }
          productType.banner = "";
        }
      }

      // Handle banner images update
      if (bannerImages !== undefined) {
        if (Array.isArray(bannerImages) && bannerImages.length > 0) {
          // Delete old banner images
          if (productType.bannerImages && productType.bannerImages.length > 0) {
            for (const oldImage of productType.bannerImages) {
              try {
                await uploadService.deleteImage(oldImage);
              } catch (error: any) {
                console.error(
                  `Failed to delete old banner image: ${error.message}`,
                );
              }
            }
          }

          // Upload new banner images
          const uploadedBannerImages: string[] = [];
          for (const [index, image] of (bannerImages as string[]).entries()) {
            const result = await uploadService.uploadImage(image as string, {
              folder: "product-types/banners",
              originalName: `${productType.slug}_banner_${index + 1}.jpg`,
            });
            uploadedBannerImages.push(result.url || "");
          }
          productType.bannerImages = uploadedBannerImages;
        } else {
          // Clear banner images
          if (productType.bannerImages && productType.bannerImages.length > 0) {
            for (const oldImage of productType.bannerImages) {
              try {
                await uploadService.deleteImage(oldImage);
              } catch (error: any) {
                console.error(
                  `Failed to delete old banner image: ${error.message}`,
                );
              }
            }
          }
          productType.bannerImages = [];
        }
      }

      const updatedProductType = await productType.save();
      res.json(updatedProductType);
    } else {
      res.status(404);
      throw new Error("Product type not found");
    }
  } catch (error: any) {
    console.error("Error updating product type:", error);
    throw error;
  }
});

// @desc    Delete a product type
// @route   DELETE /api/product-types/:id
// @access  Private/Admin
const deleteProductType = asyncHandler(async (req, res) => {
  const productType = await ProductType.findById(req.params.id);

  if (productType) {
    // Delete associated banner image
    if (productType.banner) {
      try {
        await uploadService.deleteImage(productType.banner);
      } catch (error: any) {
        console.error(`Failed to delete banner: ${error.message}`);
      }
    }

    // Delete associated banner images
    if (productType.bannerImages && productType.bannerImages.length > 0) {
      for (const image of productType.bannerImages) {
        try {
          await uploadService.deleteImage(image);
        } catch (error: any) {
          console.error(`Failed to delete banner image: ${error.message}`);
        }
      }
    }

    await productType.deleteOne();
    res.json({
      message: "Product type and associated images removed successfully",
    });
  } else {
    res.status(404);
    throw new Error("Product type not found");
  }
});

export {
  getProductTypes,
  getProductTypesAdmin,
  getProductTypeById,
  createProductType,
  updateProductType,
  deleteProductType,
};
