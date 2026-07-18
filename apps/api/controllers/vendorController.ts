import Vendor from "../models/vendorModel.js";
import VendorConfig from "../models/vendorConfigModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import asyncHandler from "express-async-handler";
import uploadService from "../config/uploadService.js";

// @desc    Register a new vendor (or re-apply after rejection)
// @route   POST /api/vendors
// @access  Private
const registerVendor = asyncHandler(async (req, res) => {
  const { storeName, registrationNumber, description, logo, contactPhone, address } =
    req.body;

  const existing = await Vendor.findOne({ userId: req.user._id });

  if (existing && (existing.status === "pending" || existing.status === "approved")) {
    res.status(400);
    throw new Error(
      existing.status === "approved"
        ? "User is already an approved vendor"
        : "Vendor application is already under review",
    );
  }

  // Re-apply path: rejected/suspended vendors can resubmit
  let vendor;
  if (existing) {
    existing.storeName = storeName;
    existing.registrationNumber = registrationNumber;
    existing.description = description;
    if (logo) existing.logo = logo;
    existing.contactPhone = contactPhone;
    existing.address = address;
    existing.status = "pending";
    existing.rejectionReason = undefined;
    vendor = await existing.save();
  } else {
    vendor = await Vendor.create({
      userId: req.user._id,
      storeName,
      registrationNumber,
      description,
      logo,
      contactEmail: req.user.email,
      contactPhone,
      address,
    });
  }

  // Promote user to vendor role immediately so they see the vendor portal with onboarding state
  const user = await User.findById(req.user._id);
  if (user && user.role !== "vendor") {
    user.role = "vendor";
    await user.save();
  }

  res.status(201).json({
    success: true,
    data: vendor,
    message: "Vendor application submitted successfully",
  });
});

// @desc    Create a new vendor by admin
// @route   POST /api/vendors/create
// @access  Private/Admin
const createVendorByAdmin = asyncHandler(async (req, res) => {
  const {
    userId,
    storeName,
    description,
    logo,
    contactEmail,
    contactPhone,
    address,
    status,
    role,
  } = req.body;

  // Validate user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update user role to vendor (or provided role)
  user.role = role || "vendor";
  await user.save();

  // Check if user already has a vendor account
  const vendorExists = await Vendor.findOne({ userId });
  if (vendorExists) {
    res.status(400);
    throw new Error("This user already has a vendor account");
  }

  // Handle logo image upload to Cloudinary if provided
  let logoUrl = "";
  if (logo) {
    const folderName = `vendors/${uploadService.sanitizeFolderName(storeName)}`;
    const result = await uploadService.uploadImage(logo, {
      folder: folderName,
      originalName: `vendor_${storeName.replace(/\s+/g, "_").toLowerCase()}.jpg`,
    });
    logoUrl = result.url || "";
  }

  // Create vendor with provided status or default to approved for admin creation
  const vendor = await Vendor.create({
    userId,
    storeName,
    description,
    logo: logoUrl || undefined,
    contactEmail,
    contactPhone,
    address,
    status: status || "approved", // Admin-created vendors are approved by default
  });

  // Populate userId for response
  await vendor.populate("userId", "name email");

  if (vendor) {
    res.status(201).json({
      success: true,
      data: vendor,
      message: "Vendor created successfully by admin",
    });
  } else {
    res.status(400);
    throw new Error("Invalid vendor data");
  }
});

// @desc    Get all vendor requests
// @route   GET /api/vendors/requests
// @access  Private/Admin
const getVendorRequests = asyncHandler(async (req, res) => {
  // Can filter by status if needed query param exists
  const status = req.query.status as string;
  const filter = status ? { status } : {};

  const vendors = await Vendor.find(filter).populate(
    "userId",
    "name email role",
  );

  res.json({
    success: true,
    count: vendors.length,
    vendors: vendors,
    data: vendors,
  });
});

// @desc    Get vendor status for current user
// @route   GET /api/vendors/me
// @access  Private
const getMyVendorStatus = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });

  if (!vendor) {
    res.json({
      success: true,
      data: null,
      message: "No vendor profile found",
    });
    return;
  }

  res.json({
    success: true,
    data: vendor,
  });
});

