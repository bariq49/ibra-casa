import mongoose, { Document, Schema } from "mongoose";

export interface IContactPageConfigDocument extends Document {
  title: string;
  subtitle: string;
  faqs: {
    q: string;
    a: string;
  }[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contactPageConfigSchema = new mongoose.Schema<IContactPageConfigDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      default: "We are happy to assist you",
    },
    subtitle: {
      type: String,
      required: [true, "Subtitle is required"],
      trim: true,
      default: "Here to help, anytime you need us.",
    },
    faqs: [
      {
        q: {
          type: String,
          required: [true, "Question is required"],
          trim: true,
        },
        a: {
          type: String,
          required: [true, "Answer is required"],
          trim: true,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const ContactPageConfig = mongoose.model<IContactPageConfigDocument>(
  "ContactPageConfig",
  contactPageConfigSchema,
);

export default ContactPageConfig;
