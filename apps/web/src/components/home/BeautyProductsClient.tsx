"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import Container from "../common/Container";
import ProductCard from "../common/products/ProductCard";
import { ProductType } from "@/hooks/useProductTypes";
import { ApiProduct } from "@/hooks/useProducts";
import { ChevronRight, ChevronLeft, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
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

interface BeautyProductsClientProps {
  products: ApiProduct[];
  productType?: ProductType;
  slug: string;
}

const BeautyProductsClient = ({
  products,
  productType,
  slug,
}: BeautyProductsClientProps) => {
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

  // Exact background color matched perfectly from Figma
  const bgColor = productType?.bgColor || "#FFD6EF";

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
              <h4 className="font-['Urbanist',sans-serif] text-2xl md:text-3xl lg:text-[40px] font-bold leading-tight lg:leading-[48px] text-light-primary-text mb-2">
                {productType?.title || "Beauty Products"}
              </h4>
              <p className="text-light-secondary-text text-xs sm:text-[16px] font-normal leading-relaxed max-w-[280px] sm:max-w-none mx-auto">
                {productType?.description ||
                  "Up to 69% discount for limited time 🔥"}
              </p>
            </div>
          </div>

          {/* Product Carousel */}
          <div className="px-4 sm:px-6 lg:px-10 relative z-10 w-full mb-8 lg:mb-12">
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
                      className="pl-4 sm:pl-5 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
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

          {/* Bottom Control Bar aligned with Figma */}
          <div className="px-4 sm:px-6 lg:px-10 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Navigation Arrows at Bottom Left */}
            <div className="flex justify-start gap-4 order-2 sm:order-1 sm:w-1/3">
              <button
                onClick={() => api?.scrollPrev()}
                disabled={!canScrollPrev}
                className={`size-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                  canScrollPrev
                    ? "bg-white/40 text-gray-800 hover:bg-white/60"
                    : "bg-white/40 text-gray-400 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                onClick={() => api?.scrollNext()}
                disabled={!canScrollNext}
                className={`size-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                  canScrollNext
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-white/40 text-gray-400 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="size-6" />
              </button>
            </div>

            {/* View All Products Pill at Bottom Right */}
            <div className="flex justify-end order-1 sm:order-2 w-full sm:w-1/3">
              <Link
                href={`/collections/${slug}`}
                className="group flex items-center justify-between bg-white pl-4 pr-1.5 py-1.5 rounded-full hover:shadow-md transition-all duration-300 w-full sm:w-auto gap-3"
              >
                <span className="font-dm-sans font-semibold text-primary-darker text-[16px]">
                  View All Products
                </span>
                <div className="bg-primary self-stretch size-9 rounded-full flex items-center justify-center group-hover:bg-primary-dark transition-colors shrink-0">
                  <ArrowUpRight className="size-5 text-white" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default BeautyProductsClient;
