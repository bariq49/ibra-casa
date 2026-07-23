import mongoose, { Document, Schema, Types } from "mongoose";

export interface IContact extends Document {
  firstName: string;
  lastName?: string;
  phone?: string;
  email: string;
  subject: string;
  message: string;
  user?: Types.ObjectId;
  source: "contact" | "faq";
}

const contactSchema = new Schema<IContact>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    source: {
      type: String,
      enum: ["contact", "faq"],
      default: "contact",
    },
  },
  {
    timestamps: true,
  },
);

const Contact = mongoose.model<IContact>("Contact", contactSchema);

export default Contact;
