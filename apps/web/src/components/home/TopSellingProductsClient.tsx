"use client";
import React, { useMemo, useState } from "react";
import { motion, Variants } from "motion/react";
import Container from "../common/Container";
import { SectionHeader } from "../common/SectionHeader";
import { ProductType } from "@/hooks/useProductTypes";
import { ApiProduct } from "@/hooks/useProducts";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import FeaturedProductCard from "../common/products/FeaturedProductCard";
import TopSellingHorizontalCard from "../common/products/TopSellingHorizontalCard";

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

interface TopSellingProductsClientProps {
  products: ApiProduct[];
  productType?: ProductType;
  slug: string;
}

const TopSellingProductsClient = ({
  products,
  productType,
}: TopSellingProductsClientProps) => {
  const [api1, setApi1] = useState<CarouselApi>();
  const [api2, setApi2] = useState<CarouselApi>();

  const [canScrollPrev1, setCanScrollPrev1] = useState(false);
  const [canScrollNext1, setCanScrollNext1] = useState(true);

  const [canScrollPrev2, setCanScrollPrev2] = useState(false);
  const [canScrollNext2, setCanScrollNext2] = useState(true);

  React.useEffect(() => {
    if (!api1) return;
    setCanScrollPrev1(api1.canScrollPrev());
    setCanScrollNext1(api1.canScrollNext());
    api1.on("select", () => {
      setCanScrollPrev1(api1.canScrollPrev());
      setCanScrollNext1(api1.canScrollNext());
    });
    api1.on("reInit", () => {
      setCanScrollPrev1(api1.canScrollPrev());
      setCanScrollNext1(api1.canScrollNext());
    });
  }, [api1]);

  React.useEffect(() => {
    if (!api2) return;
    setCanScrollPrev2(api2.canScrollPrev());
    setCanScrollNext2(api2.canScrollNext());
    api2.on("select", () => {
      setCanScrollPrev2(api2.canScrollPrev());
      setCanScrollNext2(api2.canScrollNext());
    });
    api2.on("reInit", () => {
      setCanScrollPrev2(api2.canScrollPrev());
      setCanScrollNext2(api2.canScrollNext());
    });
  }, [api2]);

  if (products.length === 0) {
    return null;
  }

  // Split, sort and chunk products as requested
  // Top Rated: Ascending order
  const topRatedChunks = useMemo(() => {
    const sorted = [...products].sort(
      (a, b) => (a.price || 0) - (b.price || 0),
    );
    return chunkArray(sorted, 3);
  }, [products]);

  // Top Items: Descending order
  const topItemsChunks = useMemo(() => {
    const sorted = [...products].sort(
      (a, b) => (b.price || 0) - (a.price || 0),
    );
    return chunkArray(sorted, 3);
  }, [products]);

  // Get banner block colors natively from productType or use defaults
  const bgColor = productType?.bgColor || "#FDE047";

  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div
          className="relative px-0 pt-10 md:pt-0 pb-12 overflow-hidden min-h-[500px] rounded-[24px]"
          style={{ backgroundColor: bgColor }}
        >
          {/* White cutout notch at the top center to create the curve over the yellow background */}
          <div className="absolute top-0 left-0 right-0 z-0 pointer-events-none hidden md:flex justify-center w-full">
            <svg
              viewBox="464 0 800 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[800px] max-w-full"
              preserveAspectRatio="xMidYTop meet"
            >
              <path
                d="M464.229 0 C490.65 0 511.137 22.4607 523.036 46.0506 C540.075 79.8315 575.081 120 615.5 120 H1112.5 C1152.92 120 1187.92 79.8315 1204.96 46.0506 C1216.86 22.4607 1237.35 0 1263.77 0 Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          {/* Notch Content (Title and Description) */}
          <div className="flex justify-center mb-6 md:mb-10 overflow-visible relative z-10 w-full">
            <div className="relative px-6 sm:px-20 max-w-max w-full flex flex-col items-center">
              <SectionHeader
                title={productType?.title || "Top Selling Products"}
                description={
                  productType?.description ||
                  ""
                }
                align="center"
              />
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-10 relative z-10 w-full py-10">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-[24px] xl:gap-[32px] w-full items-stretch">
              {/* Column 1: Feature Product */}
              <div className="h-full w-full">
                <FeaturedProductCard product={products[0]} />
              </div>

              {/* Column 2: Top Rate */}
              <div className="w-full flex justify-between flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center mb-[24px] border-b border-border pb-5">
                  <h4 className="font-Urbanist font-bold text-light-primary-text text-[24px] leading-[36px]">
                    Top Rate
                  </h4>
                  <div className="flex items-center gap-[8px]">
                    <button
                      onClick={() => api1?.scrollPrev()}
                      disabled={!canScrollPrev1}
                      className={`size-[32px] rounded-full border flex items-center justify-center transition-colors ${
                        canScrollPrev1
                          ? "border-[rgba(145,158,171,0.32)] text-light-primary-text hover:bg-gray-50 bg-white"
                          : "border-gray-100 text-gray-300 cursor-not-allowed bg-white"
                      }`}
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={() => api1?.scrollNext()}
                      disabled={!canScrollNext1}
                      className={`size-[32px] rounded-full border flex items-center justify-center transition-colors ${
                        canScrollNext1
                          ? "border-[rgba(145,158,171,0.32)] text-light-primary-text hover:bg-gray-50 bg-white"
                          : "border-gray-100 text-gray-300 cursor-not-allowed bg-white"
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
                <div className="flex justify-between items-center mb-[24px] border-b border-border pb-5">
                  <h4 className="font-Urbanist font-bold text-light-primary-text text-[24px] leading-[36px]">
                    Top Items
                  </h4>
                  <div className="flex items-center gap-[8px]">
                    <button
                      onClick={() => api2?.scrollPrev()}
                      disabled={!canScrollPrev2}
                      className={`size-[32px] rounded-full border flex items-center justify-center transition-colors ${
                        canScrollPrev2
                          ? "border-[rgba(145,158,171,0.32)] text-light-primary-text hover:bg-gray-50 bg-white"
                          : "border-gray-100 text-gray-300 cursor-not-allowed bg-white"
                      }`}
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={() => api2?.scrollNext()}
                      disabled={!canScrollNext2}
                      className={`size-[32px] rounded-full border flex items-center justify-center transition-colors ${
                        canScrollNext2
                          ? "border-[rgba(145,158,171,0.32)] text-light-primary-text hover:bg-gray-50 bg-white"
                          : "border-gray-100 text-gray-300 cursor-not-allowed bg-white"
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

export default TopSellingProductsClient;
