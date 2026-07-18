import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import User, { IUserDocument } from "../models/userModel.js";
import Product from "../models/productModel.js";

// Helper to populate all cart subdocuments
const populateCart = async (user: IUserDocument) => {
  return await user.populate([
    { 
      path: "cart.productId", 
      model: "Product",
      populate: {
        path: "category",
        model: "Category"
      }
    },
    { path: "cart.colorId", model: "Color" },
    { path: "cart.sizeId", model: "Size" }
  ]);
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req: any, res: Response) => {
  const { page = "1", limit = "10" } = req.query;

  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await populateCart(user);

  // Filter out any cart items with null/deleted products
  const validCartItems = user.cart.filter((item: any) => item.productId);

  // Pagination logic
  const pageNumber = parseInt(page as string);
  const limitNumber = parseInt(limit as string);
  const skip = (pageNumber - 1) * limitNumber;
  const totalItems = validCartItems.length;
  const totalPages = Math.ceil(totalItems / limitNumber);

  // Get paginated items
  const paginatedItems = validCartItems.slice(skip, skip + limitNumber);

  res.json({
    success: true,
    cart: paginatedItems,
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalItems,
      hasMore: pageNumber < totalPages,
      limit: limitNumber,
    },
    message: "Cart retrieved successfully",
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addItemToCart = asyncHandler(async (req: any, res: Response) => {
  const { productId, quantity = 1, colorId, sizeId } = req.body;

  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  if (quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if identical item (same product & exact variant) already exists in cart
  const existingItemIndex = user.cart.findIndex((item) => {
    const matchProduct = item.productId.toString() === productId;
    const matchColor = colorId ? item.colorId?.toString() === colorId : !item.colorId;
    const matchSize = sizeId ? item.sizeId?.toString() === sizeId : !item.sizeId;
    return matchProduct && matchColor && matchSize;
  });

  if (existingItemIndex > -1) {
    // Update quantity if item exists
    const newQuantity =
      user.cart[existingItemIndex].quantity + parseInt(quantity);

    // Check stock availability
    if (newQuantity > product.stock) {
      res.status(400);
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    user.cart[existingItemIndex].quantity = newQuantity;
  } else {
    // Check stock availability for new item
    if (parseInt(quantity) > product.stock) {
      res.status(400);
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    // Add new item to cart
    const newItem: any = {
      productId,
      quantity: parseInt(quantity),
    };
    if (colorId) newItem.colorId = colorId;
    if (sizeId) newItem.sizeId = sizeId;

    user.cart.push(newItem);
  }

  await user.save();

  // Populate the cart for response
  await populateCart(user);

  // Filter out any cart items with null/deleted products
  const validCartItems = user.cart.filter((item: any) => item.productId);

  res.json({
    success: true,
    cart: validCartItems,
    message: "Item added to cart successfully",
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart
// @access  Private
export const updateCartItem = asyncHandler(async (req: any, res: Response) => {
  const { productId, cartItemId, quantity } = req.body;
  // Fallback to productId for backwards compatibility 
  const idToMatch = cartItemId || productId;

  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  if (!idToMatch) {
    res.status(400);
    throw new Error("Cart Item ID or Product ID is required");
  }

  if (quantity < 0) {
    res.status(400);
    throw new Error("Quantity cannot be negative");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const itemIndex = user.cart.findIndex(
    (item: any) => 
      item._id.toString() === idToMatch || 
      item.productId.toString() === idToMatch
  );

  if (itemIndex > -1) {
    const rawProductId = user.cart[itemIndex].productId;
    // Check stock availability
    const product = await Product.findById(rawProductId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (quantity > 0 && quantity > product.stock) {
      res.status(400);
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      user.cart.splice(itemIndex, 1);
    } else {
      // Update quantity
      user.cart[itemIndex].quantity = parseInt(quantity as string);
    }
    await user.save();

    // Populate the cart for response
    await populateCart(user);

    // Filter out any cart items with null/deleted products
    const validCartItems = user.cart.filter((item: any) => item.productId);

    res.json({
      success: true,
      cart: validCartItems,
      message: "Cart item updated successfully",
    });
  } else {
    res.status(404);
    throw new Error("Item not found in cart");
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId 
// Note: Route remains :productId but accepts _id from the subdocument natively
// @access  Private
export const removeItemFromCart = asyncHandler(async (req: any, res: Response) => {
  const idToMatch = req.params.productId; // can be cartItemId or productId

  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  if (!idToMatch) {
    res.status(400);
    throw new Error("Item ID is required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const itemIndex = user.cart.findIndex(
    (item: any) => 
      item._id.toString() === idToMatch || 
      item.productId.toString() === idToMatch
  );

  if (itemIndex > -1) {
    user.cart.splice(itemIndex, 1);
    await user.save();

    // Populate the cart for response
    await populateCart(user);

    // Filter out any cart items with null/deleted products
    const validCartItems = user.cart.filter((item: any) => item.productId);

    res.json({
      success: true,
      cart: validCartItems,
      message: "Item removed from cart successfully",
    });
  } else {
    res.status(404);
    throw new Error("Item not found in cart");
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req: any, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.cart = [] as any;
  await user.save();

  res.json({
    success: true,
    cart: [],
    message: "Cart cleared successfully",
  });
});

// @desc    Get abandoned carts
// @route   GET /api/cart/abandoned
// @access  Private/Admin
export const getAbandonedCarts = asyncHandler(async (req: any, res: Response) => {
  const { page = "1", limit = "10", interval = "7days", search } = req.query;
  const pageNumber = parseInt(page as string);
  const limitNumber = parseInt(limit as string);

  let dateFilter = {};
  const now = new Date();
  
  if (interval !== "all") {
    let pastDate = new Date();
    switch (interval) {
      case "live":
        pastDate.setHours(now.getHours() - 24);
        break;
      case "7days":
        pastDate.setDate(now.getDate() - 7);
        break;
      case "10days":
        pastDate.setDate(now.getDate() - 10);
        break;
      case "30days":
        pastDate.setDate(now.getDate() - 30);
        break;
      case "3months":
        pastDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        pastDate.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        pastDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        pastDate.setDate(now.getDate() - 7);
    }
    dateFilter = { updatedAt: { $gte: pastDate } };
  }

  let searchQuery = {};
  if (search) {
    searchQuery = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
  }

  const conditions: any[] = [
    { "cart.0": { $exists: true } }, // Users with at least one item in cart
    { role: { $nin: ["admin", "employee"] } },
  ];

  if (Object.keys(dateFilter).length > 0) {
    conditions.push(dateFilter as any);
  }

  if (Object.keys(searchQuery).length > 0) {
    conditions.push(searchQuery as any);
  }

  const query = {
    $and: conditions,
  };

  const users = await User.find(query)
    .populate({
      path: "cart.productId",
      model: "Product",
      select: "name price image slug",
    })
    .sort({ updatedAt: -1 })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limitNumber);

  const abandonedCarts = users.map((user) => {
    const validItems = user.cart.filter((item: any) => item.productId);
    const totalQuantity = validItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = validItems.reduce(
      (acc, item: any) => acc + item.productId.price * item.quantity,
      0
    );

    return {
      _id: user._id,
      customerName: user.name,
      customerEmail: user.email,
      customerAvatar: user.avatar,
      items: validItems,
      totalQuantity,
      totalAmount,
      lastActive: (user as any).updatedAt,
    };
  }).filter((cart) => cart.items.length > 0);

  res.json({
    success: true,
    abandonedCarts,
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalItems: totalUsers,
      hasMore: pageNumber < totalPages,
      limit: limitNumber,
    },
  });
});
