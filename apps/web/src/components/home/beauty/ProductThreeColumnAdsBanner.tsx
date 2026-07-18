import React from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import { ADS_BANNER_ENDPOINTS } from "@/constants/endpoints";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/common/Container";

export interface AdsBanner {
  _id: string;
  name: string;
  title: string;
  description?: string;
  image: string;
  buttonTitle?: string;
  buttonHref?: string;
  bgColor?: string;
  cardColor?: string;
  bannerType: string;
  isActive: boolean;
  order: number;
  productBases?: any[];
  productTypes?: any[];
}

import { setRequestLocale } from "next-intl/server";

export default async function ProductThreeColumnAdsBanner({ locale }: { locale: string }) {
  setRequestLocale(locale);
  let banners: AdsBanner[] = [];

  try {
    // Fetch promotional banners
    const res = await api.get<{ adsBanners: AdsBanner[] }>(
      `${ADS_BANNER_ENDPOINTS.BASE}?bannerType=promotional&t=${Date.now()}`,
    );

    // We only want to show 3 banners max for this specific layout
    banners = (res.data.adsBanners || [])
      // Filter by the target productBase (Beauty) and productType (Product Three Column Ads Banner)
      // Usually these might be populated with objects or just ID strings depending on the API
      .filter((banner) => {
        const hasBeautyBase = banner.productBases?.some(
          (b: any) =>
            b.title?.toLowerCase() === "beauty" ||
            b.name?.toLowerCase() === "beauty" ||
            b === "69a663a850f68158c5623580",
        );
        const hasThreeColumnType = banner.productTypes?.some(
          (t: any) =>
            t.name === "Product Three Column Ads Banner" ||
            t.slug === "product-three-column-ads-banner" ||
            t._id === "69b3a6f02f803b3d1e69f492" ||
            t === "69b3a6f02f803b3d1e69f492",
        );

        return hasBeautyBase && hasThreeColumnType;
      })
      // Sort by order ascending
      .sort((a, b) => a.order - b.order)
      .slice(0, 3);
  } catch (error) {
    console.error("Failed to fetch ProductThreeColumnAdsBanner data", error);
  }

  if (!banners || banners.length === 0) {
    return null; // Don't render if no banners
  }

  return (
    <Container>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div
            key={banner._id}
            className="rounded-[24px] overflow-hidden relative flex flex-col justify-end p-4 sm:p-6 min-h-[360px] md:min-h-[550px]"
            style={{
              // If there's no image, use bgColor as fallback for the main banner area
              backgroundColor: banner.image
                ? "transparent"
                : banner.bgColor || "#F3F4F6",
            }}
          >
            {/* Background Image: Covers entire banner */}
            {banner.image && (
              <Image
                src={banner.image}
                alt={banner.name}
                fill
                className="object-cover absolute inset-0 z-0"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}

            {/* Details Card overlay with dynamic cardColor */}
            <div
              className="relative z-10 flex flex-col p-4 sm:p-5 md:p-6 rounded-[16px] sm:rounded-[20px] w-full sm:w-[90%] md:w-[85%] lg:w-[95%] xl:w-[85%] gap-y-2 sm:gap-y-3 shadow-sm mx-auto sm:mx-0"
              style={{
                backgroundColor:
                  banner.cardColor || banner.bgColor || "#ffffff",
              }}
            >
              <div className="space-y-1.5 sm:space-y-2">
                <span className="inline-block px-3 py-1 bg-warning-light text-gray-800 text-[10px] md:text-xs font-semibold tracking-wider rounded-full uppercase backdrop-blur-md w-fit">
                  {banner.name}
                </span>

                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-[22px] xl:text-2xl font-bold text-gray-900 leading-[1.2] tracking-tight">
                  {banner.title}
                </h3>

                {banner.description && (
                  <p className="text-xs sm:text-sm text-gray-700 font-medium line-clamp-2 leading-relaxed">
                    {banner.description}
                  </p>
                )}
              </div>

              <div className="mt-1 sm:mt-2 text-left">
                <Button
                  asChild
                  className="rounded-full font-semibold text-[12px] sm:text-[14px] h-9 sm:h-10 pl-4 sm:pl-5 pr-1.5 bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2 sm:gap-3 w-fit group"
                >
                  <Link href={banner.buttonHref || "/shop"} className="group">
                    <span>{banner.buttonTitle || "Shop Now"}</span>
                    <span className="bg-white text-primary rounded-full size-6 sm:size-7 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 -rotate-45 group-hover:rotate-0 hoverEffect" />
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
