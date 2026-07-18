import asyncHandler from "express-async-handler";
import Coupon from "../models/couponModel.js";

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.perPage as string) || 10;
  const search = req.query.search as string | undefined;

  const filter: any = {};
  if (search && search.trim()) {
    filter.$or = [
      { code: { $regex: search.trim(), $options: "i" } },
      { name: { $regex: search.trim(), $options: "i" } }
    ];
  }

  const skip = (page - 1) * perPage;
  const total = await Coupon.countDocuments(filter);

  const coupons = await Coupon.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage);

  const totalPages = Math.ceil(total / perPage);

  res.json({ coupons, total, page, perPage, totalPages });
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (coupon) {
    res.json(coupon);
  } else {
    res.status(404);
    throw new Error("Coupon not found");
  }
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    discountType,
    discountValue,
    minPurchaseAmount,
    startDate,
    endDate,
    usageLimit,
    isActive,
  } = req.body;

  const couponExists = await Coupon.findOne({ name: name.trim() });

  if (couponExists) {
    res.status(400);
    throw new Error("Coupon with this name already exists");
  }

  const coupon = await Coupon.create({
    name: name.trim(),
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minPurchaseAmount,
    startDate,
    endDate,
    usageLimit,
    isActive,
  });

  if (coupon) {
    res.status(201).json(coupon);
  } else {
    res.status(400);
    throw new Error("Invalid coupon data");
  }
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    discountType,
    discountValue,
    minPurchaseAmount,
    startDate,
    endDate,
    usageLimit,
    isActive,
  } = req.body;

  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    if (name && name.trim() !== coupon.name) {
      const existing = await Coupon.findOne({ name: name.trim() });
      if (existing && existing._id.toString() !== coupon._id.toString()) {
        res.status(400);
        throw new Error("Another coupon with this name already exists");
      }
      coupon.name = name.trim();
    }

    if (code !== undefined) coupon.code = code.toUpperCase();

    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minPurchaseAmount !== undefined) coupon.minPurchaseAmount = minPurchaseAmount;
    if (startDate !== undefined) coupon.startDate = startDate;
    
    // Explicit condition checking since it could be null/cleared
    coupon.endDate = endDate !== undefined ? endDate : coupon.endDate;
    coupon.usageLimit = usageLimit !== undefined ? usageLimit : coupon.usageLimit;
    
    if (isActive !== undefined) coupon.isActive = isActive;

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } else {
    res.status(404);
    throw new Error("Coupon not found");
  }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await coupon.deleteOne();
    res.json({ message: "Coupon removed" });
  } else {
    res.status(404);
    throw new Error("Coupon not found");
  }
});

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, purchaseAmount } = req.body;

  if (!code) {
    res.status(400);
    throw new Error("Coupon code is required");
  }

  const coupons = await Coupon.find({ code: code.toUpperCase() });

  if (!coupons || coupons.length === 0) {
    res.status(404);
    throw new Error("Invalid coupon code");
  }

  const now = new Date();
  let validCoupon = null;
  let lastError = "Invalid coupon";

  for (const coupon of coupons) {
    if (!coupon.isActive) {
      lastError = "This coupon is no longer active";
      continue;
    }

    if (coupon.startDate && new Date(coupon.startDate) > now) {
      lastError = "This coupon is not yet valid";
      continue;
    }

    if (coupon.endDate && new Date(coupon.endDate) < now) {
      lastError = "This coupon has expired";
      continue;
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      lastError = "This coupon has reached its usage limit";
      continue;
    }

    if (purchaseAmount !== undefined && coupon.minPurchaseAmount && purchaseAmount < coupon.minPurchaseAmount) {
      lastError = `Minimum purchase amount of ৳${coupon.minPurchaseAmount} required`;
      continue;
    }

    validCoupon = coupon;
    break;
  }

  if (!validCoupon) {
    res.status(400);
    throw new Error(lastError);
  }

  res.json({
    message: "Coupon is valid",
    coupon: {
      _id: validCoupon._id,
      name: validCoupon.name,
      code: validCoupon.code,
      discountType: validCoupon.discountType,
      discountValue: validCoupon.discountValue,
    }
  });
});

export {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
