import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Product from "../models/productModel.js";
import ProductBase from "../models/productBaseModel.js";
import Category from "../models/categoryModel.js";
import Brand from "../models/brandModel.js";
import ProductType from "../models/productTypeModel.js";
import Size from "../models/sizeModel.js";
import Color from "../models/colorModel.js";
import Weight from "../models/weightModel.js";
import Vendor from "../models/vendorModel.js";
import uploadService from "../config/uploadService.js";
import {
  extractDominantColors,
  extractColorsFromUrl,
  calculateColorSimilarity,
} from "../utils/imageMatching.js";
import { getCachedProductColors } from "../utils/imageCache.js";

interface IProductQuery {
  page?: string;
  limit?: string;
  perPage?: string;
  sortOrder?: string;
  category?: string;
  brand?: string;
  priceMin?: string;
  priceMax?: string;
  search?: string;
  productBase?: string;
  excludeProductBase?: string;
  productTypes?: string;
  vendor?: string;
  approvalStatus?: string;
  sizes?: string;
  colors?: string;
  discount?: string;
  packSizes?: string;
  rating?: string;
  sortBy?: string;
}

// @desc    Get all products with pagination, sorting, and filtering
// @route   GET /api/products?page=<page>&limit=<limit>&sortOrder=<asc|desc>&category=<categoryId>&priceMin=<min>&priceMax=<max>
// @access  Public
const getProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      page = "1",
      limit,
      perPage,
      sortOrder = "asc",
      sortBy,
      category,
      brand,
      priceMin,
      priceMax,
      search,
      productBase,
      excludeProductBase,
      productTypes,
      vendor,
      approvalStatus,
      sizes,
      colors,
      discount,
      packSizes,
      rating,
    } = req.query as unknown as IProductQuery;

    // Use perPage if provided, otherwise use limit, default to 10
    const itemsPerPage = perPage || limit || "10";

    // Validate page and limit
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(itemsPerPage);
    if (pageNumber < 1 || limitNumber < 1) {
      res.status(400);
      throw new Error("Page and limit must be positive integers");
    }

    // Validate sortOrder
    if (sortOrder && !["asc", "desc"].includes(sortOrder!)) {
      res.status(400);
      throw new Error('Sort order must be "asc" or "desc"');
    }

    // Build query
    const query: any = {};

    // Handle approval status filter
    if (approvalStatus) {
      query.approvalStatus = approvalStatus;
    } else {
      // Default: Show products that are either approved OR don't have approvalStatus field (legacy/admin products)
      // Only hide pending and rejected vendor products
      query.$or = [
        { approvalStatus: "approved" },
        { approvalStatus: { $exists: false } },
        { approvalStatus: null },
      ];
    }

    // Handle category filter - check if it's an ObjectId or slug(s)
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const slugs = category.split(",");
        const categoryDocs = await Category.find({ slug: { $in: slugs } });
        if (categoryDocs.length > 0) {
          query.category = { $in: categoryDocs.map((doc) => doc._id) };
        } else {
          query.category = null; // Force empty result if category slug doesn't exist
        }
      }
    }

    // Handle brand filter - check if it's an ObjectId or slug(s)
    if (brand) {
      if (brand.match(/^[0-9a-fA-F]{24}$/)) {
        query.brand = brand;
      } else {
        const slugs = brand.split(",");
        const brandDocs = await Brand.find({ slug: { $in: slugs } });
        if (brandDocs.length > 0) {
          query.brand = { $in: brandDocs.map((doc) => doc._id) };
        } else {
          query.brand = null; // Force empty result if brand slug doesn't exist
        }
      }
    }

    // Handle productBase filter - check if it's an ObjectId or slug
    if (productBase) {
      if (productBase.match(/^[0-9a-fA-F]{24}$/)) {
        query.productBase = productBase;
      } else {
        const slugs = productBase.split(",");
        const productBaseDocs = await ProductBase.find({
          slug: { $in: slugs },
        });
        if (productBaseDocs.length > 0) {
          query.productBase = { $in: productBaseDocs.map((doc) => doc._id) };
        }
      }
    }

    if (excludeProductBase) {
      if (excludeProductBase.match(/^[0-9a-fA-F]{24}$/)) {
        query.productBase = { $ne: excludeProductBase };
      } else {
        const slugs = excludeProductBase.split(",");
        const excludeProductBaseDocs = await ProductBase.find({
          slug: { $in: slugs },
        });
        if (excludeProductBaseDocs.length > 0) {
          query.productBase = {
            $nin: excludeProductBaseDocs.map((doc) => doc._id),
          };
        }
      }
    }

    // Use productTypes directly mapped to ProductType document ObjectIDs
    if (productTypes) {
      const slugs = productTypes.split(",");
      // Only fetch _id — lean() for maximum speed
      const productTypeDocs = await ProductType.find(
        { slug: { $in: slugs } },
        { _id: 1 }
      ).lean();
      if (productTypeDocs.length > 0) {
        query.productTypes = { $in: productTypeDocs.map((pt) => pt._id) };
      } else {
        query.productTypes = null; // Force 0 results if the type doesn't exist
      }
    }

    // Handle vendor filter
    if (vendor === "no-vendor") {
      // Filter to show only admin products (no vendor)
      query.vendor = { $in: [null, undefined] };
    } else if (vendor === "vendor-products") {
      // Filter to show all vendor products (any vendor)
      query.vendor = { $exists: true, $ne: null };
    } else if (vendor) {
      // Filter by specific vendor ID
      query.vendor = vendor;
    }

    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) {
        query.price.$lte =
          Number(priceMax) === Infinity
            ? Number.MAX_SAFE_INTEGER
            : Number(priceMax);
      }
    }

    if (search) {
      query.name = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    if (discount) {
      const discountRanges = discount.split(",");
      const orConditions = discountRanges.map((range) => {
        if (range.endsWith("-")) {
            // e.g "25-"
            return { discountPercentage: { $gte: Number(range.replace("-", "")) } };
        } else {
            // e.g "5-10"
            const [min, max] = range.split("-").map(Number);
            return { discountPercentage: { $gte: min, $lte: max } };
        }
      });
      
      if (query.$or) {
         query.$and = [{ $or: query.$or }, { $or: orConditions }];
         delete query.$or;
      } else {
         query.$or = orConditions;
      }
    }

    if (sizes) {
       const slugs = sizes.split(",").map(s => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
       const sizeDocs = await Size.find({ slug: { $in: slugs } });
       if (sizeDocs.length > 0) {
          query.sizes = { $in: sizeDocs.map(doc => doc._id) };
       } else {
          query.sizes = null;
       }
    }

    if (colors) {
       const slugs = colors.split(",").map(c => c.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
       const colorDocs = await Color.find({ slug: { $in: slugs } });
       if (colorDocs.length > 0) {
          query.colors = { $in: colorDocs.map(doc => doc._id) };
       } else {
          query.colors = null;
       }
    }

    if (packSizes) {
       const slugs = packSizes.split(",").map(p => p.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
       const weightDocs = await Weight.find({ slug: { $in: slugs } });
       if (weightDocs.length > 0) {
          query.weights = { $in: weightDocs.map(doc => doc._id) };
       } else {
          query.weights = null;
       }
    }

    // Pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch products and total count
    let sortObj: any = { createdAt: sortOrder === "asc" ? 1 : -1 };
    
    if (sortBy === "price-low") sortObj = { price: 1 };
    else if (sortBy === "price-high") sortObj = { price: -1 };
    else if (sortBy === "rating") sortObj = { averageRating: -1 };
    else if (sortBy === "default") sortObj = { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        // Exclude heavy arrays that are never needed in product listing cards
        .select("-views -ratings -reviews")
        .populate("category", "name")
        .populate("brand", "name")
        .populate("vendor", "storeName")
        .populate("productBase", "title slug")
        .populate("productTypes", "title name slug")
        .populate("sizes", "name value slug priceModifier")
        .populate("colors", "name value slug priceModifier")
        .populate("weights", "name value slug priceModifier")
        .populate("badge", "name slug displayOrder")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNumber)
        // lean() returns plain JS objects — ~50% faster, no Mongoose document overhead
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      total,
    });
  },
);

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    let product;

    // Check if it's a valid MongoDB ObjectId
    const isValidObjectId =
      typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId) {
      // Try to find by ID first
      product = await Product.findById(id)
        .populate("category", "name")
        .populate("brand", "name")
        .populate("productBase", "title slug")
        .populate("productTypes", "title name slug")
        .populate("sizes", "name value slug priceModifier")
        .populate("colors", "name value slug priceModifier")
        .populate("weights", "name value slug priceModifier")
        .populate("badge", "name slug displayOrder");
    }

    // If not found by ID or not a valid ObjectId, try to find by slug
    if (!product) {
      product = await Product.findOne({ slug: id })
        .populate("category", "name")
        .populate("brand", "name")
        .populate("productBase", "title slug")
        .populate("productTypes", "title name slug")
        .populate("sizes", "name value slug priceModifier")
        .populate("colors", "name value slug priceModifier")
        .populate("weights", "name value slug priceModifier")
        .populate("badge", "name slug displayOrder");
    }

    if (product) {
      // Public product page: never expose pending reviews or pending replies
      const productObj = product.toObject();
      productObj.reviews = (productObj.reviews || [])
        .filter(
          (review: { isApproved?: boolean }) => review.isApproved !== false,
        )
        .map((review: any) => ({
          ...review,
          replies: (review.replies || []).filter(
            (reply: { isApproved?: boolean }) => reply.isApproved !== false,
          ),
        }));
      res.json(productObj);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  },
);

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    const {
      name,
      description,
      price,
      category,
      brand,
      image,
      images,
      discountPercentage,
      stock,
      purchasedQuantity,
      productBase,
      productTypes,
      sizes,
      colors,
      weights,
      badge,
      isNewItem,
      faqs,
    } = req.body;

    // Check if product with same name exists
    const productExists = await Product.findOne({
      $or: [{ name }, ...(req.body.slug ? [{ slug: req.body.slug }] : [])],
    });
    if (productExists) {
      res.status(400);
      const field = productExists.name === name ? "name" : "slug";
      throw new Error(`Product with this ${field} already exists`);
    }

    // Get max images from environment or default to 6
    const maxImages = parseInt(process.env.MAX_PRODUCT_IMAGES || "6") || 6;

    // Handle images array if provided, otherwise use single image
    let uploadedImages: string[] = [];

    if (images && Array.isArray(images) && images.length > 0) {
      // Limit to max images
      const imagesToUpload = images.slice(0, maxImages);

      // Upload all images
      for (let i = 0; i < imagesToUpload.length; i++) {
        const folderName = `products/${uploadService.sanitizeFolderName(name)}`;
        const result = await uploadService.uploadImage(imagesToUpload[i], {
          folder: folderName,
          originalName: `product_${name.replace(/\s+/g, "_").toLowerCase()}_${i + 1}.jpg`,
        });
        if (result.url) {
          uploadedImages.push(result.url);
        }
      }
    } else if (image) {
      // Backward compatibility: if single image provided, use it
      const folderName = `products/${uploadService.sanitizeFolderName(name)}`;
      const result = await uploadService.uploadImage(image, {
        folder: folderName,
        originalName: `product_${name.replace(/\s+/g, "_").toLowerCase()}.jpg`,
      });
      if (result.url) {
        uploadedImages.push(result.url);
      }
    }

    // Ensure at least one image
    if (uploadedImages.length === 0) {
      res.status(400);
      throw new Error("At least one product image is required");
    }

    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }

    // Determine approval status based on user role
    const approvalStatus = req.user.role === "vendor" ? "pending" : "approved";

    // Get vendor ID if user is a vendor
    let vendorId: any = undefined;
    if (req.user.role === "vendor") {
      const vendor = await Vendor.findOne({ userId: req.user._id });
      if (vendor) {
        vendorId = vendor._id;
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      discountPercentage: discountPercentage || 0,
      stock: stock || 0,
      purchasedQuantity: purchasedQuantity || 0,
      images: uploadedImages,
      image: uploadedImages[0], // Set first image as primary
      bg: req.body.bg, // Added bg field
      productBase: productBase || undefined,
      productTypes: productTypes || [],
      slug: req.body.slug,
      approvalStatus,
      vendor: vendorId,
      sizes: sizes || [],
      colors: colors || [],
      weights: weights || [],
      badge: badge || undefined,
      isNewItem: isNewItem || false,
      faqs: Array.isArray(faqs)
        ? faqs
            .filter(
              (f: { question?: string; answer?: string }) =>
                f?.question?.trim() && f?.answer?.trim(),
            )
            .map((f: { question: string; answer: string }) => ({
              question: f.question.trim(),
              answer: f.answer.trim(),
            }))
        : [],
    });

    if (product) {
      res.status(201).json(product);
    } else {
      res.status(400);
      throw new Error("Invalid product data");
    }
  },
);

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    const {
      name,
      description,
      price,
      category,
      brand,
      image,
      bg,
      images,
      discountPercentage,
      stock,
      purchasedQuantity,
      productBase,
      productTypes,
      sizes,
      colors,
      weights,
      badge,
      isNewItem,
      faqs,
    } = req.body;

    const product = await Product.findById(req.params.id as string);

    if (product) {
      // Check if new name or slug is already taken by another product
      const nameChanged = name && name !== product.name;
      const slugChanged = req.body.slug && req.body.slug !== product.slug;

      if (nameChanged || slugChanged) {
        const query: any = { _id: { $ne: product._id } };
        const orConditions: any[] = [];
        if (nameChanged) orConditions.push({ name });
        if (slugChanged) orConditions.push({ slug: req.body.slug });

        if (orConditions.length > 0) {
          query.$or = orConditions;
          const productExists = await Product.findOne(query);
          if (productExists) {
            res.status(400);
            const field = productExists.name === name ? "name" : "slug";
            throw new Error(`Product with this ${field} already exists`);
          }
        }
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.discountPercentage =
        discountPercentage !== undefined
          ? discountPercentage
          : product.discountPercentage;
      product.stock = stock !== undefined ? stock : product.stock;
      product.purchasedQuantity =
        purchasedQuantity !== undefined
          ? purchasedQuantity
          : product.purchasedQuantity;
      if (productBase !== undefined) product.productBase = productBase;
      product.productTypes = productTypes || product.productTypes;
      product.slug = req.body.slug || product.slug;
      product.sizes = sizes || product.sizes;
      product.colors = colors || product.colors;
      product.weights = weights || product.weights;
      product.badge = badge || product.badge;
      if (isNewItem !== undefined) product.isNewItem = isNewItem;
      if (bg !== undefined) product.bg = bg;
      if (faqs !== undefined) {
        product.faqs = Array.isArray(faqs)
          ? faqs
              .filter(
                (f: { question?: string; answer?: string }) =>
                  f?.question?.trim() && f?.answer?.trim(),
              )
              .map((f: { question: string; answer: string }) => ({
                question: f.question.trim(),
                answer: f.answer.trim(),
              }))
          : [];
      }

      // Get max images from environment or default to 6
      const maxImages = parseInt(process.env.MAX_PRODUCT_IMAGES || "6") || 6;

      // Update images if provided
      if (images && Array.isArray(images) && images.length > 0) {
        const uploadedImages: string[] = [];
        const oldImages = product.images || [product.image];

        // Limit to max images
        const imagesToProcess = images.slice(0, maxImages);

        for (let i = 0; i < imagesToProcess.length; i++) {
          const img = imagesToProcess[i];

          // If image URL is already in product images, keep it (no re-upload)
          if (oldImages.includes(img)) {
            uploadedImages.push(img);
          } else {
            // New image - upload it
            try {
              const productName = name || product.name || "";
              const folderName = `products/${uploadService.sanitizeFolderName(productName)}`;
              const result = await uploadService.uploadImage(img, {
                folder: folderName,
                originalName: `product_${productName
                  .replace(/\s+/g, "_")
                  .toLowerCase()}_${i + 1}.jpg`,
              });
              if (result.url) {
                uploadedImages.push(result.url);
              }
            } catch (error: any) {
              console.error("Error uploading image:", error);
              // Continue with other images even if one fails
            }
          }
        }

        // Clean up old images that are no longer used
        const imagesToDelete = oldImages.filter(
          (oldImg) => !uploadedImages.includes(oldImg),
        );
        for (const oldImg of imagesToDelete) {
          try {
            await uploadService.deleteImage(oldImg);
          } catch (error: any) {
            console.error("Error deleting old image:", error);
            // Continue even if deletion fails
          }
        }

        if (uploadedImages.length > 0) {
          product.images = uploadedImages;
          product.image = uploadedImages[0]; // Set first image as primary
        }
      } else if (image && image !== product.image) {
        // Backward compatibility: single image update
        const productName = name || product.name || "";
        const folderName = `products/${uploadService.sanitizeFolderName(productName)}`;
        const result = await uploadService.replaceImage(image, product.image, {
          folder: folderName,
          originalName: `product_${productName
            .replace(/\s+/g, "_")
            .toLowerCase()}.jpg`,
        });
        if (result.url) {
          product.image = result.url;
          product.images = [result.url];
        }
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  },
);

// @desc    Rate a product
// @route   POST /api/products/:id/rate
// @access  Private
const rateProduct = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    const { rating } = req.body;
    const product = await Product.findById(req.params.id as string);

    if (product) {
      if (!req.user) {
        res.status(401);
        throw new Error("Not authorized");
      }

      const alreadyRated = product.ratings.find(
        (r) => r.userId.toString() === req.user._id.toString(),
      );

      if (alreadyRated) {
        // Update existing rating
        alreadyRated.rating = rating;
      } else {
        // Add new rating
        product.ratings.push({
          userId: req.user._id,
          rating,
        });
      }

      await product.save();
      res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  },
);

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const product = await Product.findById(req.params.id as string);

    if (product) {
      // Delete associated image before deleting the product
      if (product.image) {
        try {
          await uploadService.deleteImage(product.image);
        } catch (error: any) {
          console.error(`Failed to delete product image: ${error.message}`);
          // Continue with product deletion even if image deletion fails
        }
      }

      await product.deleteOne();
      res.json({
        message: "Product and associated image removed successfully",
        deletedImage: product.image || null,
      });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  },
);

