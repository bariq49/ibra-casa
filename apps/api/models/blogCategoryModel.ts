import mongoose, { Document } from "mongoose";

export interface IBlogCategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
  count: number; // Virtual for post count
  createdAt: Date;
  updatedAt: Date;
}

const blogCategorySchema = new mongoose.Schema<IBlogCategoryDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Slugify name pre-save
blogCategorySchema.pre("save", async function () {
  if (!this.isModified("name")) {
    return;
  }
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
});

const BlogCategory = mongoose.model<IBlogCategoryDocument>(
  "BlogCategory",
  blogCategorySchema,
);

export default BlogCategory;
