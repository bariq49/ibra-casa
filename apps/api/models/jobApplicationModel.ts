import mongoose, { Document, Schema } from "mongoose";

export interface IJobApplication extends Document {
  careerId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  portfolioUrl?: string;
  coverLetter: string;
  status: "Pending" | "Reviewed" | "Shortlisted" | "Rejected";
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    careerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Career",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    portfolioUrl: {
      type: String,
    },
    coverLetter: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Shortlisted", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const JobApplication = mongoose.model<IJobApplication>("JobApplication", jobApplicationSchema);

export default JobApplication;
