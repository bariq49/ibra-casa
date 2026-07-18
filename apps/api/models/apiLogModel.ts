import mongoose, { Document, Schema } from "mongoose";

export interface IApiLog extends Document {
  method: string;
  originalUrl: string;
  statusCode: number;
  responseTimeMs: number;
  ip: string;
  userAgent: string;
  errorObj?: any;
  createdAt: Date;
}

const apiLogSchema = new Schema<IApiLog>(
  {
    method: {
      type: String,
      required: true,
      index: true,
    },
    originalUrl: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
      index: true,
    },
    responseTimeMs: {
      type: Number,
      required: true,
    },
    ip: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
    errorObj: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need insertion time
    // Optional: Enable TTL index if logs should auto-delete after N days to save space
    // For now we persist fully to allow manual flushing via the admin dashboard
  },
);

export default mongoose.model<IApiLog>("ApiLog", apiLogSchema);
