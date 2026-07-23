import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["admin", "user", "employee", "vendor", "preview"] as const, {
    message: "Please select a valid role",
  }),
});

export const userSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .optional(),
    role: z.enum(["admin", "user", "employee", "vendor", "preview"] as const, {
      message: "Please select a valid role",
    }),
    employee_role: z
      .enum(
        [
          "packer",
          "deliveryman",
          "accounts",
          "incharge",
          "call_center",
        ] as const,
        {
          message: "Please select a valid employee role",
        },
      )
      .optional()
      .nullable(),
    avatar: z.string().optional(),
  })
  .refine(
    (data) => {
      // If role is employee, employee_role must be provided
      if (data.role === "employee") {
        return data.employee_role != null && data.employee_role !== undefined;
      }
      return true;
    },
    {
      message: "Employee role is required when role is set to employee",
      path: ["employee_role"],
    },
  );

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
  icon: z.string().optional(),

  parent: z.string().optional().nullable(),
  order: z.coerce.number().default(0),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  isFavorite: z.boolean().default(false).optional(),
  productBases: z.array(z.string()).optional(),
});

export const brandSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z.string().optional(),
  image: z.string().optional(),
  productBase: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false).optional(),
  isFavorite: z.boolean().default(false).optional(),
});

export const productTypeSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  banner: z.union([z.string(), z.instanceof(File)]).optional(),
  bannerImages: z.array(z.union([z.string(), z.instanceof(File)])).optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
  bgColor: z
    .string()
    .min(1, "Background color is required")
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color format")
    .default("#ffffff"),
  productBasesBg: z.record(z.string(), z.string().optional()).optional(),
  productBases: z.array(z.string()).optional(),
});

export const productBaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0),
});

export const productSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z.string().optional(),
  description: z
    .string()
    .refine(
      (val) => val.replace(/<[^>]*>/g, "").trim().length >= 10,
      { message: "Description must be at least 10 characters" }
    ),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  discountPercentage: z.number().min(0).max(100),
  stock: z.number().min(0),
  purchasedQuantity: z.number().min(0),
  category: z.string().min(1, { message: "Please select a category" }),
  brand: z.string().min(1, { message: "Please select a brand" }),
  images: z
    .array(z.string())
    .min(1, { message: "Please upload at least one image" })
    .max(
      parseInt(import.meta.env.VITE_MAX_PRODUCT_IMAGES) || 6,
      `Maximum ${parseInt(import.meta.env.VITE_MAX_PRODUCT_IMAGES) || 6} images allowed`,
    ),
  image: z.string().optional(), // Deprecated: kept for backward compatibility
  bg: z.string().optional(),
  productBase: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  weights: z.array(z.string()).optional(),
  productTypes: z.array(z.string()).optional(),
  isNewItem: z.boolean().default(false).optional(),
  faqs: z
    .array(
      z.object({
        question: z.string().min(1, { message: "Question is required" }),
        answer: z.string().min(1, { message: "Answer is required" }),
      }),
    )
    .optional()
    .default([]),
});

export const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
});

export const blogAuthorSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  image: z.string().min(1, { message: "Image is required" }),
  role: z.string().optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  socialLinks: z
    .object({
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
  isActive: z.boolean().default(true),
});

export const blogCategorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.union([z.number(), z.string()]).optional().transform((v) => v === "" ? undefined : Number(v)),
});

export const blogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().optional(),
  previewImage: z.string().min(1, "Preview image is required"),
  bannerImage: z.string().optional(),
  content: z.string().min(20, "Content must be at least 20 characters"),
  excerpt: z.string().max(300).optional(),
  author: z.string().min(1, "Author is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  productBases: z.array(z.string()).optional().default([]),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  readTime: z.number().optional(),
});

export const sizeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
  displayOrder: z.number().int().min(0),
  priceModifier: z.number().optional(),
});

export const colorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
  displayOrder: z.number().int().min(0),
  priceModifier: z.number().optional(),
});

export const weightSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
  displayOrder: z.number().int().min(0),
  priceModifier: z.number().optional(),
});

export const badgeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  displayOrder: z.number().int().min(0),
});
