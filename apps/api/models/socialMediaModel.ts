import mongoose, { Document } from "mongoose";

export interface ISocialMediaDocument extends Document {
  name: string;
  platform: string;
  href: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  webhookUrl?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const socialMediaSchema = new mongoose.Schema<ISocialMediaDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      required: true,
      enum: [
        "facebook",
        "instagram",
        "twitter",
        "linkedin",
        "youtube",
        "tiktok",
        "pinterest",
        "whatsapp",
        "telegram",
        "other",
      ],
    },
    href: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "",
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Additional sensitive data fields
    apiKey: {
      type: String,
      default: "",
    },
    apiSecret: {
      type: String,
      default: "",
    },
    accessToken: {
      type: String,
      default: "",
    },
    webhookUrl: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const SocialMedia = mongoose.model<ISocialMediaDocument>("SocialMedia", socialMediaSchema);

export default SocialMedia;
