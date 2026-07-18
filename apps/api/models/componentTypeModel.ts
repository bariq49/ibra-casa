import mongoose, { Document } from "mongoose";

export interface IComponentTypeDocument extends Document {
  name: string;
  label: string;
  description?: string;
  icon: string;
  structure: any;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const componentTypeSchema = new mongoose.Schema<IComponentTypeDocument>(
  {
    name: {
      type: String,
      required: [true, "Component type name is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      required: [true, "Display label is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "component",
    },
    structure: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
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


const ComponentType = mongoose.model<IComponentTypeDocument>("ComponentType", componentTypeSchema);

export default ComponentType;
