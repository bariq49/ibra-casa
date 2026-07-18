import mongoose, { Document } from "mongoose";

export interface IAdsBannerDocument extends Document {
  name: string;
  title: string;
  description?: string;
  image: string;
  buttonTitle?: string;
  buttonHref?: string;
  bgColor?: string;
  cardColor?: string;
  bannerType: "advertisement" | "promotional" | "seasonal" | "offer";
  productTypes?: mongoose.Types.ObjectId[];
  productBases?: mongoose.Types.ObjectId[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const adsBannerSchema = new mongoose.Schema<IAdsBannerDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    buttonTitle: {
      type: String,
      trim: true,
    },
    buttonHref: {
      type: String,
      trim: true,
    },
    bgColor: {
      type: String,
      trim: true,
    },
    cardColor: {
      type: String,
      trim: true,
    },
    bannerType: {
      type: String,
      required: [true, "Banner type is required"],
      enum: ["advertisement", "promotional", "seasonal", "offer"],
      default: "advertisement",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    productTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductType",
      },
    ],
    productBases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductBase",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const AdsBanner = mongoose.model<IAdsBannerDocument>("AdsBanner", adsBannerSchema);

export default AdsBanner;