// @desc    Track product view
// @route   POST /api/products/:id/view
// @access  Public
const trackProductView = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    try {
      // Use atomic update to avoid version conflicts
      const updateData = {
        $inc: { viewCount: 1 },
        $push: {
          views: {
            userId: req.user?._id || null,
            viewedAt: new Date(),
          },
        },
      };

      const product = await Product.findByIdAndUpdate(
        req.params.id as string,
        updateData,
        {
          new: true,
          runValidators: false,
        },
      );

      if (product) {
        res.json({ viewCount: product.viewCount });
      } else {
        res.status(404);
        throw new Error("Product not found");
      }
    } catch (error: any) {
      console.error("Error tracking product view:", error);
      res.status(500);
      throw new Error("Failed to track product view");
    }
  },
);

// @desc    Add a product review (logged-in or guest)
// @route   POST /api/products/:id/review
// @access  Public
const addProductReview = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id as string);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (!rating || !comment) {
      res.status(400);
      throw new Error("Please provide both rating and comment");
    }

    if (rating < 1 || rating > 5) {
      res.status(400);
      throw new Error("Rating must be between 1 and 5");
    }

    // Initialize reviews array if it doesn't exist
    if (!product.reviews) {
      product.reviews = [] as any;
    }

    const isAnonymous = Boolean(req.body.isAnonymous);
    const guestEmail = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const guestName = String(req.body.name || "").trim();

    // Guests (and non-anonymous) must provide name + email
    if (!req.user && !isAnonymous) {
      if (!guestName || !guestEmail) {
        res.status(400);
        throw new Error("Please provide your name and email");
      }
    }

    if (!isAnonymous && guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      res.status(400);
      throw new Error("Please provide a valid email address");
    }

    // Prevent duplicate reviews: by userId when logged in, otherwise by email
    const alreadyReviewed = product.reviews.find((r: any) => {
      if (req.user && r.userId) {
        return r.userId.toString() === req.user._id.toString();
      }
      if (!isAnonymous && guestEmail && r.userEmail) {
        return String(r.userEmail).toLowerCase() === guestEmail;
      }
      return false;
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("You have already reviewed this product");
    }

    const displayName = isAnonymous
      ? "Anonymous"
      : guestName || req.user?.name || "Customer";

    const review: any = {
      userName: displayName,
      rating: Number(rating),
      comment,
      isApproved: false, // Pending until admin verifies
      createdAt: new Date(),
      likes: [],
      dislikes: [],
      replies: [],
    };

    if (req.user) {
      review.userId = req.user._id;
      if (!isAnonymous) {
        review.userEmail = guestEmail || req.user.email;
      }
    } else if (!isAnonymous && guestEmail) {
      review.userEmail = guestEmail;
    }

    product.reviews.push(review as any);

    // Backfill primary image from gallery if missing (legacy products)
    if (!product.image && product.images?.length) {
      product.image = product.images[0];
    }

    await product.save({ validateModifiedOnly: true });

    // Return the persisted subdocument so the client gets a real `_id`
    const savedReview = product.reviews[product.reviews.length - 1];

    res.status(201).json({
      message:
        "Review submitted successfully. It will appear after admin approval.",
      review: savedReview,
    });
  },
);

