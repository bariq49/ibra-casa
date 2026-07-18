import mongoose, { Document } from "mongoose";

export interface ICareerDocument extends Document {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const careerSchema = new mongoose.Schema<ICareerDocument>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      default: "Remote",
    },
    type: {
      type: String,
      required: [true, "Job type is required"],
      trim: true,
      default: "Full-Time",
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requirements: [
      {
        type: String,
        required: [true, "At least one requirement is required"],
      },
    ],
    benefits: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
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

const Career = mongoose.model<ICareerDocument>("Career", careerSchema);

export default Career;
