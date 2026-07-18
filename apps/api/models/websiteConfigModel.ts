import mongoose, { Document } from "mongoose";

export interface IWebsiteConfigDocument extends Document {
  pageType: "home" | "product" | "blog" | "category" | "about" | "contact";
  componentType: string;
  title: string;
  description?: string;
  weight: number;
  isActive: boolean;
  settings: {
    images?: string[];
    bannerId?: mongoose.Types.ObjectId;
    bannerIds?: { _id: mongoose.Types.ObjectId }[]; // Simplified structure for array of objects with ids
    productDisplayType?: "grid" | "list" | "carousel" | "featured";
    productsLimit?: number;
    productFilter?: {
      category?: mongoose.Types.ObjectId;
      brand?: mongoose.Types.ObjectId;
      tags?: string[];
      isFeatured?: boolean;
      isOnSale?: boolean;
      minPrice?: number;
      maxPrice?: number;
    };
    showRating?: boolean;
    showQuickView?: boolean;
    adImageUrl?: string;
    adLink?: string;
    adPosition?: "top" | "middle" | "bottom" | "sidebar";
    adSize?: "small" | "medium" | "large" | "full-width";
    carouselType?: "products" | "images" | "brands" | "categories";
    autoPlay?: boolean;
    autoPlaySpeed?: number;
    showDots?: boolean;
    showArrows?: boolean;
    itemsPerView?: number;
    categoryIds?: { _id: mongoose.Types.ObjectId }[];
    categoryDisplayStyle?: "grid" | "carousel" | "list";
    brandIds?: { _id: mongoose.Types.ObjectId }[];
    brandDisplayStyle?: "grid" | "carousel" | "list";
    customHtml?: string;
    customCss?: string;
    backgroundColor?: string;
    textColor?: string;
    containerWidth?: "full" | "container" | "narrow";
    paddingTop?: number;
    paddingBottom?: number;
    marginTop?: number;
    marginBottom?: number;
  };
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const websiteConfigSchema = new mongoose.Schema<IWebsiteConfigDocument>(
  {
    pageType: {
      type: String,
      required: [true, "Page type is required"],
      enum: ["home", "product", "blog", "category", "about", "contact"],
      index: true,
    },
    componentType: {
      type: String,
      required: [true, "Component type is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Component title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    weight: {
      type: Number,
      required: [true, "Weight/order is required"],
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    settings: {
      // Generic images array for any component
      images: [String],

      // Banner settings
      bannerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Banner",
      },
      bannerIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Banner",
        },
      ],

      // Products settings
      productDisplayType: {
        type: String,
        enum: ["grid", "list", "carousel", "featured"],
      },
      productsLimit: Number,
      productFilter: {
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        brand: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Brand",
        },
        tags: [String],
        isFeatured: Boolean,
        isOnSale: Boolean,
        minPrice: Number,
        maxPrice: Number,
      },
      showRating: Boolean,
      showQuickView: Boolean,

      // Ads settings
      adImageUrl: String,
      adLink: String,
      adPosition: {
        type: String,
        enum: ["top", "middle", "bottom", "sidebar"],
      },
      adSize: {
        type: String,
        enum: ["small", "medium", "large", "full-width"],
      },

      // Carousel settings
      carouselType: {
        type: String,
        enum: ["products", "images", "brands", "categories"],
      },
      autoPlay: Boolean,
      autoPlaySpeed: Number,
      showDots: Boolean,
      showArrows: Boolean,
      itemsPerView: Number,

      // Featured categories settings
      categoryIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
      ],
      categoryDisplayStyle: {
        type: String,
        enum: ["grid", "carousel", "list"],
      },

      // Brands settings
      brandIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Brand",
        },
      ],
      brandDisplayStyle: {
        type: String,
        enum: ["grid", "carousel", "list"],
      },

      // Custom HTML
      customHtml: String,
      customCss: String,

      // Common settings
      backgroundColor: String,
      textColor: String,
      containerWidth: {
        type: String,
        enum: ["full", "container", "narrow"],
        default: "container",
      },
      paddingTop: Number,
      paddingBottom: Number,
      marginTop: Number,
      marginBottom: Number,
    },
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
  }
);

// Index for efficient queries
websiteConfigSchema.index({ pageType: 1, weight: 1 });
websiteConfigSchema.index({ pageType: 1, isActive: 1, weight: 1 });

const WebsiteConfig = mongoose.model<IWebsiteConfigDocument>("WebsiteConfig", websiteConfigSchema);

export default WebsiteConfig;