// @desc    Like or Unlike a product review
// @route   POST /api/products/:productId/review/:reviewId/like
// @access  Public
/** Strip pending replies before returning a review to the storefront */
const sanitizeReviewForPublic = (review: any) => {
  const obj = review.toObject ? review.toObject() : { ...review };
  obj.replies = (obj.replies || []).filter(
    (r: { isApproved?: boolean }) => r.isApproved !== false,
  );
  return obj;
};

const likeProductReview = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    const product = await Product.findById(req.params.productId as string);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const review = product.reviews.id(req.params.reviewId as string) as any;
    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    const actorId = req.user?._id?.toString() || String(req.body.guestId || "").trim();
    if (!actorId) {
      res.status(400);
      throw new Error("Missing guest id");
    }

    if (!review.likes) review.likes = [];
    if (!review.dislikes) review.dislikes = [];

    // Normalize legacy ObjectId likes to strings
    review.likes = review.likes.map((id: any) => id.toString());
    review.dislikes = review.dislikes.map((id: any) => id.toString());

    const hasLiked = review.likes.includes(actorId);

    if (hasLiked) {
      review.likes = review.likes.filter((id: string) => id !== actorId);
    } else {
      review.likes.push(actorId);
      review.dislikes = review.dislikes.filter((id: string) => id !== actorId);
    }

    await product.save({ validateModifiedOnly: true });
    const publicReview = sanitizeReviewForPublic(review);
    res.json({ message: hasLiked ? "Review unliked" : "Review liked", review: publicReview });
  },
);

