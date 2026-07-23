import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import VendorConfig from "../models/vendorConfigModel.js";
import { sendOrderConfirmationEmail } from "../utils/emailService.js";
import { notificationService } from "../services/notificationService.js";
import {
  calcShipping,
  getStoreSettings,
} from "../utils/storeSettings.js";

// Snapshot vendor + platform commissionRate onto each order item.
// Items missing a product or with a product that has no vendor (admin-listed)
// get vendor=null and commissionRate=0 so existing flows still work.
async function enrichItemsWithVendorSnapshot(items: any[]) {
  const productIds = items.map((i) => i.productId).filter(Boolean);
  if (productIds.length === 0) return items;

  const products = await Product.find({ _id: { $in: productIds } }).select(
    "_id vendor",
  );
  const vendorByProduct = new Map<string, any>();
  for (const p of products) {
    vendorByProduct.set(p._id.toString(), p.vendor ?? null);
  }

  const config = await VendorConfig.findOne();
  const defaultRate = config?.defaultCommissionRate ?? 15;

  return items.map((item) => {
    const vendorId = vendorByProduct.get(item.productId?.toString?.() ?? item.productId);
    return {
      ...item,
      vendor: vendorId ?? null,
      commissionRate: vendorId ? defaultRate : 0,
    };
  });
}

// @desc    Get all orders for a user
// @route   GET /api/orders
// @access  Private
export const getOrders = asyncHandler(async (req: any, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }
  const orders = await Order.find({ userId: req.user._id }).populate(
    "items.productId",
  );
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req: any, res: Response) => {
  const orderId = req.params.id;
  if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(404);
    throw new Error("Order not found");
  }

  const order = await Order.findById(orderId).populate("items.productId");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Guest orders are viewable by anyone with the order ID (confirmation link)
  if (order.isGuest) {
    res.json(order);
    return;
  }

  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  if (
    req.user.role === "admin" ||
    (order.userId && order.userId.toString() === req.user._id.toString())
  ) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Track order by full ID or short display ID
