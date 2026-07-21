"use client";

import React, { useMemo, useState } from "react";
import { motion, Variants } from "motion/react";
import Link from "next/link";
import Container from "../../common/Container";
import { ApiProduct } from "@/hooks/useProducts";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "../../common/SectionHeader";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import FeaturedProductCard from "../../common/products/FeaturedProductCard";
import TopSellingHorizontalCard from "../../common/products/TopSellingHorizontalCard";

/* ─── Animation variants ─── */
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

interface MostLovedProductsClientProps {
  products: ApiProduct[];
  productType?: any;
  slug: string;
}

// Utility to slice array into chunks of a given size
const chunkArray = (arr: ApiProduct[], size: number) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const MostLovedProductsClient = ({
  products,
  productType,
  slug,
}: MostLovedProductsClientProps) => {
  // Carousels APIs
  const [api1, setApi1] = useState<CarouselApi>();
  const [api2, setApi2] = useState<CarouselApi>();

  // API 1 state
  const [canScrollPrev1, setCanScrollPrev1] = useState(false);
  const [canScrollNext1, setCanScrollNext1] = useState(true);

  // API 2 state
  const [canScrollPrev2, setCanScrollPrev2] = useState(false);
  const [canScrollNext2, setCanScrollNext2] = useState(true);

  // Sync API 1 Nav state
  React.useEffect(() => {
    if (!api1) return;
    const update = () => {
      setCanScrollPrev1(api1.canScrollPrev());
      setCanScrollNext1(api1.canScrollNext());
    };
    update();
    api1.on("select", update);
    api1.on("reInit", update);
    return () => {
      api1.off("select", update);
      api1.off("reInit", update);
    };
  }, [api1]);

  // Sync API 2 Nav state
  React.useEffect(() => {
    if (!api2) return;
    const update = () => {
      setCanScrollPrev2(api2.canScrollPrev());
      setCanScrollNext2(api2.canScrollNext());
    };
    update();
    api2.on("select", update);
    api2.on("reInit", update);
    return () => {
      api2.off("select", update);
      api2.off("reInit", update);
    };
  }, [api2]);

  // Sort and chunk for Top Rate (Ascending)
  const topRatedChunks = useMemo(() => {
    const remaining = products.slice(1); // skip featured product [0]
    const sorted = [...remaining].sort(
      (a, b) => (a.averageRating || 0) - (b.averageRating || 0),
    );
    return chunkArray(sorted, 3);
  }, [products]);

  // Sort and chunk for Top Items (Descending)
  const topItemsChunks = useMemo(() => {
    const remaining = products.slice(1);
    const sorted = [...remaining].sort(
      (a, b) => (b.averageRating || 0) - (a.averageRating || 0),
    );
    return chunkArray(sorted, 3);
  }, [products]);

  // Get banner block colors natively from productType or use default
  const bgColor =
    productType?.productBasesBg?.["home-decor"] ||
    productType?.productBasesBg?.beauty ||
    productType?.bgColor ||
    "#92BDF5";

  if (products.length === 0) return null;

  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div className="relative px-0 pt-8 md:pt-6 lg:pt-8 pb-12 min-h-[500px]">
          {/* Mobile Solid Background with rounded corners */}
          <div
            className="absolute inset-0 z-0 pointer-events-none md:hidden rounded-xl"
            style={{ backgroundColor: bgColor }}
          />

          {/* Desktop SVG Background Cutout from Figma - Restructured to sit inside overflow-hidden container */}
          <div className="absolute inset-0 z-0 pointer-events-none hidden md:flex justify-start items-start w-full h-full overflow-hidden rounded-xl">
            {/* The SVG is placed in its native size relative to the top left, but container handles the actual bottom & right bounds dynamically */}
            <div
              className="absolute inset-0 rounded-xl"
              style={{ backgroundColor: bgColor }}
            />
            {/* We subtract the white notch from the top-left area instead of drawing the whole 1728px SVG. 
                Using the original path geometry, the cutout is exactly the chunk from x:0-515, y:0-149. */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 516 150"
              fill="none"
              className="absolute top-0 left-0 w-[516px] h-[150px]"
              preserveAspectRatio="xMinYMin meet"
            >
              <path
                d="M515.894 0 H0 V149.106 C0 122.597 21.4903 101.106 48 101.106 H365.5 C405.547 101.106 440.281 78.362 457.49 45.086 C469.472 21.9157 489.809 0 515.894 0 Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          {/* Header Row Content */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-14 lg:mb-16 relative z-10 w-full px-6 sm:px-10 lg:px-14">
            <div className="relative max-w-max w-full flex flex-col items-start gap-1 md:-mt-8">
              <SectionHeader
                title={productType?.title || "Limited Time Deals"}
                description={
                  productType?.description ||
                  "Up to 69% discount for limited time 🔥"
                }
                align="left"
              />
            </div>

            {/* View All Button inside Notch Header area */}
            <Link
              href={`/shop?type=${productType?.slug || slug}`}
              className="mt-4 md:mt-0 bg-white hover:bg-gray-50 transition-transform active:scale-95 flex gap-[6px] items-center justify-center pl-[24px] pr-[10px] py-[8px] rounded-[100px] shrink-0 z-10 hoverEffect group"
            >
              <p className="font-['DM_Sans',sans-serif] font-semibold leading-[26px] relative shrink-0 text-[16px] text-center text-primary mr-1">
                View All Products
              </p>
              <div className="bg-primary flex items-center justify-center rounded-full size-[32px] shrink-0 transition-transform group-hover:rotate-45 hoverEffect">
                <ArrowUpRight
                  className="size-[18px] text-white"
                  strokeWidth={2.5}
                />
              </div>
            </Link>
          </div>

          <div className="px-4 sm:px-6 lg:px-10 relative z-10 w-full py-2">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-[24px] w-full items-stretch">
              {/* Column 1: Feature Product */}
              <div className="h-full w-full">
                <FeaturedProductCard product={products[0]} />
              </div>

              {/* Column 2: Top Rate */}
              <div className="w-full flex justify-between flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center mb-[24px] pb-2">
                  <h4 className="font-Urbanist font-bold text-light-primary-text text-[24px] leading-[36px]">
                    Top Rate
                  </h4>
                  <div className="flex items-center gap-[8px]">
                    <button
                      onClick={() => api1?.scrollPrev()}
                      disabled={!canScrollPrev1}
                      className={`size-[32px] rounded-full flex items-center justify-center transition-colors ${
                        canScrollPrev1
                          ? "text-primary hover:bg-[rgba(255,255,255,0.7)] bg-white"
                          : "text-gray-400 cursor-not-allowed bg-[rgba(255,255,255,0.5)]"
                      }`}
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={() => api1?.scrollNext()}
                      disabled={!canScrollNext1}
                      className={`size-[32px] rounded-full flex items-center justify-center transition-colors ${
                        canScrollNext1
                          ? "text-primary hover:bg-[rgba(255,255,255,0.7)] bg-white"
                          : "text-gray-400 cursor-not-allowed bg-[rgba(255,255,255,0.5)]"
                      }`}
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>

                <Carousel
                  setApi={setApi1}
                  opts={{ align: "start" }}
                  className="w-full grow"
                >
                  <CarouselContent className="-ml-4 h-full">
                    {topRatedChunks.map((chunk, index) => (
                      <CarouselItem
                        key={`tr-chunk-${index}`}
                        className="pl-4 basis-full"
                      >
                        <motion.div
                          className="h-full flex flex-col gap-[16px]"
                          variants={itemVariants}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                        >
                          {chunk.map((product) => (
                            <TopSellingHorizontalCard
                              key={product._id}
                              product={product}
                            />
                          ))}
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>

              {/* Column 3: Top Items */}
              <div className="w-full flex justify-between flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center mb-[24px] pb-2">
                  <h4 className="font-Urbanist font-bold text-light-primary-text text-[24px] leading-[36px]">
                    Top Items
                  </h4>
                  <div className="flex items-center gap-[8px]">
                    <button
                      onClick={() => api2?.scrollPrev()}
                      disabled={!canScrollPrev2}
                      className={`size-[32px] rounded-full flex items-center justify-center transition-colors ${
                        canScrollPrev2
                          ? "text-primary hover:bg-[rgba(255,255,255,0.7)] bg-white"
                          : "text-gray-400 cursor-not-allowed bg-[rgba(255,255,255,0.5)]"
                      }`}
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={() => api2?.scrollNext()}
                      disabled={!canScrollNext2}
                      className={`size-[32px] rounded-full flex items-center justify-center transition-colors ${
                        canScrollNext2
                          ? "text-primary hover:bg-[rgba(255,255,255,0.7)] bg-white"
                          : "text-gray-400 cursor-not-allowed bg-[rgba(255,255,255,0.5)]"
                      }`}
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>

                <Carousel
                  setApi={setApi2}
                  opts={{ align: "start" }}
                  className="w-full grow"
                >
                  <CarouselContent className="-ml-4 h-full">
                    {topItemsChunks.map((chunk, index) => (
                      <CarouselItem
                        key={`ti-chunk-${index}`}
                        className="pl-4 basis-full"
                      >
                        <motion.div
                          className="h-full flex flex-col gap-[16px]"
                          variants={itemVariants}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                        >
                          {chunk.map((product) => (
                            <TopSellingHorizontalCard
                              key={product._id}
                              product={product}
                            />
                          ))}
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default MostLovedProductsClient;
