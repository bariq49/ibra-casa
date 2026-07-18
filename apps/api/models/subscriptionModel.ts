import mongoose, { Document } from "mongoose";

export interface ISubscriptionDocument extends Document {
  email: string;
  source: "homepage_modal" | "footer" | "popup" | "other";
  preferences: {
    newsletter: boolean;
    promotions: boolean;
    newProducts: boolean;
  };
  status: "active" | "unsubscribed";
  unsubscribedAt?: Date;
  subscribedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new mongoose.Schema<ISubscriptionDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Invalid email format",
      },
    },
    source: {
      type: String,
      enum: ["homepage_modal", "footer", "popup", "other"],
      default: "other",
    },
    preferences: {
      newsletter: {
        type: Boolean,
        default: true,
      },
      promotions: {
        type: Boolean,
        default: true,
      },
      newProducts: {
        type: Boolean,
        default: true,
      },
    },
    status: {
      type: String,
      enum: ["active", "unsubscribed"],
      default: "active",
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Additional query indexes (email already indexed via unique:true on the field)
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ createdAt: -1 });

const Subscription = mongoose.model<ISubscriptionDocument>("Subscription", subscriptionSchema);

export default Subscription;
