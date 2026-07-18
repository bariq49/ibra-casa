import mongoose, { Document, Schema } from "mongoose";

export interface ICommentDocument extends Document {
  blog: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new mongoose.Schema<ICommentDocument>(
  {
    blog: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: [true, "Blog reference is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Comment = mongoose.model<ICommentDocument>("Comment", commentSchema);

export default Comment;
