/**
 * Home Page Data Fetchers
 *
 * Uses Next.js native fetch caching via api.ts (which sets `force-cache` +
 * `next: { revalidate: 600 }` by default on the server side).
 *
 * WHY NOT unstable_cache?
 * The Next.js data cache (unstable_cache) has a hard 2MB per-entry limit.
 * Product datasets can easily exceed this. Native fetch caching has no such
 * limit — it operates at the HTTP response level, keyed by URL, and is
 * perfectly suited for large API payloads.
 *
 * All fetches are fired in parallel via Promise.all in fetchAllHomeData().
 */
import api from "@/lib/api";
import {
  PRODUCT_ENDPOINTS,
  PRODUCT_TYPE_ENDPOINTS,
  CATEGORY_ENDPOINTS,
  BLOG_ENDPOINTS,
  ADS_BANNER_ENDPOINTS,
  BANNER_ENDPOINTS,
} from "@/constants/endpoints";
import { ApiProduct } from "@/hooks/useProducts";
import { ProductType } from "@/hooks/useProductTypes";
import { Category } from "@/hooks/useCategories";
import type { Blog } from "@/components/home/LatestBlogs";
import type {
  HeroBanner,
  AdsBanner,
  BannersResponse,
  AdsBannersResponse,
} from "@/types/banner";

// 10-minute revalidation — matches the previous unstable_cache TTL
const REVALIDATE = 600;

// ─────────────────────────────────────────────
// PRODUCT TYPES
// ─────────────────────────────────────────────
export async function getHomeProductTypes(
): Promise<ProductType[]> {
  try {
    const res = await api.get<ProductType[]>(
      `${PRODUCT_TYPE_ENDPOINTS.BASE}`,
      { next: { revalidate: REVALIDATE } },
    );
    return res.data || [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// PRODUCTS BY TYPE SLUG
// ─────────────────────────────────────────────
export async function getProductsByTypeSlug(
  slug: string,
  limit: number,
): Promise<ApiProduct[]> {
  try {
    const res = await api.get<{ products: ApiProduct[]; total: number }>(
      `${PRODUCT_ENDPOINTS.BASE}?productTypes=${slug}&limit=${limit}`,
      { next: { revalidate: REVALIDATE } },
    );
    return res.data.products || [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// ALL PRODUCTS (for OurProducts section)
// ─────────────────────────────────────────────
export async function getOurProducts(): Promise<ApiProduct[]> {
  try {
    const res = await api.get<{ products: ApiProduct[]; total: number }>(
      `${PRODUCT_ENDPOINTS.BASE}?limit=12`,
      { next: { revalidate: REVALIDATE } },
    );
    return res.data.products || [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// PARENT CATEGORIES
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// LATEST BLOGS
// ─────────────────────────────────────────────
export async function getLatestBlogs(productBase?: string): Promise<Blog[]> {
  try {
    let url = `${BLOG_ENDPOINTS.BASE}?limit=4`;
    if (productBase) url += `&productBase=${productBase}`;
    const res = await api.get<{ blogs: Blog[] }>(url, {
      next: { revalidate: REVALIDATE },
    });
    return res.data.blogs || [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// HERO BANNERS
// ─────────────────────────────────────────────
export async function   getHeroBanners(): Promise<HeroBanner[]> {
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

// ─────────────────────────────────────────────
// ADS BANNERS
// ─────────────────────────────────────────────
export async function getAdsBanners(): Promise<AdsBanner[]> {
  try {
    const res = await api.get<AdsBannersResponse>(
      `${ADS_BANNER_ENDPOINTS.BASE}?bannerType=promotional`,
      { next: { revalidate: REVALIDATE } },
    );
    return res.data.adsBanners || [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// ALL HOME DATA IN ONE PARALLEL BATCH
// ─────────────────────────────────────────────
export interface HomePageData {
  heroSlides: HeroBanner[];
  productTypes: ProductType[];
  bestSellingProducts: ApiProduct[];
  discountedProducts: ApiProduct[];
  topSellingProducts: ApiProduct[];
  newlyLaunchedProducts: ApiProduct[];
  beautyProducts: ApiProduct[];
  ourProducts: ApiProduct[];
  parentCategories: Category[];
  latestBlogs: Blog[];
  adsBanners: AdsBanner[];
}

export async function fetchAllHomeData(
): Promise<HomePageData> {
  // ✅ All fetches run in parallel — zero serial waterfalls
  const [
    heroSlides,
    productTypes,
    bestSellingProducts,
    discountedProducts,
    topSellingProducts,
    newlyLaunchedProducts,
    beautyProducts,
    ourProducts,
    parentCategories,
    latestBlogs,
    adsBanners,
  ] = await Promise.all([
    getHeroBanners(),
    getHomeProductTypes(),
    getProductsByTypeSlug("best-selling", 10),
    getProductsByTypeSlug("discounted-products", 6),
    getProductsByTypeSlug("top-selling-products", 25),
    getProductsByTypeSlug("newly-lunch-products", 10),
    getProductsByTypeSlug("beauty-products", 8),
    getOurProducts(),
    getParentCategories(),
    getLatestBlogs("healthcare"),
    getAdsBanners(),
  ]);

  return {
    heroSlides,
    productTypes,
    bestSellingProducts,
    discountedProducts,
    topSellingProducts,
    newlyLaunchedProducts,
    beautyProducts,
    ourProducts,
    parentCategories,
    latestBlogs,
    adsBanners,
  };
}
