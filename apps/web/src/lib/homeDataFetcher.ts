/**
 * Home Page Data Fetchers
 *
 * Uses Next.js native fetch caching via api.ts (which sets `force-cache` +
 * `next: { revalidate: 600 }` by default on the server side).
 *
 * Typed sections load products by product-type slug so each homepage block
 * shows its own catalog slice.
 */
import api from "@/lib/api";
import {
  PRODUCT_ENDPOINTS,
  PRODUCT_TYPE_ENDPOINTS,
  CATEGORY_ENDPOINTS,
  BLOG_ENDPOINTS,
  BANNER_ENDPOINTS,
} from "@/constants/endpoints";
import { ApiProduct } from "@/hooks/useProducts";
import { ProductType } from "@/hooks/useProductTypes";
import { Category } from "@/hooks/useCategories";
import type { Blog } from "@/components/home/LatestBlogs";
import type { HeroBanner, BannersResponse } from "@/types/banner";
import type { CustomerReview } from "@/components/about/AboutTestimonials";

const REVALIDATE = 600;
const HOME_PRODUCT_BASE = "home-decor";

async function getProducts(params: string): Promise<ApiProduct[]> {
  try {
    const res = await api.get<{ products: ApiProduct[]; total: number }>(
      `${PRODUCT_ENDPOINTS.BASE}?${params}`,
      { next: { revalidate: REVALIDATE } },
    );
    return res.data.products || [];
  } catch {
    return [];
  }
}

export async function getHomeProductTypes(): Promise<ProductType[]> {
  try {
    const res = await api.get<ProductType[]>(`${PRODUCT_TYPE_ENDPOINTS.BASE}`, {
      next: { revalidate: REVALIDATE },
    });
    return res.data || [];
  } catch {
    return [];
  }
}

/** Products tagged with the given product-type slug. */
export async function getProductsByTypeSlug(
  slug: string,
  limit: number,
): Promise<ApiProduct[]> {
  return getProducts(`productTypes=${slug}&limit=${limit}`);
}

export async function getOurProducts(): Promise<ApiProduct[]> {
  return getProducts(`productBase=${HOME_PRODUCT_BASE}&limit=12`);
}

export async function getParentCategories(): Promise<Category[]> {
  try {
    const res = await api.get<{ categories: Category[] }>(
      CATEGORY_ENDPOINTS.BASE,
      { next: { revalidate: REVALIDATE } },
    );
    return (res.data.categories || []).filter((cat) => !cat.parent);
  } catch {
    return [];
  }
}

export async function getCategoriesByBase(
  base: string,
  perPage = 16,
): Promise<Category[]> {
  try {
    const res = await api.get<{ categories: Category[] }>(
      `${CATEGORY_ENDPOINTS.BASE}?bases=${base}&perPage=${perPage}`,
      { next: { revalidate: REVALIDATE } },
    );
    const categories = res.data.categories || [];
    if (categories.length) return categories;
  } catch {
    /* fall through */
  }
  return getParentCategories();
}

export async function getLatestBlogs(): Promise<Blog[]> {
  try {
    const res = await api.get<{ blogs: Blog[] }>(
      `${BLOG_ENDPOINTS.BASE}?limit=4`,
      { next: { revalidate: REVALIDATE } },
    );
    return res.data.blogs || [];
  } catch {
    return [];
  }
}

export async function getHeroBanners(): Promise<HeroBanner[]> {
  try {
    const res = await api.get<BannersResponse>(
      `${BANNER_ENDPOINTS.BASE}?bannerType=hero-banner`,
      { next: { revalidate: REVALIDATE } },
    );
    return res.data?.banners || [];
  } catch {
    return [];
  }
}

type ApprovedReviewApi = {
  reviewId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isApproved: boolean;
};

/** Approved product reviews for home testimonials */
export async function getApprovedTestimonials(): Promise<CustomerReview[]> {
  try {
    const res = await api.get<ApprovedReviewApi[]>(
      PRODUCT_ENDPOINTS.APPROVED_REVIEWS,
      { next: { revalidate: 60 } },
    );
    const reviews = Array.isArray(res.data) ? res.data : [];
    return reviews.slice(0, 12).map((review, index) => {
      const date = review.createdAt
        ? new Date(review.createdAt).toLocaleString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "";
      return {
        _id: String(review.reviewId || index),
        name: review.userName || "Customer",
        date,
        rating: review.rating,
        text: review.comment,
        avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(
          String(review.reviewId || review.userName || index),
        )}`,
        isVerified: true,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Home-decor products for a product-type slug (Newly Launched / Most Loved).
 * Falls back to type-only if the base filter returns nothing.
 */
export async function getBeautyProductsByTypeSlug(
  slug: string,
  limit: number,
): Promise<ApiProduct[]> {
  const byBase = await getProducts(
    `productTypes=${slug}&productBase=${HOME_PRODUCT_BASE}&limit=${limit}`,
  );
  if (byBase.length) return byBase;
  return getProducts(`productTypes=${slug}&limit=${limit}`);
}
