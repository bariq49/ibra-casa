import mongoose, { Document } from "mongoose";

export interface ICoupon {
  name: string;
  code: string;
  discountType: "percentage" | "fixedAmount";
  discountValue: number;
  minPurchaseAmount?: number;
  startDate?: Date;
  endDate?: Date;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface ICouponDocument extends ICoupon, Document {}

const couponSchema = new mongoose.Schema<ICouponDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixedAmount"],
      required: true,
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model<ICouponDocument>("Coupon", couponSchema);

export default Coupon;
