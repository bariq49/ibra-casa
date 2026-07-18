import mongoose, { Document } from "mongoose";

export interface IVendorConfigDocument extends Document {
  vendorEnabled: boolean;
  defaultCommissionRate: number;
  minOrderAmount: number;
  allowVendorRegistration: boolean;
  requireApproval: boolean;
  maxProductsPerVendor?: number;
  createdAt: Date;
  updatedAt: Date;
}

const vendorConfigSchema = new mongoose.Schema<IVendorConfigDocument>(
  {
    vendorEnabled: {
      type: Boolean,
      default: true,
    },
    defaultCommissionRate: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    allowVendorRegistration: {
      type: Boolean,
      default: true,
    },
    requireApproval: {
      type: Boolean,
      default: true,
    },
    maxProductsPerVendor: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const VendorConfig = mongoose.model<IVendorConfigDocument>("VendorConfig", vendorConfigSchema);

export default VendorConfig;
