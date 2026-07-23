"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import { SectionHeader } from "../common/SectionHeader";
import ProductCard from "../common/products/ProductCard";
import { ProductType } from "@/hooks/useProductTypes";
import { ApiProduct } from "@/hooks/useProducts";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div className="relative w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-10">
            <SectionHeader
              title={productType?.title || "Top Selling Products"}
              description={productType?.description || ""}
              align="left"
            />

            <div className="hidden sm:flex items-center gap-4 shrink-0">
              <button
                onClick={() => api?.scrollPrev()}
                disabled={!canScrollPrev}
                aria-label="Previous products"
                className={`size-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 border border-light-divider ${
                  canScrollPrev
                    ? "bg-white hover:bg-gray-50 text-light-primary-text shadow-sm"
                    : "bg-white text-light-secondary-text cursor-not-allowed opacity-50"
                }`}
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => api?.scrollNext()}
                disabled={!canScrollNext}
                aria-label="Next products"
                className={`size-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 border border-light-divider ${
                  canScrollNext
                    ? "bg-white hover:bg-gray-50 text-light-primary-text shadow-sm"
                    : "bg-white text-light-secondary-text cursor-not-allowed opacity-50"
                }`}
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
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
        </div>
      </Container>
    </section>
  );
};

export default TopSellingProductsClient;