// @desc    Update vendor status
// @route   PUT /api/vendors/:id/status
// @access  Private/Admin
const updateVendorStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const allowedStatuses = ["pending", "approved", "rejected", "suspended"];
  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  vendor.status = status;
  if (status === "rejected" || status === "suspended") {
    vendor.rejectionReason = rejectionReason || vendor.rejectionReason;
  } else if (status === "approved") {
    vendor.rejectionReason = undefined;
  }
  await vendor.save();

  // Sync user role: keep "vendor" while pending/approved (so they see the portal),
  // revoke to "user" when rejected/suspended so they can't access vendor APIs.
  const user = await User.findById(vendor.userId);
  if (user) {
    if (status === "approved" || status === "pending") {
      if (user.role !== "vendor") {
        user.role = "vendor";
        await user.save();
      }
    } else if (status === "rejected" || status === "suspended") {
      if (user.role === "vendor") {
        user.role = "user";
        await user.save();
      }
    }
  }

  res.json({
    success: true,
    data: vendor,
    message: `Vendor status updated to ${status}`,
  });
});

// @desc    Get vendor configuration
// @route   GET /api/vendors/config
// @access  Private/Admin
const getVendorConfig = asyncHandler(async (req, res) => {
  let config = await VendorConfig.findOne();

  // If no config exists, create default
  if (!config) {
    config = await VendorConfig.create({
      vendorEnabled: true,
      defaultCommissionRate: 15,
      minOrderAmount: 0,
      allowVendorRegistration: true,
      requireApproval: true,
      maxProductsPerVendor: 1000,
    });
  }

  res.json({
    success: true,
    data: config,
  });
});

// @desc    Update vendor details by admin
// @route   PUT /api/vendors/:id
// @access  Private/Admin
const updateVendorDetails = asyncHandler(async (req, res) => {
  const {
    storeName,
    description,
    logo,
    contactEmail,
    contactPhone,
    address,
    status,
    role,
  } = req.body;

  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  // Update user role if provided
  if (role) {
    const user = await User.findById(vendor.userId);
    if (user) {
      user.role = role;
      await user.save();
    }
  }

  // Handle logo image upload to Cloudinary if provided and it's base64
  let logoUrl = vendor.logo; // Keep existing logo by default

  if (logo && logo !== vendor.logo) {
    // If logo is provided and different from current, check if it's base64
    if (logo.startsWith("data:image")) {
      // Replace old image with new one
      const vendorStoreName = storeName || vendor.storeName || "";
      const folderName = `vendors/${uploadService.sanitizeFolderName(vendorStoreName)}`;
      const result = await uploadService.replaceImage(logo, vendor.logo || "", {
        folder: folderName,
        originalName: `vendor_${vendorStoreName.replace(/\s+/g, "_").toLowerCase()}.jpg`,
      });
      if (result.url) {
        logoUrl = result.url;
      }
    } else {
      // If it's already a URL, use it as-is
      logoUrl = logo;
    }
  }

  // Update vendor fields
  vendor.storeName = storeName || vendor.storeName;
  vendor.description = description || vendor.description;
  vendor.logo = logoUrl;
  vendor.contactEmail = contactEmail || vendor.contactEmail;
  vendor.contactPhone =
    contactPhone !== undefined ? contactPhone : vendor.contactPhone;
  vendor.address = address || vendor.address;
  vendor.status = status || vendor.status;

  const updatedVendor = await vendor.save();
  await updatedVendor.populate("userId", "name email role");

  res.json({
    success: true,
    data: updatedVendor,
    message: "Vendor updated successfully",
  });
});