// @desc    Dislike or un-dislike a product review
// @route   POST /api/products/:productId/review/:reviewId/dislike
// @access  Public
const dislikeProductReview = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    const product = await Product.findById(req.params.productId as string);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const review = product.reviews.id(req.params.reviewId as string) as any;
    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    const actorId = req.user?._id?.toString() || String(req.body.guestId || "").trim();
    if (!actorId) {
      res.status(400);
      throw new Error("Missing guest id");
    }

    if (!review.likes) review.likes = [];
    if (!review.dislikes) review.dislikes = [];

    review.likes = review.likes.map((id: any) => id.toString());
    review.dislikes = review.dislikes.map((id: any) => id.toString());

    const hasDisliked = review.dislikes.includes(actorId);

    if (hasDisliked) {
      review.dislikes = review.dislikes.filter((id: string) => id !== actorId);
    } else {
      review.dislikes.push(actorId);
      review.likes = review.likes.filter((id: string) => id !== actorId);
    }

    await product.save({ validateModifiedOnly: true });
    res.json({
      message: hasDisliked ? "Review un-disliked" : "Review disliked",
      review: sanitizeReviewForPublic(review),
    });
  },
);

// @desc    Reply to a product review
// @route   POST /api/products/:productId/review/:reviewId/reply
// @access  Public (guests must provide name + email; replies need admin approval)
const replyProductReview = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    const { comment } = req.body;
    const product = await Product.findById(req.params.productId as string);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const review = product.reviews.id(req.params.reviewId as string) as any;
    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    if (!comment?.trim()) {
      res.status(400);
      throw new Error("Please provide a reply comment");
    }

    const isLoggedIn = Boolean(req.user?._id);
    const guestName = String(req.body.name || "").trim();
    const guestEmail = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!isLoggedIn) {
      if (!guestName || !guestEmail) {
        res.status(400);
        throw new Error("Please provide your name and email to reply");
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        res.status(400);
        throw new Error("Please provide a valid email address");
      }
    }

    const reply: any = {
      userName: isLoggedIn ? req.user.name : guestName,
      userEmail: isLoggedIn ? req.user.email : guestEmail,
      comment: comment.trim(),
      // Guests always pending; logged-in replies are approved
      isApproved: isLoggedIn,
      createdAt: new Date(),
    };

    if (isLoggedIn) {
      reply.userId = req.user._id;
    }

    review.replies.push(reply);
    await product.save({ validateModifiedOnly: true });

    const savedReply = review.replies[review.replies.length - 1];

    res.status(201).json({
      message: isLoggedIn
        ? "Reply added successfully"
        : "Reply submitted. It will appear after admin approval.",
      review: sanitizeReviewForPublic(review),
      reply: savedReply,
    });
  },
);

