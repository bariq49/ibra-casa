import mongoose, { Document, Types } from "mongoose";

export interface ITodaysOffer {
  title: string;
  description: string;
  products: Types.ObjectId[];
  endsAt: Date;
  isActive: boolean;
}

export interface ITodaysOfferDocument extends ITodaysOffer, Document {}

const todaysOfferSchema = new mongoose.Schema<ITodaysOfferDocument>(
  {
    title: {
      type: String,
      default: "Today's Top Offer",
      trim: true,
    },
    description: {
      type: String,
      default: "Up to 69% discount for limited time 🔥",
      trim: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    endsAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const TodaysOffer = mongoose.model<ITodaysOfferDocument>(
  "TodaysOffer",
  todaysOfferSchema,
);

export default TodaysOffer;
