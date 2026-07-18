import mongoose, { Document } from "mongoose";

export interface IBannerDocument extends Document {
  name: string;
  discount?: string;
  title: string;
  description?: string;
  buttonTitle?: string;
  buttonHref?: string;
  startFrom: number;
  image?: string;
  bannerType: string;
  bannerPage: string;
  bgColor?: string;
  textColor?: string;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new mongoose.Schema<IBannerDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    buttonTitle: {
      type: String,
      required: false,
    },
    buttonHref: {
      type: String,
      required: false,
    },
    startFrom: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    bannerType: {
      type: String,
      required: true,
    },
    bannerPage: {
      type: String,
      required: true,
    },
    bgColor: {
      type: String,
      required: false,
    },
    textColor: {
      type: String,
      required: false,
    },
    weight: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Banner = mongoose.model<IBannerDocument>("Banner", bannerSchema);

export default Banner;
