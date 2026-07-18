import mongoose, { Document, Model } from "mongoose";

export interface IPageBannerDocument extends Document {
  badge?: string;
  title: string;
  subTitle?: string;
  buttonTitle?: string;
  buttonHref?: string;
  buttonBg?: string;
  bannerType: mongoose.Types.ObjectId[];
  bannerBase: mongoose.Types.ObjectId[];
  image: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pageBannerSchema = new mongoose.Schema<IPageBannerDocument>(
  {
    badge: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    subTitle: {
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
    buttonBg: {
      type: String,
      required: false,
    },
    bannerType: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductType",
      },
    ],
    bannerBase: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductBase",
      },
    ],
    image: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const PageBanner = mongoose.model<IPageBannerDocument>(
  "PageBanner",
  pageBannerSchema,
);

export default PageBanner;
