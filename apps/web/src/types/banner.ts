/**
 * Banner Types
 * Shared types for Hero Banners and Ads Banners across the application
 */

// Product Base reference (can be string ID or populated object)
export interface ProductBase {
  _id?: string;
  name?: string;
  title?: string;
  slug?: string;
}

// Product Type reference (can be string ID or populated object)
export interface ProductTypeRef {
  _id?: string;
  name?: string;
  slug?: string;
}

// Hero Banner (used in carousel sections)
export interface HeroBanner {
  _id: string;
  name: string;
  discount?: string;
  title: string;
  description?: string;
  buttonTitle?: string;
  buttonHref?: string;
  startFrom: number;
  image?: string;
  bannerType: "hero-banner";
  bannerPage: string;
  bgColor?: string;
  textColor?: string;
  weight?: number;
  createdAt: string;
  updatedAt: string;
}

// Ads Banner (promotional banners with product base/type filtering)
export interface AdsBanner {
  _id: string;
  name: string;
  title: string;
  description?: string;
  discount?: string;
  image: string;
  buttonTitle?: string;
  buttonHref?: string;
  bgColor?: string;
  cardColor?: string;
  bannerType: "promotional";
  isActive: boolean;
  order: number;
  productBases?: (string | ProductBase)[];
  productTypes?: (string | ProductTypeRef)[];
  createdAt?: string;
  updatedAt?: string;
}

// Generic Banner type (union of all banner types)
export type Banner = HeroBanner | AdsBanner;

// API Response types
export interface BannersResponse {
  banners: HeroBanner[];
}

export interface AdsBannersResponse {
  adsBanners: AdsBanner[];
}
