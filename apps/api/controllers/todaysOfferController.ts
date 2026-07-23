import asyncHandler from "express-async-handler";
import TodaysOffer from "../models/todaysOfferModel.js";

const PRODUCT_POPULATE = [
  { path: "category", select: "name slug" },
  { path: "brand", select: "name slug" },
  { path: "productTypes", select: "title name slug" },
  { path: "sizes", select: "name value slug priceModifier" },
  { path: "colors", select: "name value slug priceModifier" },
  { path: "weights", select: "name value slug priceModifier" },
];

async function getOrCreateOffer() {
  let offer = await TodaysOffer.findOne();
  if (!offer) {
    offer = await TodaysOffer.create({
      title: "Today's Top Offer",
      description: "Up to 69% discount for limited time 🔥",
      products: [],
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: true,
    });
  }
  return offer;
}

// @desc    Get today's offer (public storefront)
// @route   GET /api/todays-offer
// @access  Public
export const getTodaysOffer = asyncHandler(async (_req, res) => {
  const offer = await getOrCreateOffer();
  await offer.populate({
    path: "products",
    populate: PRODUCT_POPULATE,
  });

  const products = (offer.products || []).filter(
    (p: any) => p && (p.isActive !== false),
  );

  res.json({
    _id: offer._id,
    title: offer.title,
    description: offer.description,
    endsAt: offer.endsAt,
    isActive: offer.isActive,
    bgColor: offer.bgColor || "#F4F3F5",
    products,
  });
});

// @desc    Get today's offer for admin (includes inactive products)
// @route   GET /api/todays-offer/admin
// @access  Admin
export const getTodaysOfferAdmin = asyncHandler(async (_req, res) => {
  const offer = await getOrCreateOffer();
  await offer.populate({
    path: "products",
    populate: PRODUCT_POPULATE,
  });

  res.json({
    _id: offer._id,
    title: offer.title,
    description: offer.description,
    endsAt: offer.endsAt,
    isActive: offer.isActive,
    bgColor: offer.bgColor || "#F4F3F5",
    products: offer.products || [],
    productIds: (offer.products || []).map((p: any) =>
      typeof p === "object" && p?._id ? String(p._id) : String(p),
    ),
  });
});

// @desc    Update today's offer
// @route   PUT /api/todays-offer
// @access  Admin
export const updateTodaysOffer = asyncHandler(async (req, res) => {
  const { title, description, products, endsAt, isActive, bgColor } = req.body;
  const offer = await getOrCreateOffer();

  if (title !== undefined) offer.title = String(title).trim();
  if (description !== undefined) offer.description = String(description).trim();
  if (bgColor !== undefined) offer.bgColor = String(bgColor).trim();
  if (Array.isArray(products)) {
    offer.products = products.filter(Boolean);
  }
  if (endsAt !== undefined) {
    const date = new Date(endsAt);
    if (Number.isNaN(date.getTime())) {
      res.status(400);
      throw new Error("Invalid endsAt date");
    }
    offer.endsAt = date;
  }
  if (isActive !== undefined) offer.isActive = Boolean(isActive);

  await offer.save();
  await offer.populate({
    path: "products",
    populate: PRODUCT_POPULATE,
  });

  res.json({
    _id: offer._id,
    title: offer.title,
    description: offer.description,
    endsAt: offer.endsAt,
    isActive: offer.isActive,
    bgColor: offer.bgColor || "#F4F3F5",
    products: offer.products || [],
    productIds: (offer.products || []).map((p: any) =>
      typeof p === "object" && p?._id ? String(p._id) : String(p),
    ),
  });
});