// @route   GET /api/orders/track/:ref
// @access  Public — knowing the order ID is enough to view tracking status
export const trackOrderByReference = asyncHandler(
  async (req: any, res: Response) => {
    const raw = String(req.params.ref || "")
      .trim()
      .replace(/^#/, "");
    const ref = raw.toLowerCase();

    if (!ref || !/^[0-9a-f]{4,24}$/i.test(ref)) {
      res.status(404);
      throw new Error("Order not found");
    }

    let order: any = null;

    if (/^[0-9a-f]{24}$/i.test(ref)) {
      order = await Order.findById(ref).populate("items.productId");
    } else {
      // Short display ID — match Mongo ObjectId suffix (case-insensitive)
      const matches = await Order.aggregate([
        {
          $addFields: {
            idStr: { $toLower: { $toString: "$_id" } },
          },
        },
        {
          $match: {
            idStr: { $regex: `${ref}$` },
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 1 },
      ]);

      if (matches[0]?._id) {
        order = await Order.findById(matches[0]._id).populate(
          "items.productId",
        );
      }
    }

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    res.json(order);
  },
);
export const createCODOrder = asyncHandler(async (req: any, res: Response) => {
  const { items, shippingAddress, guestEmail } = req.body;
  const isGuest = !req.user;

  if (isGuest) {
    const email =
      guestEmail || shippingAddress?.emailAddress || shippingAddress?.email;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      res.status(400);
      throw new Error("A valid email is required for guest checkout");
    }
  }

  const storeSettings = await getStoreSettings();
  if (!storeSettings.enableCod) {
    res.status(400);
    throw new Error("Cash on Delivery is currently disabled");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("Cart items are required");
  }

  if (
    !shippingAddress ||
    !shippingAddress.firstName ||
    !shippingAddress.lastName ||
    !shippingAddress.phoneNumber ||
    !shippingAddress.city ||
    !shippingAddress.state ||
    !shippingAddress.country ||
    !shippingAddress.zipCode
  ) {
    res.status(400);
    throw new Error(
      "Shipping address is required with all fields (firstName, lastName, phoneNumber, city, state, country, zipCode)",
    );
  }

  const baseItems = items.map((item: any) => {
    if (!item._id || !item.name || !item.price || !item.quantity) {
      res.status(400);
      throw new Error("Invalid item structure");
    }
    return {
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    };
  });
  const validItems = await enrichItemsWithVendorSnapshot(baseItems);

  const subtotal = validItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const shipping = calcShipping(subtotal, storeSettings);
  const tax = subtotal * storeSettings.taxRate;
  const total = subtotal + shipping + tax;

  const resolvedGuestEmail = (
    guestEmail ||
    shippingAddress?.emailAddress ||
    shippingAddress?.email ||
    ""
  )
    .toString()
    .trim()
    .toLowerCase();

  const actorName = isGuest
    ? `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim() ||
      "Guest"
    : req.user.name || req.user.email;

  const order = await Order.create({
    ...(isGuest
      ? { isGuest: true, guestEmail: resolvedGuestEmail }
      : { userId: req.user._id, isGuest: false }),
    items: validItems,
    subtotal,
    tax,
    taxRate: storeSettings.taxRate,
    shipping,
    total,
    status: "confirmed",
    paymentStatus: "pending",
    paymentMethod: "cod",
    shippingAddress,
    codAmount: total,
    status_history: [
      {
        status: "confirmed",
        changed_at: new Date(),
        changed_by: {
          ...(isGuest ? {} : { id: req.user._id }),
          name: actorName,
        },
        notes: isGuest
          ? "Guest COD order created and confirmed"
          : "COD order created and confirmed",
      },
    ],
    stockReduced: true,
  });

  const Product = (await import("../models/productModel.js")).default;
  for (const item of validItems) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: -item.quantity } },
      { new: true },
    );
  }

  try {
    if (!isGuest) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { orders: order._id },
      });
      await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
      await notificationService.notifyOrderPlaced(req.user._id, order);
    }
  } catch (notifError) {
    console.error("❌ Failed to create notification:", notifError);
  }

  try {
    const userEmail = isGuest
      ? resolvedGuestEmail
      : (await User.findById(req.user._id))?.email;
    const userName = isGuest
      ? actorName
      : (await User.findById(req.user._id))?.name || userEmail;

    if (userEmail) {
      await sendOrderConfirmationEmail({
        userEmail,
        userName: userName || userEmail,
        order: {
          // @ts-ignore
          _id: order._id,
          items: validItems,
          total: order.total,
          status: order.status,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
        },
      });
    }
  } catch (emailError) {
    console.error(
      "❌ Failed to send COD order confirmation email:",
      emailError,
    );
  }

  res.status(201).json({
    success: true,
    message: "COD order created successfully",
    data: order,
  });
});

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private
export const createOrderFromCart = asyncHandler(
  async (req: any, res: Response) => {
    const {
      items,
      shippingAddress,
      paymentMethod = "stripe",
      guestEmail,
    } = req.body;
    const isGuest = !req.user;

    if (isGuest) {
      const email =
        guestEmail || shippingAddress?.emailAddress || shippingAddress?.email;
      if (!email || typeof email !== "string" || !email.includes("@")) {
        res.status(400);
        throw new Error("A valid email is required for guest checkout");
      }
    }

    const storeSettings = await getStoreSettings();
    if (paymentMethod === "cod" && !storeSettings.enableCod) {
      res.status(400);
      throw new Error("Cash on Delivery is currently disabled");
    }
    if (
      (paymentMethod === "stripe" || paymentMethod === "credit_card") &&
      !storeSettings.enableStripe
    ) {
      res.status(400);
      throw new Error("Card payments are currently disabled");
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error("Cart items are required");
    }

    if (
      !shippingAddress ||
      !shippingAddress.firstName ||
      !shippingAddress.lastName ||
      !shippingAddress.phoneNumber ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.country ||
      !shippingAddress.zipCode
    ) {
      res.status(400);
      throw new Error(
        "Shipping address is required with all fields (firstName, lastName, phoneNumber, city, state, country, zipCode)",
      );
    }

    const baseItems = items.map((item: any) => {
      if (!item._id || !item.name || !item.price || !item.quantity) {
        res.status(400);
        throw new Error("Invalid item structure");
      }
      return {
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      };
    });
    const validItems = await enrichItemsWithVendorSnapshot(baseItems);

    const subtotal = validItems.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);

    const shipping = calcShipping(subtotal, storeSettings);
    const tax = subtotal * storeSettings.taxRate;
    const total = subtotal + shipping + tax;

    const resolvedGuestEmail = (
      guestEmail ||
      shippingAddress?.emailAddress ||
      shippingAddress?.email ||
      ""
    )
      .toString()
      .trim()
      .toLowerCase();

    const actorName = isGuest
      ? `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim() ||
        "Guest"
      : req.user.name || req.user.email;

    const order = await Order.create({
      ...(isGuest
        ? { isGuest: true, guestEmail: resolvedGuestEmail }
        : { userId: req.user._id, isGuest: false }),
      items: validItems,
      subtotal,
      tax,
      taxRate: storeSettings.taxRate,
      shipping,
      total,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod,
      shippingAddress,
      codAmount: 0,
      status_history: [
        {
          status: "pending",
          changed_at: new Date(),
          changed_by: {
            ...(isGuest ? {} : { id: req.user._id }),
            name: actorName,
          },
          notes: isGuest ? "Guest order created" : "Order created",
        },
      ],
    });

    try {
      if (!isGuest) {
        await User.findByIdAndUpdate(req.user._id, {
          $push: { orders: order._id },
        });
        await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
        await notificationService.notifyOrderPlaced(req.user._id, order);
      }
    } catch (notifError) {
      console.error("❌ Failed to create notification:", notifError);
    }

    try {
      const userEmail = isGuest
        ? resolvedGuestEmail
        : (await User.findById(req.user._id))?.email;
      const userName = isGuest
        ? actorName
        : (await User.findById(req.user._id))?.name || userEmail;

      if (userEmail) {
        await sendOrderConfirmationEmail({
          userEmail,
          userName: userName || userEmail,
          order: {
            // @ts-ignore
            _id: order._id,
            items: validItems,
            total: order.total,
            status: order.status,
            shippingAddress: order.shippingAddress,
            createdAt: order.createdAt,
          },
        });
      }
    } catch (emailError) {
      console.error("❌ Failed to send order confirmation email:", emailError);
    }

    res.status(201).json({
      success: true,
      order,
      message: "Order created successfully",
    });
  },
);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = asyncHandler(
  // @ts-ignore
  async (req: any, res: Response) => {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is missing",
      });
    }

    const { status, paymentIntentId, stripeSessionId } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "address_confirmed",
      "confirmed",
      "packed",
      "delivering",
      "delivered",
      "completed",
      "cancelled",
    ];
    if (!status || !validStatuses.includes(status)) {
      res.status(400);
      throw new Error(
        "Invalid status. Must be one of: pending, address_confirmed, confirmed, packed, delivering, delivered, completed, cancelled",
      );
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Log order details for debugging

    // Check authorization based on order status and user role
    // - Users can only update their own orders when status is "pending"
    // - Admins can update any order at any time
    // - Employees can update orders based on their role and workflow permissions
    // - Webhook calls (no req.user) are always allowed
    if (req.user) {
      const isOwner = order.userId.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";
      const isEmployee = req.user.role === "employee";
      const isPending = order.status === "pending";
      const isAddressConfirmed = order.status === "address_confirmed";

      // If user is not admin/employee and (not owner OR order is not pending), deny access
      if (!isAdmin && !isEmployee) {
        if (!isOwner) {
          res.status(403);
          throw new Error("Not authorized to update this order");
        }
        
        if (!isPending && status !== "cancelled") {
          res.status(403);
          throw new Error("Order status can only be updated by admin or authorized employees");
        }
        
        if (status === "cancelled" && !isPending && !isAddressConfirmed) {
          res.status(403);
          throw new Error("Order can only be cancelled while in pending or address confirmed status");
        }
      }

      // For employees, check if they have permission for this status change
      if (isEmployee && !isAdmin) {
        const employeeRole = req.user.employee_role;
        const currentStatus = order.status;

        // Define allowed status transitions for each employee role
        // TODO: Define interface for this map
        const allowedTransitions: any = {
          packer: {
            from: ["confirmed", "processing"],
            to: ["processing", "packed"],
          },
          deliveryman: {
            from: ["packed", "delivering"],
            to: ["delivering", "delivered"],
          },
          accounts: {
            from: ["delivered"],
            to: ["completed"],
          },
          incharge: {
            from: ["confirmed", "packed", "delivering", "delivered"],
            to: [
              "confirmed",
              "packed",
              "delivering",
              "delivered",
              "completed",
              "cancelled",
            ],
          },
        };

        const allowedForRole = allowedTransitions[employeeRole];
        if (
          !allowedForRole ||
          !allowedForRole.from.includes(currentStatus) ||
          !allowedForRole.to.includes(status)
        ) {
          res.status(403);
          throw new Error(
            `${employeeRole} role cannot change order from ${currentStatus} to ${status}`,
          );
        }
      }
    }

    // Get the order first to ensure status_updates exists
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Initialize status_updates if it doesn't exist
    if (!existingOrder.status_updates) {
      existingOrder.status_updates = {};
    }

    // Prepare update object
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Add status-specific tracking to status_updates object
    if (req.user) {
      const userName = req.user.name || req.user.email;
      const statusUpdateField = `status_updates.${status}`;

      switch (status) {
        case "address_confirmed":
          updateData[`status_updates.address_confirmed.by.id`] = req.user._id;
          updateData[`status_updates.address_confirmed.by.name`] = userName;
          updateData[`status_updates.address_confirmed.at`] = new Date();
          break;
        case "confirmed":
          updateData[`status_updates.order_confirmed.by.id`] = req.user._id;
          updateData[`status_updates.order_confirmed.by.name`] = userName;
          updateData[`status_updates.order_confirmed.at`] = new Date();

          // Reduce product stock when order is confirmed
          if (existingOrder.status !== "confirmed" && !existingOrder.stockReduced) {
            const Product = (await import("../models/productModel.js")).default;
            for (const item of existingOrder.items) {
              await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } },
                { new: true },
              );
            }
            updateData.stockReduced = true;
            updateData.qcStatus = "unneeded"; // Reset any previous QC state if somehow transitioning back to confirmed
          }
          break;
        case "packed":
          updateData[`${statusUpdateField}.by.id`] = req.user._id;
          updateData[`${statusUpdateField}.by.name`] = userName;
          updateData[`${statusUpdateField}.at`] = new Date();
          break;
        case "delivering":
          updateData[`${statusUpdateField}.by.id`] = req.user._id;
          updateData[`${statusUpdateField}.by.name`] = userName;
          updateData[`${statusUpdateField}.at`] = new Date();
          break;
        case "delivered":
          updateData[`${statusUpdateField}.by.id`] = req.user._id;
          updateData[`${statusUpdateField}.by.name`] = userName;
          updateData[`${statusUpdateField}.at`] = new Date();
          break;
        case "completed":
          updateData[`${statusUpdateField}.by.id`] = req.user._id;
          updateData[`${statusUpdateField}.by.name`] = userName;
          updateData[`${statusUpdateField}.at`] = new Date();
          updateData.paymentStatus = "paid"; // Mark as paid when completed
          break;
        case "cancelled":
          updateData[`${statusUpdateField}.by.id`] = req.user._id;
          updateData[`${statusUpdateField}.by.name`] = userName;
          updateData[`${statusUpdateField}.at`] = new Date();
          
          // Send to QC if stock was already reduced
          if (existingOrder.stockReduced && existingOrder.qcStatus === "unneeded") {
            updateData.qcStatus = "pending";
          }
          break;
      }
    }

    // Add to status history
    if (req.user) {
      const userName = req.user.name || req.user.email;
      const statusHistoryEntry = {
        status,
        changed_at: new Date(),
        changed_by: {
          id: req.user._id,
          name: userName,
        },
        notes: "",
      };

      updateData.$push = { status_history: statusHistoryEntry };
    }

    // Use findByIdAndUpdate to avoid full document validation
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: false, // Disable validation to avoid shipping address issues
      },
    ).populate("userId", "name email");

    // Create in-app notifications for status changes
    if (updatedOrder) {
      try {
        const userId = updatedOrder.userId._id || updatedOrder.userId;

        if (status === "confirmed") {
          await notificationService.notifyOrderConfirmed(userId, updatedOrder);
        } else if (status === "shipped") {
          await notificationService.notifyOrderShipped(userId, updatedOrder);
        } else if (status === "delivered") {
          await notificationService.notifyOrderDelivered(userId, updatedOrder);
        }
      } catch (notifError) {
        console.error("❌ Failed to create status notification:", notifError);
      }
    }

    // Send email notification when order is confirmed or delivered
    if (updatedOrder && (status === "confirmed" || status === "delivered")) {
      try {
        const user: any = updatedOrder.userId;
        const emailResult = await sendOrderConfirmationEmail({
          userEmail: user.email,
          userName: user.name || user.email,
          order: {
            // @ts-ignore
            _id: updatedOrder._id,
            items: updatedOrder.items,
            total: updatedOrder.total,
            status: updatedOrder.status,
            shippingAddress: updatedOrder.shippingAddress,
            createdAt: updatedOrder.createdAt,
            updatedAt: updatedOrder.updatedAt,
          },
        });
      } catch (emailError) {
        console.error(`❌ Failed to send order delivery email:`, emailError);
        // Don't fail the order update if email fails
      }
    }

    res.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${status}`,
    });
  },
);

// @desc    Update order payment status (webhook only)
// @route   PUT /api/orders/:id/webhook-status
// @access  Public (called by webhooks)
// @ts-ignore
export const updateOrderPaymentStatus = asyncHandler(async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing",
    });
  }

  const { status, paymentIntentId, stripeSessionId } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Prepare update object based on what status was sent
  const updateData: any = {
    updatedAt: new Date(),
  };

  // If status is "paid", update paymentStatus field (not status field)
  if (status === "paid") {
    updateData.paymentStatus = "paid";
    updateData.paidAt = new Date();
    updateData.paymentMethod = "stripe"; // Set payment method

    // Store comprehensive Stripe payment information
    updateData.payment_info = {
      gateway: "stripe",
      stripe: {
        paymentIntentId: paymentIntentId || null,
        sessionId: stripeSessionId || null,
      },
      paidAt: new Date(),
    };

    if (paymentIntentId) {
      updateData.paymentIntentId = paymentIntentId;
    }
    if (stripeSessionId) {
      updateData.stripeSessionId = stripeSessionId;
    }
  } else if (["pending", "failed", "refunded"].includes(status)) {
    // Handle other payment statuses
    updateData.paymentStatus = status;
  } else {
    // For order status updates from webhook (shouldn't happen but handle anyway)
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (validStatuses.includes(status)) {
      updateData.status = status;
    }
  }

  // Use findByIdAndUpdate to avoid full document validation
  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: false,
    },
  ).populate("userId", "name email");

  // Create in-app notification for payment success
  if (updatedOrder && updatedOrder.paymentStatus === "paid") {
    try {
      const userId = updatedOrder.userId._id || updatedOrder.userId;
      await notificationService.notifyPaymentSuccess(userId, updatedOrder);
    } catch (notifError) {
      console.error("❌ Failed to create payment notification:", notifError);
    }
  }

  res.json({
    success: true,
    order: updatedOrder,
    message: `Order payment status updated successfully`,
  });
});

// @desc    Update complete order (admin only)
// @route   PUT /api/orders/:id
// @access  Private (Admin)
export const updateOrder = asyncHandler(async (req: any, res: Response) => {
  const { status, paymentStatus, totalAmount, items, shippingAddress } =
    req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  // Role-based access control
  const isAdmin = req.user.role === "admin";
  const isEmployee = req.user.role === "employee";
  const employeeRole = req.user.employee_role;

  // Check permissions based on role
  if (!isAdmin && !isEmployee) {
    res.status(403);
    throw new Error("Not authorized. Admin or employee access required.");
  }

  // For employees, validate what they can update
  if (isEmployee) {
    switch (employeeRole) {
      case "call_center":
        // Call center can only update pending/address_confirmed orders
        if (
          order.status !== "pending" &&
          order.status !== "address_confirmed"
        ) {
          res.status(403);
          throw new Error(
            "Call center can only update pending or address confirmed orders",
          );
        }
        // Call center cannot change payment status
        if (
          paymentStatus !== undefined &&
          paymentStatus !== order.paymentStatus
        ) {
          res.status(403);
          throw new Error("Call center cannot modify payment status");
        }
        break;

      case "packer":
        // Packer can update confirmed/packed orders
        if (
          order.status !== "confirmed" &&
          order.status !== "packed"
        ) {
          res.status(403);
          throw new Error(
            "Packer can only update confirmed or packed orders",
          );
        }
        break;

      case "deliveryman":
        // Deliveryman can update delivery-related orders
        if (
          order.status !== "packed" &&
          order.status !== "delivering" &&
          order.status !== "delivered"
        ) {
          res.status(403);
          throw new Error(
            "Deliveryman can only update delivery-related orders",
          );
        }
        break;

      case "accounts":
        // Accounts can update delivered/completed orders
        // @ts-ignore
        if (order.status !== "delivered" && order.status !== "completed") {
          res.status(403);
          throw new Error(
            "Accounts can only update delivered or completed orders",
          );
        }
        break;

      case "incharge":
        // Incharge has broader access
        break;

      default:
        res.status(403);
        throw new Error("Unknown employee role");
    }
  }

  // Validate status if provided
  if (status) {
    const validStatuses = [
      "pending",
      "address_confirmed",
      "confirmed",
      "packed",
      "delivering",
      "delivered",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error(
        "Invalid status. Must be one of: pending, address_confirmed, confirmed, packed, delivering, delivered, completed, cancelled",
      );
    }
  }

  // Validate payment status if provided
  if (paymentStatus) {
    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      res.status(400);
      throw new Error(
        "Invalid payment status. Must be one of: pending, paid, failed, refunded",
      );
    }
  }

  // Calculate total if items are provided
  let calculatedTotal = totalAmount;
  if (items && Array.isArray(items)) {
    calculatedTotal = items.reduce((total, item) => {
      return total + item.quantity * item.price;
    }, 0);
  }

  // Initialize status_updates if it doesn't exist
  if (!order.status_updates) {
    order.status_updates = {};
  }

  // Prepare update object
  const updateData: any = {
    updatedAt: new Date(),
  };

  // Update fields if provided
  if (status !== undefined) {
    updateData.status = status;

    // Add status tracking to status_updates object
    if (req.user) {
      const userName = req.user.name || req.user.email;
      const statusUpdateField = `status_updates.${status}`;

      switch (status) {
        case "address_confirmed":
          updateData[`status_updates.address_confirmed.by.id`] = req.user._id;
          updateData[`status_updates.address_confirmed.by.name`] = userName;
          updateData[`status_updates.address_confirmed.at`] = new Date();
          break;
        case "confirmed":
          updateData[`status_updates.order_confirmed.by.id`] = req.user._id;
          updateData[`status_updates.order_confirmed.by.name`] = userName;
          updateData[`status_updates.order_confirmed.at`] = new Date();
          break;
        case "packed":
        case "delivering":
        case "delivered":
        case "completed":
        case "cancelled":
          updateData[`${statusUpdateField}.by.id`] = req.user._id;
          updateData[`${statusUpdateField}.by.name`] = userName;
          updateData[`${statusUpdateField}.at`] = new Date();
          
          if (status === "cancelled" && order.stockReduced && order.qcStatus === "unneeded") {
            updateData.qcStatus = "pending";
          }
          break;
      }

      // Add to status history
      const statusHistoryEntry = {
        status,
        changed_at: new Date(),
        changed_by: {
          id: req.user._id,
          name: userName,
        },
        notes: "",
      };
      updateData.$push = { status_history: statusHistoryEntry };
    }
  }

  if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
  if (calculatedTotal !== undefined) updateData.total = calculatedTotal;
  if (items !== undefined) updateData.items = items;
  if (shippingAddress !== undefined)
    updateData.shippingAddress = shippingAddress;

  // Use findByIdAndUpdate with new populated data
  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: false, // Disable validation to avoid shipping address issues
    },
  ).populate("userId", "name email");

  res.json({
    success: true,
    order: updatedOrder,
    message: "Order updated successfully",
  });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = asyncHandler(async (req: any, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  // Check if user owns this order or is an admin
  if (
    req.user.role !== "admin" &&
    order.userId.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this order");
  }

  await Order.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Order deleted successfully",
  });
});

// @desc    Get all orders for admin
// @route   GET /api/orders/admin
// @access  Private/Admin
export const getAllOrdersAdmin = asyncHandler(
  async (req: any, res: Response) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;
    const search = req.query.search as string;

    // Build filter object
    const filter: any = {};

    if (search && search.trim() !== "") {
      const searchTerm = search.trim();
      
      const User = (await import("../models/userModel.js")).default;
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ],
      }).select("_id");

      const userIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { userId: { $in: userIds } },
        { guestEmail: { $regex: searchTerm, $options: "i" } },
        { "shippingAddress.firstName": { $regex: searchTerm, $options: "i" } },
        { "shippingAddress.lastName": { $regex: searchTerm, $options: "i" } },
        { "shippingAddress.emailAddress": { $regex: searchTerm, $options: "i" } },
      ];

      const cleanSearchTerm = searchTerm
        .replace(/^#/, "")
        .replace(/^ORD-/i, "");
      if (cleanSearchTerm.match(/^[0-9a-fA-F]{24}$/)) {
        filter.$or.push({ _id: cleanSearchTerm });
      } else if (cleanSearchTerm.match(/^[0-9a-fA-F]+$/i)) {
        filter.$or.push({
          $expr: {
            $regexMatch: {
              input: { $toString: "$_id" },
              regex: `${cleanSearchTerm}$`,
              options: "i",
            },
          },
        });
      }
    }

    // Track if we need to filter by specific user actions
    let needsUserFilter = false;

    if (status && status !== "all") {
      // Special handling for call center pending orders
      if (
        status === "call_center_pending" &&
        req.user.role === "employee" &&
        req.user.employee_role === "call_center"
      ) {
        // Show both pending and address_confirmed orders
        filter.status = { $in: ["pending", "address_confirmed"] };
        needsUserFilter = true;
      }
      // For call center viewing their confirmed orders
      else if (
        status === "confirmed" &&
        req.user.role === "employee" &&
        req.user.employee_role === "call_center"
      ) {
        needsUserFilter = true;
        filter.status = status;
        filter["status_updates.order_confirmed.by.id"] = req.user._id;
      }
      // For packers viewing their packed orders
      else if (
        status === "packed" &&
        req.user.role === "employee" &&
        req.user.employee_role === "packer"
      ) {
        needsUserFilter = true;
        filter.status = status;
        filter["status_updates.packed.by.id"] = req.user._id;
      } else {
        filter.status = status;
      }
    }

    if (paymentStatus && paymentStatus !== "all") {
      // Map payment status to actual status values
      if (paymentStatus === "paid") {
        // If we already have a status filter (like "packed"), combine them
        if (filter.status && !needsUserFilter) {
          // Don't override if it's a single status
          // Only override if we haven't set a specific status
        } else if (!filter.status) {
          filter.status = { $in: ["paid", "completed"] };
        }
      } else if (paymentStatus === "pending") {
        if (!filter.status) {
          filter.status = "pending";
        }
      } else if (paymentStatus === "failed") {
        if (!filter.status) {
          filter.status = "cancelled";
        }
      }
    }

    const skip = (page - 1) * perPage;

    const orders = await Order.find(filter)
      .populate("userId", "name email")
      .populate("items.productId", "name price image")
      .populate("assignedDeliveryman", "name email")
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(perPage);

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / perPage);

    // Transform data to match frontend expectations
    const transformedOrders = orders.map((order) => {
      const populatedUser = order.userId as any;
      const isGuestOrder = Boolean(order.isGuest) || !populatedUser;
      const guestEmail =
        order.guestEmail ||
        (order.shippingAddress as any)?.emailAddress ||
        (order.shippingAddress as any)?.email ||
        "No Email";

      return {
      _id: order._id,
      orderId: order._id.toString().slice(-8).toUpperCase(),
      isGuest: isGuestOrder,
      guestEmail: isGuestOrder ? guestEmail : undefined,
      user: isGuestOrder
        ? {
            _id: `guest-${order._id}`,
            name: "Guest Customer",
            email: guestEmail,
          }
        : {
            _id: populatedUser._id,
            name: populatedUser.name || "Unknown User",
            email: populatedUser.email || "No Email",
          },
      items:
        order.items
          ?.filter((item) => item && (item.productId || item.name)) // Keep line items even if product was deleted
          .map((item) => ({
            product: {
              _id: (item.productId as any)?._id || item.productId || "",
              name:
                (item.productId as any)?.name ||
                item.name ||
                "Unknown Product",
              price: (item.productId as any)?.price || item.price || 0,
              image:
                (item.productId as any)?.image ||
                item.image ||
                "/placeholder-image.jpg",
            },
            quantity: item.quantity || 1,
            price: item.price || 0,
          })) || [], // Fallback to empty array if items is undefined
      totalAmount: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus || "pending", // Use the actual paymentStatus field
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress || {
        street: "N/A",
        city: "N/A",
        state: "N/A",
        zipCode: "N/A",
        country: "N/A",
      },
      assignedDeliveryman: order.assignedDeliveryman
        ? {
            _id: (order.assignedDeliveryman as any)._id,
            name: (order.assignedDeliveryman as any).name,
            email: (order.assignedDeliveryman as any).email,
          }
        : null,
      status_history: order.status_history || [],
      status_updates: order.status_updates || {},
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
    });

    res.json({
      orders: transformedOrders,
      total,
      totalPages,
      currentPage: page,
    });
  },
);

// @desc    Search products for adding to orders
// @route   GET /api/orders/search-products
// @access  Private (Admin)
export const searchProductsForOrders = asyncHandler(
  async (req: any, res: Response) => {
    // Check if user is admin
    if (req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized. Admin access required.");
    }

    const { search, limit = 10 } = req.query;

    if (!search || (search as string).trim() === "") {
      res.status(400);
      throw new Error("Search query is required");
    }

    // Import Product model (assuming it exists)
    const Product = (await import("../models/productModel.js")).default;

    const products = await Product.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
      isActive: true, // Only active products
    })
      .select("_id name price image description category")
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      products: products.map((product) => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      })),
    });
  },
);

// @desc    Get pending QC orders
// @route   GET /api/orders/qc/pending
// @access  Private (Admin)
export const getPendingQCOrders = asyncHandler(async (req: any, res: Response) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized. Admin access required.");
  }

  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const skip = (page - 1) * perPage;

  const filter = { qcStatus: "pending" };

  const orders = await Order.find(filter)
    .populate("userId", "name email")
    .populate("items.productId", "name price image")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(perPage);

  const total = await Order.countDocuments(filter);
  const totalPages = Math.ceil(total / perPage);

  res.json({
    orders,
    total,
    totalPages,
    currentPage: page,
  });
});

// @desc    Confirm QC for an order (restock items)
// @route   PUT /api/orders/:id/qc
// @access  Private (Admin)
export const confirmOrderQC = asyncHandler(async (req: any, res: Response) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized. Admin access required.");
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.qcStatus !== "pending") {
    res.status(400);
    throw new Error("Order is not pending quality control");
  }

  // Restock items
  const Product = (await import("../models/productModel.js")).default;
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: item.quantity } },
      { new: true }
    );
  }

  order.qcStatus = "restocked";
  
  // Add another status history log to indicate QC completed
  order.status_history.push({
    status: order.status,
    changed_at: new Date(),
    changed_by: {
      id: req.user._id,
      name: req.user.name || req.user.email,
    },
    notes: "QC Check complete. Items restocked.",
  });

  await order.save();

  res.json({
    success: true,
    message: "QC confirmed and items restocked",
    order,
  });
});
