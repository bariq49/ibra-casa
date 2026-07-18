import asyncHandler from "express-async-handler";
import Banner from "../models/bannerModel.js";
import uploadService from "../config/uploadService.js";

// @desc    Get all banners
// @route   GET /api/banners
// @access  Private
const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({}).sort({ weight: 1 });
  res.json(banners);
});

// @desc    Get all banners for admin with advanced filtering
// @route   GET /api/banners/admin
// @access  Private (Admin)
const getBannersAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.perPage as string) || 10;
  const sortOrder = (req.query.sortOrder as string) || "desc";
  const search = req.query.search as string | undefined;
  const bannerType = req.query.bannerType as string | undefined;

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
      { title: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // Banner type filter
  if (bannerType && bannerType !== "all") {
    filter.bannerType = bannerType;
  }

  // Banner page filter
  if (req.query.bannerPage && req.query.bannerPage !== "all") {
    filter.bannerPage = req.query.bannerPage;
  }

  const skip = (page - 1) * perPage;
  const total = await Banner.countDocuments(filter);
  const sortValue = sortOrder === "asc" ? 1 : -1;

  const banners = await Banner.find(filter)
    .skip(skip)
    .limit(perPage)
    .sort({ createdAt: sortValue });

  const totalPages = Math.ceil(total / perPage);

  res.json({ banners, total, page, perPage, totalPages });
});

// @desc    Get banner by ID
// @route   GET /api/banners/:id
// @access  Private
const getBannerById = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (banner) {
    res.json(banner);
  } else {
    res.status(404);
    throw new Error("Banner not found");
  }
});

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = asyncHandler(async (req, res) => {
  const {
    name,
    title,
    description,
    buttonTitle,
    buttonHref,
    startFrom,
    image,
    bannerType,
    bannerPage,
    discount,
    bgColor,
    textColor,
    weight,
  } = req.body;

  // const bannerExists = await User.findOne({ name });
  // if (bannerExists) {
  //   res.status(400);
  //   throw new Error("Same banner already exists");
  // }

  let imageUrl = "";
  if (image) {
    const folderName = `banners/${uploadService.sanitizeFolderName(name)}`;
    const result = await uploadService.uploadImage(image, {
      folder: folderName,
      originalName: `banner_${name.replace(/\s+/g, "_").toLowerCase()}.jpg`,
    });
    if (result.url) {
      imageUrl = result.url;
    } else {
      res.status(500);
      throw new Error("Failed to upload image - no URL returned");
    }
  }

  const banner = new Banner({
    name,
    title,
    description,
    buttonTitle,
    buttonHref,
    startFrom,
    image: imageUrl || undefined,
    bannerType,
    bannerPage,
    discount,
    bgColor,
    textColor,
    weight: weight || 0,
  });

  const createdBanner = await banner.save();
  if (createdBanner) {
    res.status(201).json(createdBanner);
  } else {
    res.status(400);
    throw new Error("Invalid banner data");
  }
});

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = asyncHandler(async (req, res) => {
  const {
    name,
    title,
    description,
    buttonTitle,
    buttonHref,
    startFrom,
    image,
    bannerType,
    discount,
    bgColor,
    textColor,
    weight,
  } = req.body;

  const banner = await Banner.findById(req.params.id);

  if (banner) {
    banner.name = name || banner.name;
    banner.title = title || banner.title;
    banner.description =
      description !== undefined ? description : banner.description;
    banner.buttonTitle =
      buttonTitle !== undefined ? buttonTitle : banner.buttonTitle;
    banner.buttonHref =
      buttonHref !== undefined ? buttonHref : banner.buttonHref;
    banner.startFrom = startFrom || banner.startFrom;
    banner.bannerType = bannerType || banner.bannerType;
    banner.bannerPage = req.body.bannerPage || banner.bannerPage;
    banner.discount = discount !== undefined ? discount : banner.discount;
    banner.bgColor = bgColor !== undefined ? bgColor : banner.bgColor;
    banner.textColor = textColor !== undefined ? textColor : banner.textColor;
    banner.weight = weight !== undefined ? weight : banner.weight;

    try {
      if (image !== undefined) {
        if (image) {
          const bannerName = name || banner.name || "";
          const folderName = `banners/${uploadService.sanitizeFolderName(bannerName)}`;
          const result = await uploadService.replaceImage(
            image,
            banner.image || "",
            {
              folder: folderName,
              originalName: `banner_${bannerName
                .replace(/\s+/g, "_")
                .toLowerCase()}.jpg`,
            },
          );
          if (result.url) {
            banner.image = result.url;
          } else {
            res.status(500);
            throw new Error("Failed to upload image - no URL returned");
          }
        } else {
          // Delete old image if clearing the field
          if (banner.image) {
            try {
              await uploadService.deleteImage(banner.image);
            } catch (error: any) {
              console.error(
                `Failed to delete old banner image: ${error instanceof Error ? error.message : String(error)}`,
              );
            }
          }
          banner.image = undefined; // Clear image if empty string is provided
        }
      }
      const updatedBanner = await banner.save();
      res.json(updatedBanner);
    } catch (error: any) {
      if (error instanceof Error && error.name === "ValidationError") {
        const errors = Object.values((error as any).errors).map(
          (err: any) => err.message,
        );
        res.status(400);
        throw new Error(errors.join(", "));
      }
      res.status(400);
      throw new Error("Invalid banner data");
    }
  } else {
    res.status(404);
    throw new Error("Banner not found");
  }
});

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (banner) {
    // Delete associated image before deleting the banner
    if (banner.image) {
      try {
        await uploadService.deleteImage(banner.image);
      } catch (error: any) {
        console.error(
          `Failed to delete banner image: ${error instanceof Error ? error.message : String(error)}`,
        );
        // Continue with banner deletion even if image deletion fails
      }
    }

    await banner.deleteOne();
    res.json({
      message: "Banner and associated image removed successfully",
      deletedImage: banner.image || null,
    });
  } else {
    res.status(404);
    throw new Error("Banner not found");
  }
});

// @desc    Reorder banners (Update weights)
// @route   POST /api/banners/reorder
// @access  Private/Admin
const reorderBanners = asyncHandler(async (req, res) => {
  const { banners } = req.body;

  if (!Array.isArray(banners)) {
    res.status(400);
    throw new Error("Invalid banners data. Expected an array.");
  }

  const updatePromises = banners.map((b: { _id: string; weight: number }) =>
    Banner.findByIdAndUpdate(b._id, { weight: b.weight }),
  );

  await Promise.all(updatePromises);

  res.json({ message: "Banners reordered successfully" });
});

export {
  getBanners,
  getBannersAdmin,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
};
