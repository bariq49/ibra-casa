import asyncHandler from "express-async-handler";
import Subscription from "../models/subscriptionModel.js";
import {
  sendEmail,
  generateNewsletterEmailHTML,
} from "../utils/emailService.js";

// @desc    Subscribe to newsletter
// @route   POST /api/subscriptions/subscribe
// @access  Public
// @ts-ignore
export const subscribe = asyncHandler(async (req, res) => {
  const { email, source = "other", preferences = {} } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error("Invalid email format");
  }

  // Get IP and User Agent for tracking
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get("user-agent");

  // Check if already subscribed
  const existingSubscription = await Subscription.findOne({ email });

  if (existingSubscription) {
    if (existingSubscription.status === "active") {
      return res.status(200).json({
        success: true,
        message: "You are already subscribed to our newsletter",
        subscription: {
          email: existingSubscription.email,
          subscribedAt: existingSubscription.subscribedAt,
        },
      });
    } else {
      // Reactivate unsubscribed user
      existingSubscription.status = "active";
      // @ts-ignore
      existingSubscription.unsubscribedAt = null;
      existingSubscription.subscribedAt = new Date();
      existingSubscription.preferences = {
        ...existingSubscription.preferences,
        ...preferences,
      };
      await existingSubscription.save();

      return res.status(200).json({
        success: true,
        message: "Welcome back! Your subscription has been reactivated",
        subscription: {
          email: existingSubscription.email,
          subscribedAt: existingSubscription.subscribedAt,
        },
      });
    }
  }

  // Create new subscription
  const subscription = await Subscription.create({
    email,
    source,
    preferences: {
      newsletter: preferences.newsletter !== false,
      promotions: preferences.promotions !== false,
      newProducts: preferences.newProducts !== false,
    },
    ipAddress,
    userAgent,
  });

  res.status(201).json({
    success: true,
    message: "Successfully subscribed to our newsletter!",
    subscription: {
      email: subscription.email,
      subscribedAt: subscription.subscribedAt,
    },
  });
});

// @desc    Unsubscribe from newsletter
// @route   POST /api/subscriptions/unsubscribe
// @access  Public
// @ts-ignore
export const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const subscription = await Subscription.findOne({ email });

  if (!subscription) {
    res.status(404);
    throw new Error("Email not found in our subscription list");
  }

  if (subscription.status === "unsubscribed") {
    return res.status(200).json({
      success: true,
      message: "You are already unsubscribed",
    });
  }

  subscription.status = "unsubscribed";
  subscription.unsubscribedAt = new Date();
  await subscription.save();

  res.status(200).json({
    success: true,
    message: "Successfully unsubscribed from newsletter",
  });
});

