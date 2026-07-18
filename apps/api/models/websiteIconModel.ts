import mongoose, { Document } from "mongoose";

export interface IWebsiteIconDocument extends Document {
  name: string;
  key: string;
  imageUrl: string;
  description?: string;
  category: "logo" | "favicon" | "social" | "footer" | "header" | "other";
  dimensions?: {
    width?: number;
    height?: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const websiteIconSchema = new mongoose.Schema<IWebsiteIconDocument>(
  {
    name: {
      type: String,
      required: [true, "Icon name is required"],
      trim: true,
      unique: true,
    },
    key: {
      type: String,
      required: [true, "Icon key is required"],
      trim: true,
      unique: true,
      lowercase: true,
      // Note: mongoose unique validation may throw error if duplicate
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["logo", "favicon", "social", "footer", "header", "other"],
      default: "other",
    },
    dimensions: {
      width: Number,
      height: Number,
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

// Additional query indexes (name & key already indexed via unique:true on the fields)
websiteIconSchema.index({ category: 1 });
websiteIconSchema.index({ isActive: 1 });

const WebsiteIcon = mongoose.model<IWebsiteIconDocument>("WebsiteIcon", websiteIconSchema);

export default WebsiteIcon;
