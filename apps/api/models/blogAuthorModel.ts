import mongoose, { Document } from "mongoose";

export interface IBlogAuthorDocument extends Document {
  name: string;
  slug: string;
  image: string;
  role?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blogAuthorSchema = new mongoose.Schema<IBlogAuthorDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    role: {
      type: String, // e.g., "Content Writer", "Editor"
      default: "Author",
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    socialLinks: {
      twitter: String,
      linkedin: String,
      facebook: String,
      instagram: String,
      website: String,
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

// Slugify name pre-save
blogAuthorSchema.pre("save", async function () {
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

const BlogAuthor = mongoose.model<IBlogAuthorDocument>(
  "BlogAuthor",
  blogAuthorSchema,
);

export default BlogAuthor;
