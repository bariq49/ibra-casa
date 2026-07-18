import mongoose, { Document } from "mongoose";

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  relatedOrderId?: mongoose.Types.ObjectId;
  image?: string;
  actionUrl?: string;
  actionText?: string;
  external: boolean;
  isRead: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  senderId?: mongoose.Types.ObjectId;
  isBulkSent: boolean;
  bulkSendId?: string;
  targetAudience: "all" | "specific" | "role-based";
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema<INotificationDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "order_placed",
        "order_confirmed",
        "order_shipped",
        "order_delivered",
        "order_cancelled",
        "payment_success",
        "payment_failed",
        "account_update",
        "general",
        "offer",
        "deal",
        "announcement",
        "promotion",
        "alert",
        "admin_message",
        "abandoned_cart",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    image: {
      type: String, // URL to notification image
      default: null,
    },
    actionUrl: {
      type: String, // Deep link or URL for action button
      default: null,
    },
    actionText: {
      type: String, // Text for action button
      default: null,
    },
    external: {
      type: Boolean, // Whether actionUrl opens in new tab (true) or same page (false)
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who sent the notification
      default: null,
    },
    isBulkSent: {
      type: Boolean,
      default: false,
    },
    bulkSendId: {
      type: String, // Group ID for bulk notifications
      default: null,
    },
    targetAudience: {
      type: String,
      enum: ["all", "specific", "role-based"],
      default: "specific",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model<INotificationDocument>("Notification", notificationSchema);
