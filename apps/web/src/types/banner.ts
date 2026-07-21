/**
 * Banner Types — home hero banners
 */

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
  bannerType: string;
  bgColor?: string;
  textColor?: string;
  weight?: number;
  createdAt: string;
  updatedAt: string;
}

export type Banner = HeroBanner;

export interface BannersResponse {
  banners: HeroBanner[];
}
