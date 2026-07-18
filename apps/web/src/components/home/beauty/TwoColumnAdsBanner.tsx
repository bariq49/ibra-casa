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

export default async function TwoColumnAdsBanner({
  locale,
}: {
  locale: string;
}) {
  setRequestLocale(locale);
  let banners: AdsBanner[] = [];

  try {
    // Fetch promotional banners
    const res = await api.get<{ adsBanners: AdsBanner[] }>(
      `${ADS_BANNER_ENDPOINTS.BASE}?bannerType=promotional&t`,
    );

    // We only want to show 2 banners max for this specific layout
    banners = (res.data.adsBanners || [])
      // Filter by the target productBase (Beauty) and productType (Two Column Banner)
      .filter((banner) => {
        const hasBeautyBase = banner.productBases?.some(
          (b: any) =>
            b.title?.toLowerCase() === "beauty" ||
            b.name?.toLowerCase() === "beauty",
        );
        const hasTwoColumnType = banner.productTypes?.some(
          (t: any) =>
            t.slug === "product-two-column-ads-banner" ||
            t.name === "Product Two Column Ads Banner" ||
            t === "product-two-column-ads-banner" ||
            // Keep legacy fallbacks just in case
            t.name?.toLowerCase().includes("two column") ||
            t.slug?.toLowerCase().includes("two-column"),
        );

        return hasBeautyBase && hasTwoColumnType;
      })
      // Sort by order ascending
      .sort((a, b) => a.order - b.order)
      .slice(0, 2);
  } catch (error) {
    console.error("Failed to fetch TwoColumnAdsBanner data", error);
  }

  return (
    <Container className="py-10">
      <div className="flex flex-col lg:flex-row gap-6">
        {banners.map((banner, index) => {
          // Based on Figma design, first banner is 528px wide, second banner fills remaining space
          const layoutClass =
            index === 0 ? "w-full lg:w-[528px] shrink-0" : "w-full lg:flex-1";

          return (
            <div
              key={banner._id}
              className={`rounded-3xl overflow-hidden relative flex flex-col justify-end p-4 sm:p-8 h-100 md:h-150 ${layoutClass}`}
              style={{
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
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              )}

              {/* Details Card overlay with dynamic cardColor */}
              <div
                className="relative z-10 flex flex-col p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl sm:rounded-3xl w-full sm:w-[85%] md:w-[90%] lg:w-[80%] gap-y-2 sm:gap-y-3 shadow-sm mr-auto bg-white/95 backdrop-blur-md"
                style={{
                  backgroundColor:
                    banner.cardColor || "rgba(255, 255, 255, 0.95)",
                }}
              >
                <div className="space-y-1.5 sm:space-y-2">
                  <span className="inline-block px-3 py-1 bg-warning-light text-light-primary-text text-[10px] md:text-[12px] lg:text-[16px] font-semibold rounded-full w-fit">
                    {banner.name}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-[1.2] tracking-tight">
                    {banner.title}
                  </h3>

                  {banner.description && (
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium line-clamp-2 md:line-clamp-3 leading-relaxed">
                      {banner.description}
                    </p>
                  )}
                </div>

                <div className="mt-2 sm:mt-3 text-left">
                  <Button
                    asChild
                    className="rounded-full font-semibold text-[12px] sm:text-[14px] h-9 sm:h-10 lg:h-11 pl-4 sm:pl-5 pr-1.5 bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2 sm:gap-3 w-fit group"
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
          );
        })}
      </div>
    </Container>
  );
}