// @desc    Update vendor configuration
// @route   PUT /api/vendors/config
// @access  Private/Admin
const updateVendorConfig = asyncHandler(async (req, res) => {
  const {
    vendorEnabled,
    defaultCommissionRate,
    minOrderAmount,
    allowVendorRegistration,
    requireApproval,
    maxProductsPerVendor,
  } = req.body;

  let config = await VendorConfig.findOne();

  if (!config) {
    // Create new config if it doesn't exist
    config = await VendorConfig.create(req.body);
  } else {
    // Update existing config
    config.vendorEnabled = vendorEnabled ?? config.vendorEnabled;
    config.defaultCommissionRate =
      defaultCommissionRate ?? config.defaultCommissionRate;
    config.minOrderAmount = minOrderAmount ?? config.minOrderAmount;
    config.allowVendorRegistration =
      allowVendorRegistration ?? config.allowVendorRegistration;
    config.requireApproval = requireApproval ?? config.requireApproval;
    config.maxProductsPerVendor =
      maxProductsPerVendor ?? config.maxProductsPerVendor;

    await config.save();
  }

  res.json({
    success: true,
    data: config,
    message: "Vendor configuration updated successfully",
  });
});

// @desc    Create a new product as vendor
// @route   POST /api/vendors/products
// @access  Private (Approved Vendors only)
const createVendorProduct = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });

  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  if (vendor.status !== "approved") {
    res.status(403);
    throw new Error("Only approved vendors can create products");
  }

  // Check vendor config for max products
  const config = await VendorConfig.findOne();
  if (config && config.maxProductsPerVendor) {
    const productCount = await Product.countDocuments({ vendor: vendor._id });
    if (productCount >= config.maxProductsPerVendor) {
      res.status(400);
      throw new Error(
        `Maximum product limit reached (${config.maxProductsPerVendor} products)`,
      );
    }
  }

  const {
    name,
    slug,
    description,
    price,
    purchasePrice,
    stock,
    purchasedQuantity,
    image,
    images,
    category,
    brand,
    productBase,
    productTypes,
    sizes,
    colors,
    weights,
    bg,
    isNewItem,
    discountPercentage,
  } = req.body;

  // Upload base64 images to Cloudinary (mirrors admin createProduct flow).
  const maxImages = parseInt(process.env.MAX_PRODUCT_IMAGES || "6") || 6;
  const incoming: string[] = Array.isArray(images) && images.length > 0
    ? images.slice(0, maxImages)
    : image
      ? [image]
      : [];

  if (incoming.length === 0) {
    res.status(400);
    throw new Error("At least one product image is required");
  }

  const uploadedImages: string[] = [];
  const folderName = `products/${uploadService.sanitizeFolderName(name)}`;
  for (let i = 0; i < incoming.length; i++) {
    const src = incoming[i];
    if (typeof src === "string" && src.startsWith("data:image")) {
      const result = await uploadService.uploadImage(src, {
        folder: folderName,
        originalName: `product_${name.replace(/\s+/g, "_").toLowerCase()}_${i + 1}.jpg`,
      });
      if (result.url) uploadedImages.push(result.url);
    } else if (src) {
      // Already a hosted URL — keep as-is
      uploadedImages.push(src);
    }
  }

  if (uploadedImages.length === 0) {
    res.status(400);
    throw new Error("Image upload failed");
  }

  // Calculate profit margin if purchasePrice is provided
  let profitMargin = 0;
  if (purchasePrice && price) {
    profitMargin = ((price - purchasePrice) / price) * 100;
  }

  const product = await Product.create({
    name,
    slug: slug || undefined,
    description,
    price,
    purchasePrice: purchasePrice || 0,
    profitMargin,
    discountPercentage: discountPercentage || 0,
    stock,
    purchasedQuantity: purchasedQuantity || 0,
    image: uploadedImages[0],
    images: uploadedImages,
    category,
    brand,
    productBase: productBase || undefined,
    productTypes: Array.isArray(productTypes) ? productTypes : [],
    sizes: Array.isArray(sizes) ? sizes : [],
    colors: Array.isArray(colors) ? colors : [],
    weights: Array.isArray(weights) ? weights : [],
    bg: bg || undefined,
    isNewItem: !!isNewItem,
    vendor: vendor._id,
    approvalStatus: "pending", // Vendor products need admin approval
  });

  if (product) {
    res.status(201).json({
      success: true,
      data: product,
      message: "Product submitted successfully. Waiting for admin approval.",
    });
  } else {
    res.status(400);
    throw new Error("Invalid product data");
  }
});