// Helper to flatten product reviews into admin/public list items
const mapProductReviews = (
  products: any[],
  filter?: (review: any) => boolean,
) => {
  const mapped: any[] = [];
  products.forEach((product) => {
    product.reviews.forEach((review: any) => {
      if (filter && !filter(review)) return;
      mapped.push({
        productId: product._id,
        productName: product.name,
        productImage: product.image,
        reviewId: review._id,
        userId: review.userId,
        userName: review.userName,
        userEmail: review.userEmail || null,
        rating: review.rating,
        comment: review.comment,
        isApproved: review.isApproved,
        likesCount: review.likes?.length || 0,
        dislikesCount: review.dislikes?.length || 0,
        repliesCount: review.replies?.length || 0,
        createdAt: review.createdAt,
      });
    });
  });
  mapped.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return mapped;
};

// @desc    Get all reviews (Admin)
// @route   GET /api/products/reviews/all
// @access  Private/Admin
const getAllReviews = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const products = await Product.find({
      "reviews.0": { $exists: true },
    }).select("name reviews image");

    res.json(mapProductReviews(products));
  },
);

// @desc    Get pending reviews (Admin)
// @route   GET /api/products/reviews/pending
// @access  Private/Admin
const getPendingReviews = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const products = await Product.find({
      reviews: { $elemMatch: { isApproved: false } },
    }).select("name reviews image");

    res.json(mapProductReviews(products, (review) => !review.isApproved));
  },
);

