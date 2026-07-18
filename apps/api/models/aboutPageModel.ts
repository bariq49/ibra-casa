import mongoose, { Document } from "mongoose";

export interface IAboutPageConfigDocument extends Document {
  title: string;
  mission: string;
  vision: string;
  stats: {
    value: string;
    label: string;
  }[];
  heroImage?: string;
  heroImageSmall?: string;
  features: {
    title: string;
    description: string;
    bulletPoints: string[];
    imageOne?: string;
    imageTwo?: string;
  }[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const aboutPageConfigSchema = new mongoose.Schema<IAboutPageConfigDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      default: "Empowering Better Health at Home",
    },
    mission: {
      type: String,
      required: [true, "Mission statement is required"],
      trim: true,
    },
    vision: {
      type: String,
      required: [true, "Vision statement is required"],
      trim: true,
    },
    stats: [
      {
        value: {
          type: String,
          required: [true, "Stat value is required"],
          trim: true,
        },
        label: {
          type: String,
          required: [true, "Stat label is required"],
          trim: true,
        },
      },
    ],
    heroImage: { type: String },
    heroImageSmall: { type: String },
    features: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        bulletPoints: [{ type: String }],
        imageOne: { type: String },
        imageTwo: { type: String },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const AboutPageConfig = mongoose.model<IAboutPageConfigDocument>(
  "AboutPageConfig",
  aboutPageConfigSchema,
);

export default AboutPageConfig;
