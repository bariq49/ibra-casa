import mongoose, { Document } from "mongoose";

export interface IPurchaseDocument extends Document {
  purchaseNumber: string;
  status: "requisition" | "approved" | "purchased" | "received" | "cancelled";
  items: {
    productId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    purchasePrice: number;
    profitMargin: number;
    sellingPrice: number;
    totalCost: number;
  }[];
  totalAmount: number;
  supplier: {
    supplierId?: mongoose.Types.ObjectId;
    name: string;
    contact?: string;
    email?: string;
    address?: string;
  };
  notes: string;
  createdBy: {
    id: mongoose.Types.ObjectId;
    name?: string;
  };
  approvedBy?: {
    id: mongoose.Types.ObjectId;
    name?: string;
    at?: Date;
    notes?: string;
  };
  purchasedBy?: {
    id: mongoose.Types.ObjectId;
    name?: string;
    at?: Date;
    notes?: string;
  };
  receivedBy?: {
    id: mongoose.Types.ObjectId;
    name?: string;
    at?: Date;
    notes?: string;
  };
  statusHistory: {
    status: string;
    changedAt: Date;
    changedBy: {
      id: mongoose.Types.ObjectId;
      name: string;
    };
    notes: string;
  }[];
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  profitMargin: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100, // Percentage
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0,
  },
});

const purchaseSchema = new mongoose.Schema<IPurchaseDocument>(
  {
    purchaseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["requisition", "approved", "purchased", "received", "cancelled"],
      default: "requisition",
    },
    items: [purchaseItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    supplier: {
      supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
      },
      name: {
        type: String,
        required: true,
      },
      contact: String,
      email: String,
      address: String,
    },
    notes: {
      type: String,
      default: "",
    },
    // Workflow tracking
    createdBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: String,
    },
    approvedBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      at: Date,
      notes: String,
    },
    purchasedBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      at: Date,
      notes: String,
    },
    receivedBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      at: Date,
      notes: String,
    },
    // Status history for audit trail
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
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
    expectedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate purchase number before saving
purchaseSchema.pre("save", async function () {
  // Check if purchaseNumber exists, if not generate it. 
  // Note: schema says required, but we generate it here?
  if (!this.purchaseNumber) {
    // We need to cast this.constructor to Model to access countDocuments
    const count = await mongoose.model("Purchase").countDocuments();
    this.purchaseNumber = `PO-${String(count + 1).padStart(6, "0")}`;
  }
});

// Calculate total amount before saving
purchaseSchema.pre("save", function () {
  if (this.items && this.items.length > 0) {
      this.totalAmount = this.items.reduce((sum, item) => sum + item.totalCost, 0);
  }
});

const Purchase = mongoose.model<IPurchaseDocument>("Purchase", purchaseSchema);

export default Purchase;
