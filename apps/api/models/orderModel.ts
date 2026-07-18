import mongoose, { Document } from "mongoose";
import { IOrder, IOrderItem } from "../types/index.js";

// Extended interface for Order with Mongoose Document
export interface IOrderDocument
  extends Omit<IOrder, "_id" | "items" | "user">, Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "cod_collected";
  paymentMethod: "stripe" | "cod";
  payment_info: {
    gateway: "stripe" | "cod";
    stripe?: {
      paymentIntentId?: string;
      sessionId?: string;
      paymentMethodType?: string;
      cardBrand?: string;
      cardLast4?: string;
      receiptUrl?: string;
      chargeId?: string;
    };
    paidAmount?: number;
    currency?: string;
    paidAt?: Date;
  };
  paymentIntentId?: string;
  stripeSessionId?: string;
  paidAt?: Date;
  status_updates: {
    address_confirmed?: {
      by: { id: mongoose.Types.ObjectId; name: string };
      at: Date;
      notes?: string;
    };
    order_confirmed?: {
      by: { id: mongoose.Types.ObjectId; name: string };
      at: Date;
    };
    packed?: { by: { id: mongoose.Types.ObjectId; name: string }; at: Date };
    delivering?: {
      by: { id: mongoose.Types.ObjectId; name: string };
      at: Date;
    };
    delivered?: { by: { id: mongoose.Types.ObjectId; name: string }; at: Date };
    completed?: { by: { id: mongoose.Types.ObjectId; name: string }; at: Date };
  };
  assignedPacker?: mongoose.Types.ObjectId;
  assignedDeliveryman?: mongoose.Types.ObjectId;
  codAmount: number;
  codCollectedAt?: Date;
  codCollectedBy?: mongoose.Types.ObjectId;
  codReturnedAt?: Date;
  codReturnedTo?: mongoose.Types.ObjectId;
  status_history: {
    status: string;
    changed_at: Date;
    changed_by: { id: mongoose.Types.ObjectId; name: string };
    notes: string;
  }[];
  qcStatus: "unneeded" | "pending" | "restocked";
  stockReduced: boolean;
}

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
  },
  // Vendor snapshot — captured at order time so payouts/commission
  // are stable even if product.vendor or platform commissionRate change later.
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    default: null,
  },
  commissionRate: {
    type: Number,
    default: 0,
  },
});

const orderSchema = new mongoose.Schema<IOrderDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "address_confirmed",
        "confirmed",
        "packed",
        "delivering",
        "delivered",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cod_collected"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "cod"],
      default: "stripe",
    },
    // Comprehensive payment information for payment gateways
    payment_info: {
      gateway: {
        type: String,
        enum: ["stripe", "cod"],
      },
      // Stripe specific fields
      stripe: {
        paymentIntentId: String,
        sessionId: String,
        paymentMethodType: String, // card, ideal, etc.
        cardBrand: String, // visa, mastercard, amex
        cardLast4: String,
        receiptUrl: String,
        chargeId: String,
      },
      // Common fields
      paidAmount: Number,
      currency: String,
      paidAt: Date,
    },
    shippingAddress: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
      emailAddress: {
        type: String,
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
      },
    },
    paymentIntentId: {
      type: String,
    },
    stripeSessionId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    // Comprehensive status update tracking
    status_updates: {
      address_confirmed: {
        by: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          name: String,
        },
        at: Date,
        notes: String,
      },
      order_confirmed: {
        by: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          name: String,
        },
        at: Date,
      },
      packed: {
        by: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          name: String,
        },
        at: Date,
      },
      delivering: {
        by: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          name: String,
        },
        at: Date,
      },
      delivered: {
        by: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          name: String,
        },
        at: Date,
      },
      completed: {
        by: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          name: String,
        },
        at: Date,
      },
    },
    // Employee assignments
    assignedPacker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedDeliveryman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // COD tracking
    codAmount: {
      type: Number,
      default: 0,
    },
    codCollectedAt: {
      type: Date,
    },
    codCollectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    codReturnedAt: {
      type: Date,
    },
    codReturnedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Status history for audit trail - tracks all status changes with user info
    status_history: [
      {
        status: {
          type: String,
          required: true,
        },
        changed_at: {
          type: Date,
          default: Date.now,
        },
        changed_by: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
        },
        notes: {
          type: String,
          default: "",
        },
      },
    ],
    qcStatus: {
      type: String,
      enum: ["unneeded", "pending", "restocked"],
      default: "unneeded",
    },
    stockReduced: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IOrderDocument>("Order", orderSchema);
