import mongoose, { Document } from "mongoose";

export interface ICareerPageConfigDocument extends Document {
  collageImages: string[];
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const careerPageConfigSchema = new mongoose.Schema<ICareerPageConfigDocument>(
  {
    collageImages: [
      {
        type: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const CareerPageConfig = mongoose.model<ICareerPageConfigDocument>(
  "CareerPageConfig",
  careerPageConfigSchema
);

export default CareerPageConfig;