// @desc    Get vendor's own products
// @route   GET /api/vendors/products?status=pending
// @access  Private (Vendor)
const getVendorProducts = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });

  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  const { status } = req.query;
  const filter: Record<string, any> = { vendor: vendor._id };

  if (status && status !== "all") {
    filter.approvalStatus = status;
  }

  const products = await Product.find(filter)
    .populate("category", "name")
    .populate("brand", "name")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    products,
  });
});

// @desc    Update vendor product
// @route   PUT /api/vendors/products/:id
// @access  Private (Vendor - own products only)
const updateVendorProduct = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });

  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if product belongs to this vendor
  if (product.vendor?.toString() !== vendor._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this product");
  }

  // Update fields
  const {
    name,
    slug,
    description,
    price,
    purchasePrice,
    stock,
    purchasedQuantity,
    image,
    images,
    category,
    brand,
    productBase,
    productTypes,
    sizes,
    colors,
    weights,
    bg,
    isNewItem,
    discountPercentage,
  } = req.body;

  // Re-upload any new base64 entries; keep existing hosted URLs untouched.
  const maxImages = parseInt(process.env.MAX_PRODUCT_IMAGES || "6") || 6;
  const incoming: string[] | undefined =
    Array.isArray(images) && images.length > 0
      ? images.slice(0, maxImages)
      : image
        ? [image]
        : undefined;

  if (incoming) {
    const productName = name || product.name || "product";
    const folderName = `products/${uploadService.sanitizeFolderName(productName)}`;
    const finalImages: string[] = [];
    for (let i = 0; i < incoming.length; i++) {
      const src = incoming[i];
      if (typeof src === "string" && src.startsWith("data:image")) {
        const result = await uploadService.uploadImage(src, {
          folder: folderName,
          originalName: `product_${productName.replace(/\s+/g, "_").toLowerCase()}_${i + 1}.jpg`,
        });
        if (result.url) finalImages.push(result.url);
      } else if (src) {
        finalImages.push(src);
      }
    }
    if (finalImages.length > 0) {
      product.image = finalImages[0];
      product.images = finalImages;
    }
  }

  product.name = name || product.name;
  if (slug !== undefined) (product as any).slug = slug;
  product.description = description || product.description;
  product.price = price !== undefined ? price : product.price;
  product.purchasePrice =
    purchasePrice !== undefined ? purchasePrice : product.purchasePrice;
  product.stock = stock !== undefined ? stock : product.stock;
  if (purchasedQuantity !== undefined)
    (product as any).purchasedQuantity = purchasedQuantity;
  product.category = category || product.category;
  product.brand = brand || product.brand;
  if (productBase !== undefined) (product as any).productBase = productBase;
  if (Array.isArray(productTypes)) (product as any).productTypes = productTypes;
  if (Array.isArray(sizes)) (product as any).sizes = sizes;
  if (Array.isArray(colors)) (product as any).colors = colors;
  if (Array.isArray(weights)) (product as any).weights = weights;
  if (bg !== undefined) (product as any).bg = bg;
  if (isNewItem !== undefined) (product as any).isNewItem = !!isNewItem;
  if (discountPercentage !== undefined) {
    product.discountPercentage = discountPercentage;
  }

  // Reset to pending if approved product is edited
  if (product.approvalStatus === "approved") {
    product.approvalStatus = "pending";
  }

  const updatedProduct = await product.save();

  res.json({
    success: true,
    data: updatedProduct,
    message: "Product updated successfully. Waiting for admin approval.",
  });
});

// @desc    Delete vendor product
// @route   DELETE /api/vendors/products/:id
// @access  Private (Vendor - own products only)
const deleteVendorProduct = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });

  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if product belongs to this vendor
  if (product.vendor?.toString() !== vendor._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this product");
  }

  // Delete associated images
  try {
    // Delete main image
    if (product.image) {
      await uploadService.deleteImage(product.image).catch((err) => {
        console.error("Failed to delete main image:", err.message);
      });
    }

    // Delete additional images
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        await uploadService.deleteImage(imageUrl).catch((err) => {
          console.error("Failed to delete image:", err.message);
        });
      }
    }
  } catch (error: any) {
    console.error(
      "Error deleting product images:",
      error.message || String(error),
    );
    // Continue with product deletion even if image deletion fails
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: "Product and associated images deleted successfully",
  });
});

