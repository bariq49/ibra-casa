import mongoose, { Document } from "mongoose";

export interface ISystemConfigDocument extends Document {
  apiLogLevel: "all" | "error" | "success" | "none";
  /** Store / checkout settings */
  enableStripe: boolean;
  enableCod: boolean;
  enableBankTransfer: boolean;
  enablePaypal: boolean;
  taxRate: number;
  shippingCost: number;
  freeDeliveryThreshold: number;
  currency: string;
  storeName: string;
  supportEmail: string;
  updatedAt: Date;
  createdAt: Date;
}

const systemConfigSchema = new mongoose.Schema<ISystemConfigDocument>(
  {
    apiLogLevel: {
      type: String,
      enum: ["all", "error", "success", "none"],
      default: "error",
    },
    enableStripe: {
      type: Boolean,
      default: true,
    },
    enableCod: {
      type: Boolean,
      default: true,
    },
    enableBankTransfer: {
      type: Boolean,
      default: false,
    },
    enablePaypal: {
      type: Boolean,
      default: false,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 999,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    storeName: {
      type: String,
      default: "Ibra Casa",
    },
    supportEmail: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const SystemConfig = mongoose.model<ISystemConfigDocument>(
  "SystemConfig",
  systemConfigSchema,
);

export default SystemConfig;
