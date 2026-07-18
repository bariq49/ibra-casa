import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Brand from "../models/brandModel.js";
import Order from "../models/orderModel.js";

// @desc    Get dashboard stats
// @route   GET /api/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
  const usersCount = await User.countDocuments();
  const productsCount = await Product.countDocuments();
  const categoriesCount = await Category.countDocuments();
  const brandsCount = await Brand.countDocuments();
  const ordersCount = await Order.countDocuments();

  // Total revenue from delivered/completed/paid orders
  const revenueData = await Order.aggregate([
    { $match: { status: { $in: ["paid", "completed", "delivered"] } } },
    { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
  ]);
  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  // Order status breakdown
  const orderStatusData = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const orderStatusMap: Record<string, number> = {};
  for (const row of orderStatusData) {
    if (row._id) orderStatusMap[row._id] = row.count;
  }

  // Monthly revenue for the requested year (default = current year)
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const monthlyRevenueData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31T23:59:59`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        sales: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Build full 12-month array (fill zeros for missing months)
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyRevenue = MONTHS.map((name, i) => {
    const found = monthlyRevenueData.find((d) => d._id === i + 1);
    return { name, sales: found?.sales || 0, orders: found?.orders || 0 };
  });

  // User roles distribution
  const roles = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  // Category distribution
  const categoryData = await Product.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: "$categoryInfo" },
    { $group: { _id: "$categoryInfo.name", count: { $sum: 1 } } },
  ]);

  // Brand distribution
  const brandData = await Product.aggregate([
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brandInfo",
      },
    },
    { $unwind: "$brandInfo" },
    { $group: { _id: "$brandInfo.name", count: { $sum: 1 } } },
  ]);

  // Additional actionable actionable stats
  const abandonedCartsCount = await User.countDocuments({
    "cart.0": { $exists: true },
    role: { $nin: ["admin", "employee"] },
  });
  const paymentFailuresCount = await Order.countDocuments({
    paymentStatus: "failed",
  });
  const refundRequestsCount = await Order.countDocuments({
    paymentStatus: "refunded",
  });

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const shippingDelaysCount = await Order.countDocuments({
    status: "delivering",
    updatedAt: { $lt: fiveDaysAgo },
  } as any);

  res.json({
    counts: {
      users: usersCount,
      products: productsCount,
      categories: categoriesCount,
      brands: brandsCount,
      orders: ordersCount,
      totalRevenue,
      abandonedCarts: abandonedCartsCount,
      paymentFailures: paymentFailuresCount,
      refundRequests: refundRequestsCount,
      shippingDelays: shippingDelaysCount,
    },
    orderStatus: {
      pending: orderStatusMap["pending"] || 0,
      confirmed: orderStatusMap["confirmed"] || 0,
      delivering: orderStatusMap["delivering"] || 0,
      delivered: orderStatusMap["delivered"] || 0,
      completed: orderStatusMap["completed"] || 0,
      cancelled: orderStatusMap["cancelled"] || 0,
      paid: orderStatusMap["paid"] || 0,
      address_confirmed: orderStatusMap["address_confirmed"] || 0,
      packed: orderStatusMap["packed"] || 0,
    },
    monthlyRevenue,
    year,
    roles: roles.map((r) => ({ name: r._id, value: r.count })),
    categories: categoryData.map((c) => ({ name: c._id, value: c.count })),
    brands: brandData.map((b) => ({ name: b._id, value: b.count })),
  });
});

// @desc    Get low stock products
// @route   GET /api/stats/low-stock
// @access  Private
const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold =
    req.query.threshold === "all"
      ? Number.MAX_SAFE_INTEGER
      : parseInt(req.query.threshold as string) || 10;
  const limit = parseInt(req.query.limit as string) || 10;

  const products = await Product.find({ stock: { $lte: threshold } })
    .populate("category", "name")
    .populate("brand", "name")
    .sort({ stock: 1 })
    .limit(limit)
    .select("name stock price image brand category");

  res.json(products);
});

// @desc    Get recent orders
// @route   GET /api/stats/recent-orders
// @access  Private
const getRecentOrders = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;

  const orders = await Order.find({})
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("_id userId total totalAmount amount status createdAt orderId")
    .lean();
  res.json(orders);
});

// @desc    Get purchase dashboard statistics
// @route   GET /api/stats/purchases
// @access  Private
const getPurchaseDashboardStats = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const outOfStock = await Product.countDocuments({ stock: { $eq: 0 } });
  const lowStock = await Product.countDocuments({
    stock: { $gt: 0, $lte: 10 },
  });

  const inventoryValueData = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ["$stock", "$price"] } },
        totalItems: { $sum: "$stock" },
      },
    },
  ]);

  const totalValue = inventoryValueData[0]?.totalValue || 0;
  const totalItems = inventoryValueData[0]?.totalItems || 0;

  res.json({ totalProducts, outOfStock, lowStock, totalValue, totalItems });
});

export {
  getStats,
  getLowStockProducts,
  getRecentOrders,
  getPurchaseDashboardStats,
};
