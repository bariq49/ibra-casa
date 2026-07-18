import mongoose, { Document, Schema } from "mongoose";

export interface ICustomerReviewDocument extends Document {
  name: string;
  date: string;
  rating: number;
  text: string;
  avatar: string;
  isVerified: boolean;
  isActive: boolean;
}

const customerReviewSchema = new Schema<ICustomerReviewDocument>(
  {
    name: { type: String, required: true },
    date: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    text: { type: String, required: true },
    avatar: { type: String, required: true },
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CustomerReview =
  mongoose.models.CustomerReview ||
  mongoose.model<ICustomerReviewDocument>("CustomerReview", customerReviewSchema);

export default CustomerReview;