// @desc    Get vendor dashboard statistics
// @route   GET /api/vendors/dashboard/stats?year=2026
// @access  Private (Vendor)
const getVendorDashboardStats = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });
  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  const year = parseInt((req.query.year as string) || "") || new Date().getFullYear();

  // Vendor's products (id list used to scope orders that pre-date the snapshot)
  const vendorProducts = await Product.find({ vendor: vendor._id });
  const vendorProductIds = vendorProducts.map((p) => p._id.toString());

  const totalProducts = vendorProducts.length;
  const pendingProducts = vendorProducts.filter(
    (p) => p.approvalStatus === "pending",
  ).length;

  // Vendor-scoped orders (snapshot OR product-based).
  const orders = await Order.find({
    $or: [
      { "items.vendor": vendor._id },
      { "items.productId": { $in: vendorProducts.map((p) => p._id) } },
    ],
  } as any)
    .sort({ createdAt: -1 })
    .populate("userId", "name email");

  // Helper: per-order vendor lines + payout math.
  const perOrder = orders.map((o) => {
    const lines = o.items.filter(
      (it: any) =>
        (it.vendor && it.vendor.toString() === vendor._id.toString()) ||
        vendorProductIds.includes(it.productId?.toString()),
    );
    const subtotal = lines.reduce(
      (s: number, it: any) => s + it.price * it.quantity,
      0,
    );
    const cut = lines.reduce(
      (s: number, it: any) =>
        s + (it.price * it.quantity * (it.commissionRate ?? 0)) / 100,
      0,
    );
    return { order: o, lines, subtotal, cut, payout: subtotal - cut };
  });

  // Counts
  const totalOrders = perOrder.length;
  const totalRevenue = perOrder.reduce((s, x) => s + x.payout, 0);

  // Unique customers
  const customerSet = new Set<string>();
  for (const { order } of perOrder) {
    if (order.userId) customerSet.add(order.userId.toString());
  }

  const refundRequests = perOrder.filter(
    ({ order }) => order.status === "cancelled" || order.paymentStatus === "refunded",
  ).length;

  const paymentFailures = perOrder.filter(
    ({ order }) => order.paymentStatus === "failed",
  ).length;

  const shippingDelays = perOrder.filter(({ order }) => {
    if (order.status !== "delivering" && order.status !== "packed") return false;
    const placed = new Date(order.createdAt).getTime();
    return Date.now() - placed > 7 * 24 * 60 * 60 * 1000;
  }).length;

  // Order status breakdown (matches admin OrderStatus shape)
  const orderStatus = {
    pending: 0,
    confirmed: 0,
    delivering: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
    packed: 0,
    paid: 0,
    address_confirmed: 0,
  } as Record<string, number>;
  for (const { order } of perOrder) {
    if (orderStatus[order.status] !== undefined) orderStatus[order.status] += 1;
    if (order.paymentStatus === "paid") orderStatus.paid += 1;
  }

  // Monthly revenue for the requested year (sales = vendor payout)
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const monthlyRevenue = months.map((name) => ({ name, sales: 0, orders: 0 }));
  for (const { order, payout } of perOrder) {
    const d = new Date(order.createdAt);
    if (d.getFullYear() === year) {
      const m = d.getMonth();
      monthlyRevenue[m].sales += payout;
      monthlyRevenue[m].orders += 1;
    }
  }

  // Recent vendor orders (10)
  const recentOrders = perOrder.slice(0, 10).map(({ order, subtotal }) => ({
    _id: order._id,
    customer:
      typeof order.userId === "object" && order.userId
        ? { name: (order.userId as any).name, email: (order.userId as any).email }
        : null,
    total: subtotal,
    status: order.status,
    createdAt: order.createdAt,
  }));

  // Low-stock products (10, ascending stock)
  const lowStockProducts = [...vendorProducts]
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
    .slice(0, 10)
    .map((p) => ({
      _id: p._id,
      name: p.name,
      image: p.image,
      stock: p.stock ?? 0,
      price: p.price,
    }));

  res.json({
    success: true,
    year,
    counts: {
      products: totalProducts,
      pendingProducts,
      orders: totalOrders,
      customers: customerSet.size,
      totalRevenue,
      abandonedCarts: 0,
      paymentFailures,
      refundRequests,
      shippingDelays,
    },
    orderStatus,
    monthlyRevenue,
    recentOrders,
    lowStockProducts,
    // Backwards-compatible top-level fields (existing dashboard read these)
    totalProducts,
    pendingProducts,
    totalOrders,
    totalRevenue,
  });
});

