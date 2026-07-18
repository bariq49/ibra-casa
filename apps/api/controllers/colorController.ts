import asyncHandler from "express-async-handler";
import Color from "../models/colorModel.js";

// @desc    Get all colors
// @route   GET /api/colors
// @access  Private
const getColors = asyncHandler(async (req, res) => {
  const colors = await Color.find({}).sort({ displayOrder: 1, name: 1 });
  res.json(colors);
});

// @desc    Get color by ID
// @route   GET /api/colors/:id
// @access  Private
const getColorById = asyncHandler(async (req, res) => {
  const color = await Color.findById(req.params.id);
  if (color) {
    res.json(color);
  } else {
    res.status(404);
    throw new Error("Color not found");
  }
});

// @desc    Create a color
// @route   POST /api/colors
// @access  Private/Admin
const createColor = asyncHandler(async (req, res) => {
  const { name, value, displayOrder, priceModifier } = req.body;
  const colorExists = await Color.findOne({ name });

  if (colorExists) {
    res.status(400);
    throw new Error("Color already exists");
  }

  const color = await Color.create({
    name,
    value,
    displayOrder,
    priceModifier: typeof priceModifier === "number" ? priceModifier : 0,
  });
  res.status(201).json(color);
});

// @desc    Update a color
// @route   PUT /api/colors/:id
// @access  Private/Admin
const updateColor = asyncHandler(async (req, res) => {
  const { name, value, displayOrder, priceModifier } = req.body;
  const color = await Color.findById(req.params.id);

  if (color) {
    color.name = name || color.name;
    color.value = value || color.value;
    color.displayOrder =
      displayOrder !== undefined ? displayOrder : color.displayOrder;
    if (typeof priceModifier === "number") {
      color.priceModifier = priceModifier;
    }
    const updatedColor = await color.save();
    res.json(updatedColor);
  } else {
    res.status(404);
    throw new Error("Color not found");
  }
});

// @desc    Delete a color
// @route   DELETE /api/colors/:id
// @access  Private/Admin
const deleteColor = asyncHandler(async (req, res) => {
  const color = await Color.findById(req.params.id);
  if (color) {
    await color.deleteOne();
    res.json({ message: "Color removed" });
  } else {
    res.status(404);
    throw new Error("Color not found");
  }
});

export { getColors, getColorById, createColor, updateColor, deleteColor };
