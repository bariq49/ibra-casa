import asyncHandler from "express-async-handler";
import Badge from "../models/badgeModel.js";

// @desc    Get all badges
// @route   GET /api/badges
// @access  Private
const getBadges = asyncHandler(async (req, res) => {
  const badges = await Badge.find({}).sort({ displayOrder: 1, name: 1 });
  res.json(badges);
});

// @desc    Get badge by ID
// @route   GET /api/badges/:id
// @access  Private
const getBadgeById = asyncHandler(async (req, res) => {
  const badge = await Badge.findById(req.params.id);
  if (badge) {
    res.json(badge);
  } else {
    res.status(404);
    throw new Error("Badge not found");
  }
});

// @desc    Create a badge
// @route   POST /api/badges
// @access  Private/Admin
const createBadge = asyncHandler(async (req, res) => {
  const { name, displayOrder } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Name is required");
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const badgeExists = await Badge.findOne({ slug });

  if (badgeExists) {
    res.status(400);
    throw new Error("Badge with this name/slug already exists");
  }

  const badge = await Badge.create({ name, slug, displayOrder });
  res.status(201).json(badge);
});

// @desc    Update a badge
// @route   PUT /api/badges/:id
// @access  Private/Admin
const updateBadge = asyncHandler(async (req, res) => {
  const { name, displayOrder } = req.body;
  const badge = await Badge.findById(req.params.id);

  if (badge) {
    if (name) {
      badge.name = name;
      badge.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    badge.displayOrder =
      displayOrder !== undefined ? displayOrder : badge.displayOrder;

    const updatedBadge = await badge.save();
    res.json(updatedBadge);
  } else {
    res.status(404);
    throw new Error("Badge not found");
  }
});

// @desc    Delete a badge
// @route   DELETE /api/badges/:id
// @access  Private/Admin
const deleteBadge = asyncHandler(async (req, res) => {
  const badge = await Badge.findById(req.params.id);
  if (badge) {
    await badge.deleteOne();
    res.json({ message: "Badge removed" });
  } else {
    res.status(404);
    throw new Error("Badge not found");
  }
});

export { getBadges, getBadgeById, createBadge, updateBadge, deleteBadge };