// @desc    Get approved vendors (public)
// @route   GET /api/vendors/approved
// @access  Public
const getApprovedVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find({ status: "approved" }).select(
    "_id storeName logo description",
  );

  res.json(vendors);
});

// @desc    Admin overview analytics across all vendors
// @route   GET /api/vendors/admin/analytics?year=2026&topN=5
// @access  Private (Admin)
const getAdminVendorAnalytics = asyncHandler(async (req, res) => {
  const year =
    parseInt((req.query.year as string) || "") || new Date().getFullYear();
  const topNRaw = req.query.topN as string | undefined;
  // When topN is unspecified return every vendor sorted by revenue so the
  // page can render the full table; otherwise cap to the requested top.
  const topN =
    topNRaw === undefined
      ? Number.POSITIVE_INFINITY
      : Math.min(Math.max(parseInt(topNRaw, 10) || 5, 1), 50);

  // Vendor status breakdown.
  const vendors = await Vendor.find().populate("userId", "name email");
  const statusCounts = {
    total: vendors.length,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  };
  for (const v of vendors) {
    if (statusCounts[v.status] !== undefined) statusCounts[v.status] += 1;
  }

  // All orders containing any vendor item (snapshot OR product-based).
  const vendorProducts = await Product.find({ vendor: { $exists: true, $ne: null } })
    .select("_id vendor")
    .lean();

  const productToVendor = new Map<string, string>();
  for (const p of vendorProducts) {
    if (p.vendor) productToVendor.set(p._id.toString(), p.vendor.toString());
  }

  const orders = await Order.find({
    $or: [
      { "items.vendor": { $exists: true, $ne: null } },
      { "items.productId": { $in: vendorProducts.map((p) => p._id) } },
    ],
  } as any).lean();

  // Aggregate per vendor + monthly trend.
  type Agg = { revenue: number; commission: number; payout: number; orders: Set<string> };
  const byVendor = new Map<string, Agg>();
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const monthlyTrend = months.map((name) => ({
    name,
    revenue: 0,
    commission: 0,
    orders: 0,
    signups: 0,
  }));

  let totalRevenue = 0;
  let totalCommission = 0;
  let totalVendorPayout = 0;

  for (const o of orders) {
    const orderMonth = new Date(o.createdAt).getMonth();
    const orderYear = new Date(o.createdAt).getFullYear();

    for (const it of o.items || []) {
      const vendorId =
        (it.vendor && it.vendor.toString()) ||
        productToVendor.get(it.productId?.toString() || "");
      if (!vendorId) continue;

      const lineTotal = (it.price || 0) * (it.quantity || 0);
      const commission = (lineTotal * (it.commissionRate ?? 0)) / 100;
      const payout = lineTotal - commission;

      totalRevenue += lineTotal;
      totalCommission += commission;
      totalVendorPayout += payout;

      const agg = byVendor.get(vendorId) ?? {
        revenue: 0,
        commission: 0,
        payout: 0,
        orders: new Set(),
      };
      agg.revenue += lineTotal;
      agg.commission += commission;
      agg.payout += payout;
      agg.orders.add(o._id.toString());
      byVendor.set(vendorId, agg);

      if (orderYear === year) {
        monthlyTrend[orderMonth].revenue += lineTotal;
        monthlyTrend[orderMonth].commission += commission;
      }
    }

    if (orderYear === year) monthlyTrend[orderMonth].orders += 1;
  }

  // Vendor signups per month (for the year).
  for (const v of vendors) {
    const d = new Date(v.createdAt);
    if (d.getFullYear() === year) monthlyTrend[d.getMonth()].signups += 1;
  }

  // Top vendors leaderboard.
  const topVendors = vendors
    .map((v) => {
      const a = byVendor.get(v._id.toString());
      return {
        _id: v._id,
        storeName: v.storeName,
        logo: v.logo,
        status: v.status,
        owner:
          typeof v.userId === "object" && v.userId
            ? {
                name: (v.userId as any).name,
                email: (v.userId as any).email,
              }
            : null,
        revenue: a?.revenue ?? 0,
        commission: a?.commission ?? 0,
        payout: a?.payout ?? 0,
        orders: a?.orders.size ?? 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
  const topVendorsSliced = Number.isFinite(topN)
    ? topVendors.slice(0, topN as number)
    : topVendors;

  res.json({
    success: true,
    year,
    statusCounts,
    revenue: {
      total: totalRevenue,
      commission: totalCommission,
      vendorPayout: totalVendorPayout,
    },
    approvalFunnel: {
      applied: vendors.length,
      approved: statusCounts.approved,
      rejected: statusCounts.rejected,
      suspended: statusCounts.suspended,
      pending: statusCounts.pending,
      approvalRate:
        vendors.length > 0
          ? (statusCounts.approved / vendors.length) * 100
          : 0,
    },
    topVendors: topVendorsSliced,
    monthlyTrend,
  });
});

// @desc    Admin: get any vendor's dashboard stats by id
// @route   GET /api/vendors/admin/:vendorId/stats?year=2026
// @access  Private (Admin)
const getAdminVendorStatsById = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.vendorId);
  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  const year =
    parseInt((req.query.year as string) || "") || new Date().getFullYear();

  const vendorProducts = await Product.find({ vendor: vendor._id });
  const vendorProductIds = vendorProducts.map((p) => p._id.toString());

  const totalProducts = vendorProducts.length;
  const pendingProducts = vendorProducts.filter(
    (p) => p.approvalStatus === "pending",
  ).length;

  const orders = await Order.find({
    $or: [
      { "items.vendor": vendor._id },
      { "items.productId": { $in: vendorProducts.map((p) => p._id) } },
    ],
  } as any)
    .sort({ createdAt: -1 })
    .populate("userId", "name email");

  const perOrder = orders.map((o) => {
    const lines = o.items.filter(
      (it: any) =>
        (it.vendor && it.vendor.toString() === vendor._id.toString()) ||
        vendorProductIds.includes(it.productId?.toString()),
    );
    const subtotal = lines.reduce(
      (s: number, it: any) => s + it.price * it.quantity,
      0,
    );
    const cut = lines.reduce(
      (s: number, it: any) =>
        s + (it.price * it.quantity * (it.commissionRate ?? 0)) / 100,
      0,
    );
    return { order: o, subtotal, cut, payout: subtotal - cut };
  });

  const totalRevenue = perOrder.reduce((s, x) => s + x.payout, 0);
  const totalCommission = perOrder.reduce((s, x) => s + x.cut, 0);
  const totalGross = perOrder.reduce((s, x) => s + x.subtotal, 0);

  const recentOrders = perOrder.slice(0, 10).map(({ order, subtotal }) => ({
    _id: order._id,
    customer:
      typeof order.userId === "object" && order.userId
        ? {
            name: (order.userId as any).name,
            email: (order.userId as any).email,
          }
        : null,
    total: subtotal,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
  }));

  // 10 most-recent products for a quick preview on the admin VendorDetailPage.
  const recentProducts = [...vendorProducts]
    .sort(
      (a, b) =>
        new Date((b as any).createdAt ?? 0).getTime() -
        new Date((a as any).createdAt ?? 0).getTime(),
    )
    .slice(0, 10)
    .map((p) => ({
      _id: p._id,
      name: p.name,
      image: p.image,
      price: p.price,
      stock: p.stock ?? 0,
      approvalStatus: p.approvalStatus,
      createdAt: (p as any).createdAt,
    }));

  res.json({
    success: true,
    vendor: {
      _id: vendor._id,
      storeName: vendor.storeName,
      registrationNumber: vendor.registrationNumber,
      description: vendor.description,
      status: vendor.status,
      rejectionReason: vendor.rejectionReason,
      logo: vendor.logo,
      contactEmail: vendor.contactEmail,
      contactPhone: vendor.contactPhone,
      address: vendor.address,
      createdAt: (vendor as any).createdAt,
    },
    counts: {
      products: totalProducts,
      pendingProducts,
      orders: perOrder.length,
      totalGross,
      totalCommission,
      totalRevenue,
    },
    year,
    recentOrders,
    recentProducts,
  });
});