// @desc    Get approved reviews (public + admin)
// @route   GET /api/products/reviews/approved
// @access  Public
const getApprovedReviews = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const products = await Product.find({
      reviews: { $elemMatch: { isApproved: true } },
    }).select("name reviews image");

    res.json(mapProductReviews(products, (review) => review.isApproved));
  },
);

// @desc    Get pending review replies (Admin)
// @route   GET /api/products/reviews/replies/pending
// @access  Private/Admin
const getPendingReplies = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const products = await Product.find({
      "reviews.replies": { $elemMatch: { isApproved: false } },
    }).select("name reviews image");

    const pending: any[] = [];
    products.forEach((product) => {
      product.reviews.forEach((review: any) => {
        (review.replies || []).forEach((reply: any) => {
          if (reply.isApproved === false) {
            pending.push({
              productId: product._id,
              productName: product.name,
              reviewId: review._id,
              reviewComment: review.comment,
              replyId: reply._id,
              userId: reply.userId || null,
              userName: reply.userName,
              userEmail: reply.userEmail || null,
              comment: reply.comment,
              isApproved: reply.isApproved,
              createdAt: reply.createdAt,
            });
          }
        });
      });
    });

    pending.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    res.json(pending);
  },
);

// @desc    Approve/Reject a review reply (Admin)
// @route   PUT /api/products/:productId/review/:reviewId/reply/:replyId
// @access  Private/Admin
const approveReply = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { approve } = req.body;
    const product = await Product.findById(req.params.productId as string);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const review = product.reviews.id(req.params.reviewId as string) as any;
    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    const reply = review.replies.id(req.params.replyId as string) as any;
    if (!reply) {
      res.status(404);
      throw new Error("Reply not found");
    }

    if (approve) {
      reply.isApproved = true;
      await product.save({ validateModifiedOnly: true });
      res.json({ message: "Reply approved successfully", reply });
    } else {
      review.replies.pull(req.params.replyId as string);
      await product.save({ validateModifiedOnly: true });
      res.json({ message: "Reply rejected and removed" });
    }
  },
);

