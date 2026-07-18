import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

// @desc    Global search across users, products, and orders (Admin/Internal)
// @route   GET /api/search
// @access  Private
const globalSearch = asyncHandler(async (req, res) => {
  const { query, type = "all", limit = 10 } = req.query;

  if (!query || (query as string).trim() === "") {
    res.status(400);
    throw new Error("Search query is required");
  }

  const searchQuery = (query as string).trim();
  const results = {
    users: [] as any[],
    products: [] as any[],
    orders: [] as any[],
    total: 0,
  };

  try {
    // Search Users (by name or email)
    if (type === "all" || type === "users") {
      const users = await User.find({
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
        ],
      })
        .select("_id name email avatar role employee_role")
        .limit(parseInt(limit as string))
        .lean();

      results.users = users.map((user) => ({
        ...user,
        type: "user",
        displayText: user.name,
        subText: user.email,
        route: `/dashboard/users`,
      }));
    }

    // Search Products (by name or SKU)
    if (type === "all" || type === "products") {
      const products = await Product.find({
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { sku: { $regex: searchQuery, $options: "i" } },
        ],
      })
        .select("_id name image price stock sku")
        .limit(parseInt(limit as string))
        .lean();

      results.products = products.map((product) => ({
        ...product,
        type: "product",
        displayText: product.name,
        subText: `SKU: ${(product as any).sku || "N/A"} | Stock: ${product.stock}`,
        route: `/dashboard/products`,
      }));
    }

    // Search Orders (by order ID or user email)
    if (type === "all" || type === "orders") {
      let orders = [] as any[];

      const orderSearchTerm = searchQuery.replace(/^ORD-/i, "").toUpperCase();

      if (orderSearchTerm.length >= 3) {
        const allOrders = await Order.find()
          .populate("userId", "name email")
          .limit(100)
          .sort({ createdAt: -1 })
          .lean();

        orders = allOrders
          .filter((order) => {
            const orderIdSuffix = order._id.toString().slice(-6).toUpperCase();
            return orderIdSuffix.includes(orderSearchTerm);
          })
          .slice(0, parseInt(limit as string));
      }

      results.orders = orders.map((order) => {
        const orderId = `ORD-${order._id.toString().slice(-6).toUpperCase()}`;
        const userEmail = (order.userId as any)?.email || "Unknown";
        return {
          ...order,
          orderId,
          type: "order",
          displayText: `Order #${orderId}`,
          subText: `${userEmail} - $${order.total || 0} - ${order.status}`,
          url: `/dashboard/orders?view=${order._id}`,
        };
      });
    }

    results.total =
      results.users.length + results.products.length + results.orders.length;

    res.json(results);
  } catch (error: any) {
    console.error("Search error:", error);
    res.status(500);
    throw new Error("Search failed");
  }
});

// @desc    Public search strictly for Products to execute on the eCommerce frontend
// @route   GET /api/search/public
// @access  Public
const publicSearch = asyncHandler(async (req, res) => {
  const { query, limit = 10 } = req.query;

  if (!query || (query as string).trim() === "") {
    res.status(400);
    throw new Error("Search query is required");
  }

  const searchQuery = (query as string).trim();
  const results = {
    products: [] as any[],
    total: 0,
  };

  try {
    const products = await Product.find({
      $and: [
        {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { sku: { $regex: searchQuery, $options: "i" } },
          ],
        },
        {
          $or: [
            { approvalStatus: "approved" },
            { approvalStatus: { $exists: false } },
            { approvalStatus: null },
          ],
        },
      ],
    })
      .select("_id name slug image images price stock sku discountPercentage description category brand colors sizes") // Fetch everything frontend cards need
      .populate("category", "name")
      .populate("brand", "name")
      .populate("colors", "name value slug")
      .populate("sizes", "name value slug")
      .limit(parseInt(limit as string))
      .lean();

    results.products = products;
    results.total = products.length;

    res.json(results);
  } catch (error: any) {
    console.error("Public Search error:", error);
    res.status(500);
    throw new Error("Public Search failed");
  }
});

export { globalSearch, publicSearch };
