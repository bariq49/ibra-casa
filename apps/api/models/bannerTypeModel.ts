import mongoose, { Document } from "mongoose";

export interface IBannerTypeDocument extends Document {
  title: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const bannerTypeSchema = new mongoose.Schema<IBannerTypeDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const BannerType = mongoose.model<IBannerTypeDocument>(
  "BannerType",
  bannerTypeSchema,
);

export default BannerType;
