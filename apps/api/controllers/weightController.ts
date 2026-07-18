import asyncHandler from "express-async-handler";
import Weight from "../models/weightModel.js";

// @desc    Get all weights
// @route   GET /api/weights
// @access  Private
const getWeights = asyncHandler(async (req, res) => {
  const weights = await Weight.find({}).sort({ displayOrder: 1, name: 1 });
  res.json(weights);
});

// @desc    Get weight by ID
// @route   GET /api/weights/:id
// @access  Private
const getWeightById = asyncHandler(async (req, res) => {
  const weight = await Weight.findById(req.params.id);
  if (weight) {
    res.json(weight);
  } else {
    res.status(404);
    throw new Error("Weight not found");
  }
});

// @desc    Create a weight
// @route   POST /api/weights
// @access  Private/Admin
const createWeight = asyncHandler(async (req, res) => {
  const { name, value, displayOrder, priceModifier } = req.body;
  const weightExists = await Weight.findOne({ name, value });

  if (weightExists) {
    res.status(400);
    throw new Error("Weight already exists");
  }

  const weight = await Weight.create({
    name,
    value,
    displayOrder,
    priceModifier: typeof priceModifier === "number" ? priceModifier : 0,
  });
  res.status(201).json(weight);
});

// @desc    Update a weight
// @route   PUT /api/weights/:id
// @access  Private/Admin
const updateWeight = asyncHandler(async (req, res) => {
  const { name, value, displayOrder, priceModifier } = req.body;
  const weight = await Weight.findById(req.params.id);

  if (weight) {
    weight.name = name || weight.name;
    weight.value = value || weight.value;
    weight.displayOrder =
      displayOrder !== undefined ? displayOrder : weight.displayOrder;
    if (typeof priceModifier === "number") {
      weight.priceModifier = priceModifier;
    }
    const updatedWeight = await weight.save();
    res.json(updatedWeight);
  } else {
    res.status(404);
    throw new Error("Weight not found");
  }
});

// @desc    Delete a weight
// @route   DELETE /api/weights/:id
// @access  Private/Admin
const deleteWeight = asyncHandler(async (req, res) => {
  const weight = await Weight.findById(req.params.id);
  if (weight) {
    await weight.deleteOne();
    res.json({ message: "Weight removed" });
  } else {
    res.status(404);
    throw new Error("Weight not found");
  }
});

export { getWeights, getWeightById, createWeight, updateWeight, deleteWeight };
