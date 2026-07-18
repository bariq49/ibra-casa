"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import Container from "../common/Container";
import ProductCard from "../common/products/ProductCard";
import { ProductType } from "@/hooks/useProductTypes";
import { ApiProduct } from "@/hooks/useProducts";
import { ChevronRight, ChevronLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

interface NewlyLaunchedProductsClientProps {
  products: ApiProduct[];
  productType?: ProductType;
  slug: string;
}

const NewlyLaunchedProductsClient = ({
  products,
  productType,
  slug,
}: NewlyLaunchedProductsClientProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());

    api.on("select", () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    });

    api.on("reInit", () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    });
  }, [api]);

  if (products.length === 0) {
    return null;
  }

  const bgColor = productType?.bgColor || "#A0E2E0";

  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div className="relative pt-0 pb-12 overflow-hidden min-h-[500px] rounded-[24px]">
          {/* Background SVG from Figma */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <svg
              viewBox="0 0 1728 830"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              preserveAspectRatio="xMidYMin slice"
            >
              <path
                d="M1728 782C1728 808.51 1706.51 830 1680 830H48C21.4904 830 0 808.51 0 782V48C0 21.4904 21.4903 0 48 0H464.229C490.65 0 511.137 22.4607 523.036 46.0506C540.075 79.8315 575.081 120 615.5 120H1112.5C1152.92 120 1187.92 79.8315 1204.96 46.0506C1216.86 22.4607 1237.35 0 1263.77 0H1680C1706.51 0 1728 21.4903 1728 48V782Z"
                fill={bgColor}
              />
            </svg>
          </div>

          {/* Notch Content (Title and Description) */}
          <div className="flex justify-center mb-10 overflow-visible relative z-10">
            <div className="relative px-6 sm:px-20 pt-4 pb-16 text-center max-w-max w-full flex flex-col gap-[4px] items-center">
              <h3 className="font-['Urbanist',sans-serif] text-2xl md:text-3xl lg:text-[40px] font-bold leading-tight lg:leading-[48px] text-light-primary-text mb-2">
                {productType?.title || "Newly Lunch Products"}
              </h3>
              <p className="text-gray-600 text-xs sm:text-[14px] font-normal leading-relaxed max-w-[280px] sm:max-w-none mx-auto">
                {productType?.description ||
                  "Up to 69% discount for limited time 🔥"}
              </p>
            </div>
          </div>

          {/* Product Carousel */}
          <div className="px-4 sm:px-6 lg:px-10 relative z-10 w-full">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <Carousel
                setApi={setApi}
                opts={{
                  align: "start",
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4 sm:-ml-5">
                  {products.map((product) => (
                    <CarouselItem
                      key={product._id}
                      className="pl-4 sm:pl-5 basis-full sm:basis-1/2 lg:basis-1/4 xl:basis-1/6"
                    >
                      <motion.div
                        className="w-full flex h-full"
                        variants={itemVariants}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </motion.div>
          </div>

          {/* Navigation Arrows & View All Button */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-4 mt-8 md:mt-10 relative z-10 px-6 lg:px-10">
            {/* Left side: Arrows */}
            <div className="flex gap-4">
              <button
                onClick={() => api?.scrollPrev()}
                disabled={!canScrollPrev}
                className={`size-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                  canScrollPrev
                    ? "bg-white/50 text-[#04535C] hover:bg-white/70"
                    : "bg-white/30 text-[#04535C]/50 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="size-6" strokeWidth={2} />
              </button>
              <button
                onClick={() => api?.scrollNext()}
                disabled={!canScrollNext}
                className={`size-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                  canScrollNext
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-primary/50 text-white/50 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="size-6" strokeWidth={2} />
              </button>
            </div>

            {/* Right side: View All Products */}
            <Link href={`/shop?type=${productType?.slug || slug}`}>
              <div className="bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-between pl-5 pr-2 py-2 h-[48px] min-w-[200px] transition-all hover:bg-white shadow-sm cursor-pointer group">
                <span className="font-['DM_Sans',sans-serif] font-semibold text-[#04535C] text-[15px] sm:text-[16px] leading-[26px]">
                  View All Products
                </span>
                <div className="size-[32px] rounded-full bg-primary shrink-0 flex items-center justify-center text-white transition-transform group-hover:scale-105 group-hover:rotate-12 duration-300 ml-2">
                  <ArrowUpRight className="size-5" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default NewlyLaunchedProductsClient;