// @desc    Get all subscriptions (Admin only)
// @route   GET /api/subscriptions
// @access  Private/Admin
export const getSubscriptions = asyncHandler(async (req, res) => {
  const { status, source, search, page = 1, limit = 20 } = req.query;

  const query: any = {};

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by source
  if (source) {
    query.source = source;
  }

  // Search by email
  if (search) {
    query.email = { $regex: search, $options: "i" };
  }

  // @ts-ignore
  const skip = (page - 1) * limit;

  const subscriptions = await Subscription.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    // @ts-ignore
    .limit(parseInt(limit));

  const total = await Subscription.countDocuments(query);

  res.json({
    success: true,
    subscriptions,
    total,
    pagination: {
      // @ts-ignore
      page: parseInt(page),
      // @ts-ignore
      limit: parseInt(limit),
      total,
      // @ts-ignore
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get subscription stats (Admin only)
// @route   GET /api/subscriptions/stats
// @access  Private/Admin
export const getSubscriptionStats = asyncHandler(async (req, res) => {
  const total = await Subscription.countDocuments();
  const active = await Subscription.countDocuments({ status: "active" });
  const unsubscribed = await Subscription.countDocuments({
    status: "unsubscribed",
  });

  // Get count by source (must match subscriptionModel enum)
  const modalCount = await Subscription.countDocuments({
    source: "homepage_modal",
    status: "active",
  });
  const footerCount = await Subscription.countDocuments({
    source: "footer",
    status: "active",
  });
  const manualCount = await Subscription.countDocuments({
    source: "other",
    status: "active",
  });
  const popupCount = await Subscription.countDocuments({
    source: "popup",
    status: "active",
  });

  // Get recent growth (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentGrowth = await Subscription.countDocuments({
    status: "active",
    createdAt: { $gte: thirtyDaysAgo },
  });

  res.json({
    success: true,
    total,
    active,
    unsubscribed,
    modal: modalCount + popupCount,
    footer: footerCount,
    manual: manualCount,
    recentGrowth,
  });
});

// @desc    Send newsletter to active subscribers (Admin only)
// @route   POST /api/subscriptions/send-newsletter
// @access  Private/Admin
export const sendNewsletter = asyncHandler(async (req, res) => {
  const { subject, message, html, buttonText, buttonUrl } = req.body;

  if (!subject?.trim() || !message?.trim()) {
    res.status(400);
    throw new Error("Subject and message are required");
  }

  const trimmedButtonText = buttonText?.trim() || "";
  const trimmedButtonUrl = buttonUrl?.trim() || "";

  if (
    (trimmedButtonText && !trimmedButtonUrl) ||
    (!trimmedButtonText && trimmedButtonUrl)
  ) {
    res.status(400);
    throw new Error("Both button text and button link are required together");
  }

  if (trimmedButtonUrl) {
    try {
      // eslint-disable-next-line no-new
      new URL(trimmedButtonUrl);
    } catch {
      res.status(400);
      throw new Error("Button link must be a valid URL");
    }
  }

  const subscribers = await Subscription.find({
    status: "active",
    "preferences.newsletter": { $ne: false },
  }).select("email");

  if (!subscribers.length) {
    res.status(400);
    throw new Error("No active subscribers to send to");
  }

  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();
  const bodyHtml = (html?.trim() || trimmedMessage.replace(/\n/g, "<br>"))
    .replace(
      /<img /gi,
      '<img style="max-width:100%;height:auto;border-radius:8px;display:block;margin:16px 0;" ',
    )
    .replace(
      /<p>/gi,
      '<p style="margin:0 0 14px 0;color:#495057;font-size:15px;line-height:1.7;">',
    )
    .replace(
      /<h1>/gi,
      '<h1 style="margin:0 0 12px 0;color:#1B1F23;font-size:22px;font-weight:700;">',
    )
    .replace(
      /<h2>/gi,
      '<h2 style="margin:0 0 12px 0;color:#1B1F23;font-size:20px;font-weight:700;">',
    )
    .replace(
      /<h3>/gi,
      '<h3 style="margin:0 0 10px 0;color:#1B1F23;font-size:18px;font-weight:600;">',
    )
    .replace(
      /<a /gi,
      '<a style="color:#1B1F23;font-weight:600;text-decoration:underline;" ',
    );

  const newsletterHtml = generateNewsletterEmailHTML(
    trimmedSubject,
    bodyHtml,
    trimmedButtonText,
    trimmedButtonUrl,
  );

  const failed: string[] = [];
  let sent = 0;

  const BATCH_SIZE = 5;
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((subscriber) =>
        sendEmail({
          to: subscriber.email,
          subject: trimmedSubject,
          message: trimmedMessage,
          html: newsletterHtml,
        }),
      ),
    );

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        sent += 1;
      } else {
        failed.push(batch[index].email);
      }
    });
  }

  res.status(200).json({
    success: true,
    message: `Newsletter sent to ${sent} of ${subscribers.length} subscribers`,
    total: subscribers.length,
    sent,
    failed: failed.length,
    failedEmails: failed,
  });
});

// @desc    Unsubscribe a user by ID (Admin only)
// @route   PATCH /api/subscriptions/:id/unsubscribe
// @access  Private/Admin
export const adminUnsubscribeSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  if (subscription.status === "unsubscribed") {
    res.status(200).json({
      success: true,
      message: "User is already unsubscribed",
      subscription,
    });
    return;
  }

  subscription.status = "unsubscribed";
  subscription.unsubscribedAt = new Date();
  await subscription.save();

  res.json({
    success: true,
    message: "User unsubscribed successfully",
    subscription,
  });
});

// @desc    Delete subscription (Admin only)
// @route   DELETE /api/subscriptions/:id
// @access  Private/Admin
export const deleteSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  await subscription.deleteOne();

  res.json({
    success: true,
    message: "Subscription deleted successfully",
  });
});