// @desc    Approve/Reject product review
// @route   PUT /api/products/:productId/review/:reviewId
// @access  Private/Admin
const approveReview = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { approve } = req.body; // true to approve, false to reject
    const product = await Product.findById(req.params.productId as string);

    if (product) {
      const review = product.reviews.id(req.params.reviewId as string);

      if (review) {
        if (approve) {
          review.isApproved = true;
          await product.save({ validateModifiedOnly: true });
          res.json({ message: "Review approved successfully", review });
        } else {
          // Remove the review if rejected
          product.reviews.pull(req.params.reviewId as string);
          await product.save({ validateModifiedOnly: true });
          res.json({ message: "Review rejected and removed" });
        }
      } else {
        res.status(404);
        throw new Error("Review not found");
      }
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  },
);

// @desc    Get pending products (Admin)
// @route   GET /api/products/pending
// @access  Private/Admin
const getPendingProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const products = await Product.find({ approvalStatus: "pending" })
      .populate("category", "name")
      .populate("brand", "name")
      .populate("vendor", "storeName contactEmail")
      .populate("productBase", "title slug");

    res.json({
      success: true,
      count: products.length,
      products,
    });
  },
);

// @desc    Get vendor products (Admin: all vendor products, Vendor: own products)
// @route   GET /api/products/vendor (Admin)
// @route   GET /api/products/vendor/me (Vendor)
// @access  Private/Admin or Private/Vendor
const getVendorProducts = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }

    // If admin is requesting, get all vendor products
    if (req.user.role === "admin") {
      const { status, vendor } = req.query;

      // Build query filter
      const filter: any = { vendor: { $exists: true } };

      // Add status filter if provided
      if (status && status !== "all") {
        filter.approvalStatus = status;
      }

      // Add vendor filter if provided
      if (vendor && vendor !== "all") {
        filter.vendor = vendor;
      }

      const products = await Product.find(filter)
        .populate("category", "name")
        .populate("brand", "name")
        .populate("vendor", "businessName email")
        .populate("productBase", "title slug")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: products.length,
        products,
      });
      return;
    }

    // If vendor is requesting, get their own products
    const Vendor = (await import("../models/vendorModel.js")).default;
    const vendor = await Vendor.findOne({ userId: req.user._id });

    if (!vendor) {
      res.status(404);
      throw new Error("Vendor profile not found");
    }

    const products = await Product.find({ vendor: vendor._id })
      .populate("category", "name")
      .populate("brand", "name")
      .populate("productBase", "title slug")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  },
);

// @desc    Approve/Reject product (for vendor products)
// @route   PUT /api/products/:id/approve
// @route   PUT /api/products/:id/approval
// @access  Private/Admin
const approveProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { approve, approvalStatus } = req.body;
    const product = await Product.findById(req.params.id as string);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Handle both formats: { approve: true/false } and { approvalStatus: "approved"/"rejected" }
    if (approvalStatus) {
      product.approvalStatus = approvalStatus;
      await product.save();
      res.json({
        message: `Product ${approvalStatus} successfully`,
        product,
      });
    } else if (approve !== undefined) {
      product.approvalStatus = approve ? "approved" : "rejected";
      await product.save();
      res.json({
        message: `Product ${approve ? "approved" : "rejected"} successfully`,
        product,
      });
    } else {
      res.status(400);
      throw new Error("Please provide either 'approve' or 'approvalStatus'");
    }
  },
);

