"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import { SectionHeader } from "../common/SectionHeader";
import ProductCard from "../common/products/ProductCard";
import { ProductType } from "@/hooks/useProductTypes";
import { ApiProduct } from "@/hooks/useProducts";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import Container from "../common/Container";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
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
  slug,
}: TopSellingProductsClientProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);

  React.useEffect(() => {
    if (!api) return;
    const update = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  if (products.length === 0) {
    return null;
  }

  const bgColor = productType?.bgColor || "#F4F3F5";

  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div
          className="relative px-0 pt-10 md:pt-0 pb-12 overflow-hidden min-h-[500px] rounded-2xl"
          // style={{ backgroundColor: bgColor }}  
        >
          {/* White cutout notch at the top center */}
          {/* <div className="absolute top-0 left-0 right-0 z-0 pointer-events-none hidden md:flex justify-center w-full">
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
          </div> */}

          <div className="flex justify-center mb-6 md:mb-10 overflow-visible relative z-10 w-full">
            <div className="relative px-6 sm:px-20 max-w-max w-full flex flex-col items-center">
              <SectionHeader
                title={productType?.title || "Top Selling Products"}
                description={productType?.description || ""}
                align="center"
              />
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-10 relative z-10 w-full">
            <div className="hidden sm:flex justify-end items-center gap-4 mb-6">
              <button
                onClick={() => api?.scrollPrev()}
                disabled={!canScrollPrev}
                aria-label="Previous products"
                className={`size-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                  canScrollPrev
                    ? "bg-white/70 hover:bg-white text-light-primary-text shadow-sm"
                    : "bg-white/30 text-light-secondary-text cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => api?.scrollNext()}
                disabled={!canScrollNext}
                aria-label="Next products"
                className={`size-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                  canScrollNext
                    ? "bg-white hover:bg-white/90 text-light-primary-text shadow-sm"
                    : "bg-white/30 text-light-secondary-text cursor-not-allowed"
                }`}
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="mb-10"
            >
              <Carousel
                setApi={setApi}
                opts={{ align: "start" }}
                className="w-full"
              >
                <CarouselContent className="-ml-4 sm:-ml-6">
                  {products.map((product) => (
                    <CarouselItem
                      key={product._id}
                      className="pl-4 sm:pl-6 basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/5"
                    >
                      <motion.div
                        className="w-full flex h-full"
                        variants={itemVariants}
                      >
                        <div className="w-full h-full">
                          <ProductCard product={product} />
                        </div>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </motion.div>

            <div className="flex justify-end w-full">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link
                  href={`/shop?type=${productType?.slug || slug}`}
                  className="bg-white hover:bg-white/90 transition-colors duration-300 inline-flex items-center gap-[6px] py-[8px] pl-[20px] pr-[10px] rounded-[59px] group/btn shadow-sm"
                >
                  <span className="font-['DM_Sans',sans-serif] font-semibold leading-[26px] text-primary text-[16px] whitespace-nowrap">
                    View All Products
                  </span>
                  <div className="bg-primary flex items-center justify-center rounded-full size-[32px] ml-1">
                    <ArrowUpRight className="size-4 text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TopSellingProductsClient;
