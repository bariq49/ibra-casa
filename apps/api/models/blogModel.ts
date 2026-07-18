import mongoose, { Document, Schema } from "mongoose";

export interface IBlogDocument extends Document {
  title: string;
  slug: string;
  previewImage: string;
  bannerImage?: string;
  content: string;
  excerpt?: string;
  author: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  tags?: string[];
  productBases?: mongoose.Types.ObjectId[];
  isFeatured?: boolean;
  isPublished: boolean;
  publishedAt?: Date;
  readTime?: number; // In minutes
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new mongoose.Schema<IBlogDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    previewImage: {
      type: String,
      required: [true, "Preview image is required"],
    },
    bannerImage: {
      type: String,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "BlogAuthor",
      required: [true, "Author is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: [true, "Category is required"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    productBases: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProductBase",
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    readTime: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Slugify title pre-save
blogSchema.pre("save", async function () {
  if (!this.isModified("title")) {
    return;
  }
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
});

const Blog = mongoose.model<IBlogDocument>("Blog", blogSchema);

export default Blog;