// @desc    Get orders that include this vendor's products
// @route   GET /api/vendors/orders
// @access  Private (Vendor)
const getVendorOrders = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });
  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  // Match either by snapshot (new orders) or product->vendor (existing orders).
  const ownProducts = await Product.find({ vendor: vendor._id }).select("_id");
  const ownProductIds = ownProducts.map((p) => p._id);

  const orders = await Order.find({
    $or: [
      { "items.vendor": vendor._id },
      { "items.productId": { $in: ownProductIds } },
    ],
  } as any)
    .sort({ createdAt: -1 })
    .populate("userId", "name email");

  // Compute vendor-specific subtotals and platform-cut per order.
  const enriched = orders.map((order) => {
    const vendorItems = order.items.filter(
      (it: any) =>
        (it.vendor && it.vendor.toString() === vendor._id.toString()) ||
        ownProductIds.some((pid) => pid.toString() === it.productId?.toString()),
    );
    const vendorSubtotal = vendorItems.reduce(
      (sum: number, it: any) => sum + it.price * it.quantity,
      0,
    );
    const platformCut = vendorItems.reduce(
      (sum: number, it: any) =>
        sum + (it.price * it.quantity * (it.commissionRate ?? 0)) / 100,
      0,
    );
    return {
      _id: order._id,
      createdAt: order.createdAt,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      customer: order.userId,
      shippingAddress: order.shippingAddress,
      vendorItems,
      vendorSubtotal,
      platformCut,
      vendorPayout: vendorSubtotal - platformCut,
    };
  });

  res.json({
    success: true,
    count: enriched.length,
    orders: enriched,
  });
});

