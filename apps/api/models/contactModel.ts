import mongoose, { Document, Schema, Types } from "mongoose";

export interface IContact extends Document {
  subject: string;
  message: string;
  user: Types.ObjectId;
  source: "contact" | "faq";
}

const contactSchema = new Schema<IContact>(
  {
    subject: {
      type: String,
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
      required: [true, "User ID is required to submit a contact form"],
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