// @desc    Bulk create products
// @route   POST /api/products/bulk
// @access  Private/Admin
const bulkCreateProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      res.status(400);
      throw new Error("Products array is required");
    }

    if (products.length > 100) {
      res.status(400);
      throw new Error("Cannot upload more than 100 products at once");
    }

    const results = {
      successful: [] as any[],
      failed: [] as any[],
    };

    for (const [index, productData] of products.entries()) {
      try {
        // Validate required fields
        if (
          !productData.name ||
          !productData.description ||
          !productData.category ||
          !productData.brand
        ) {
          results.failed.push({
            index: index + 1,
            data: productData,
            error: "Missing required fields",
          });
          continue;
        }

        // Check if product already exists
        const existingProduct = await Product.findOne({
          name: productData.name,
        });
        if (existingProduct) {
          results.failed.push({
            index: index + 1,
            data: productData,
            error: `Product "${productData.name}" already exists`,
          });
          continue;
        }

        // Create product
        const product = await Product.create({
          name: productData.name,
          description: productData.description,
          price: productData.price || 0,
          discountPercentage: productData.discountPercentage || 0,
          stock: productData.stock || 0,
          category: productData.category,
          brand: productData.brand,
          images: productData.images || [],
          image: productData.images?.[0] || "",
          productBase: productData.productBase || undefined,
        });

        results.successful.push({
          index: index + 1,
          product: product,
        });
      } catch (error: any) {
        results.failed.push({
          index: index + 1,
          data: productData,
          error: error.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully created ${results.successful.length} of ${products.length} products`,
      results,
    });
  },
);

// @desc    Search products by image
// @route   POST /api/products/search-by-image
// @access  Public
const searchProductsByImage = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    // Check if image was uploaded
    if (!req.file) {
      res.status(400);
      throw new Error("Please upload an image");
    }

    try {
      // Extract dominant colors from uploaded image
      const uploadedImageColors = await extractDominantColors(req.file.buffer);

      if (uploadedImageColors.length === 0) {
        console.warn("Could not extract colors from uploaded image");
      }

      // Get all products with images
      const allProducts = await Product.find({
        image: { $exists: true, $ne: "" },
      })
        .populate("category", "name")
        .populate("brand", "name")
        .populate("productBase", "title slug")
        .select(
          "name description price image images category brand stock averageRating numReviews discountPercentage",
        )
        .lean();

      // Calculate similarity for each product
      const productsWithSimilarity = await Promise.all(
        allProducts.map(async (product) => {
          try {
            // Extract colors from product's main image (with caching)
            const productColors = await getCachedProductColors(
              product.image,
              extractColorsFromUrl,
            );

            if (productColors.length === 0) {
              return { ...product, similarity: 0 };
            }

            // Calculate similarity score
            const similarity = calculateColorSimilarity(
              uploadedImageColors,
              productColors,
            );

            return { ...product, similarity };
          } catch (error: any) {
            console.error(
              `Error processing product ${product._id}:`,
              error.message,
            );
            return { ...product, similarity: 0 };
          }
        }),
      );

      // Sort by similarity (highest first) and filter out low similarity scores
      const similarProducts = productsWithSimilarity
        .filter((product) => product.similarity > 60) // Only products with >60% similarity (stricter matching)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 8); // Return top 8 matches

      // If less than 3 very similar products, try relaxed threshold
      if (similarProducts.length < 3) {
        const relaxedProducts = productsWithSimilarity
          .filter((product) => product.similarity > 45)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 8);

        // If still no matches, return empty result - don't show unrelated products
        if (relaxedProducts.length === 0) {
          res.json({
            products: [],
            total: 0,
            message:
              "No matching products found for this image. Please try uploading a product image.",
            similaritySearch: false,
          });
          return;
        }

        // Use relaxed results
        const cleanProducts = relaxedProducts.map(
          ({ similarity, ...product }) => ({
            ...product,
            matchScore: Math.round(similarity),
          }),
        );

        res.json({
          products: cleanProducts,
          total: cleanProducts.length,
          message: "Products with moderate visual similarity",
          similaritySearch: true,
        });
        return;
      }

      // Remove similarity field before sending response
      const cleanProducts = similarProducts.map(
        ({ similarity, ...product }) => ({
          ...product,
          matchScore: Math.round(similarity), // Include match score for reference
        }),
      );

      res.json({
        products: cleanProducts,
        total: cleanProducts.length,
        message: "Products matched by visual similarity",
        similaritySearch: true,
      });
    } catch (error: any) {
      console.error("Image search error:", error);

      // Return empty result on error - don't show unrelated products
      res.json({
        products: [],
        total: 0,
        message:
          "Image analysis failed. Please try again with a different image.",
        error: error.message,
        similaritySearch: false,
      });
    }
  },
);

export {
  getProducts,
  getProductById,
  getProductById as getSingleProduct,
  createProduct,
  updateProduct,
  rateProduct,
  deleteProduct,
  trackProductView,
  addProductReview,
  likeProductReview,
  dislikeProductReview,
  replyProductReview,
  getAllReviews,
  getPendingReviews,
  getApprovedReviews,
  getPendingReplies,
  approveReply,
  approveReview,
  getPendingProducts,
  getVendorProducts,
  approveProduct,
  bulkCreateProducts,
  searchProductsByImage,
};