// @desc    Get a single order detail (vendor-scoped)
// @route   GET /api/vendors/orders/:id
// @access  Private (Vendor)
const getVendorOrderById = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });
  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  const order = await Order.findById(req.params.id).populate(
    "userId",
    "name email",
  );
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const ownProducts = await Product.find({ vendor: vendor._id }).select("_id");
  const ownProductIds = ownProducts.map((p) => p._id.toString());

  const vendorItems = order.items.filter(
    (it: any) =>
      (it.vendor && it.vendor.toString() === vendor._id.toString()) ||
      ownProductIds.includes(it.productId?.toString()),
  );

  if (vendorItems.length === 0) {
    res.status(404);
    throw new Error("Order not found");
  }

  const vendorSubtotal = vendorItems.reduce(
    (sum: number, it: any) => sum + it.price * it.quantity,
    0,
  );
  const platformCut = vendorItems.reduce(
    (sum: number, it: any) =>
      sum + (it.price * it.quantity * (it.commissionRate ?? 0)) / 100,
    0,
  );

  res.json({
    success: true,
    order: {
      _id: order._id,
      createdAt: order.createdAt,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      customer: order.userId,
      shippingAddress: order.shippingAddress,
      vendorItems,
      vendorSubtotal,
      platformCut,
      vendorPayout: vendorSubtotal - platformCut,
    },
  });
});

export {
  registerVendor,
  createVendorByAdmin,
  getVendorRequests,
  getMyVendorStatus,
  updateVendorStatus,
  updateVendorDetails,
  getVendorConfig,
  updateVendorConfig,
  createVendorProduct,
  getVendorProducts,
  updateVendorProduct,
  deleteVendorProduct,
  getVendorDashboardStats,
  getApprovedVendors,
  getVendorOrders,
  getVendorOrderById,
  getAdminVendorAnalytics,
  getAdminVendorStatsById,
};
