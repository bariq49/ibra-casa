import asyncHandler from "express-async-handler";
import Size from "../models/sizeModel.js";

// @desc    Get all sizes
// @route   GET /api/sizes
// @access  Private
const getSizes = asyncHandler(async (req, res) => {
  const sizes = await Size.find({}).sort({ displayOrder: 1, name: 1 });
  res.json(sizes);
});

// @desc    Get size by ID
// @route   GET /api/sizes/:id
// @access  Private
const getSizeById = asyncHandler(async (req, res) => {
  const size = await Size.findById(req.params.id);
  if (size) {
    res.json(size);
  } else {
    res.status(404);
    throw new Error("Size not found");
  }
});

// @desc    Create a size
// @route   POST /api/sizes
// @access  Private/Admin
const createSize = asyncHandler(async (req, res) => {
  const { name, value, displayOrder, priceModifier } = req.body;
  const sizeExists = await Size.findOne({ name, value });

  if (sizeExists) {
    res.status(400);
    throw new Error("Size already exists");
  }

  const size = await Size.create({
    name,
    value,
    displayOrder,
    priceModifier: typeof priceModifier === "number" ? priceModifier : 0,
  });
  res.status(201).json(size);
});

// @desc    Update a size
// @route   PUT /api/sizes/:id
// @access  Private/Admin
const updateSize = asyncHandler(async (req, res) => {
  const { name, value, displayOrder, priceModifier } = req.body;
  const size = await Size.findById(req.params.id);

  if (size) {
    size.name = name || size.name;
    size.value = value || size.value;
    size.displayOrder =
      displayOrder !== undefined ? displayOrder : size.displayOrder;
    if (typeof priceModifier === "number") {
      size.priceModifier = priceModifier;
    }
    const updatedSize = await size.save();
    res.json(updatedSize);
  } else {
    res.status(404);
    throw new Error("Size not found");
  }
});

// @desc    Delete a size
// @route   DELETE /api/sizes/:id
// @access  Private/Admin
const deleteSize = asyncHandler(async (req, res) => {
  const size = await Size.findById(req.params.id);
  if (size) {
    await size.deleteOne();
    res.json({ message: "Size removed" });
  } else {
    res.status(404);
    throw new Error("Size not found");
  }
});

export { getSizes, getSizeById, createSize, updateSize, deleteSize };
