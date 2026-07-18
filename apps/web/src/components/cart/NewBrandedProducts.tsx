"use client";

import React, { useEffect, useState } from "react";
import { motion, Variants } from "motion/react";
import Container from "@/components/common/Container";
import ProductCard from "@/components/common/products/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { ChevronRight, ChevronLeft } from "lucide-react";
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

export default function NewBrandedProducts() {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const { products, isLoading } = useProducts("newly-lunch-products");

  useEffect(() => {
    if (!api) return;

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

  // Don't render block if empty
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-14 lg:py-20 bg-white">
      <Container>
        <div className="flex flex-col gap-10">
          {/* Header & Controls */}
          <div className="flex items-center justify-between w-full">
            <h2 className="font-urbanist font-bold text-[32px] leading-[48px] text-light-primary-text">
              New Branded Products
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => api?.scrollPrev()}
                disabled={!canScrollPrev}
                className={`size-12 rounded-[50px] flex items-center justify-center transition-colors ${
                  canScrollPrev
                    ? "bg-light-disabled-text/10 text-light-primary-text hover:bg-light-disabled-text/20"
                    : "bg-light-disabled-text/5 text-light-primary-text/40 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                onClick={() => api?.scrollNext()}
                disabled={!canScrollNext}
                className={`size-12 rounded-[50px] flex items-center justify-center transition-colors ${
                  canScrollNext
                    ? "bg-light-disabled-text/10 text-light-primary-text hover:bg-light-disabled-text/20"
                    : "bg-light-disabled-text/5 text-light-primary-text/40 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="size-6" />
              </button>
            </div>
          </div>

          {/* Carousel Body */}
          <div className="w-full">
            {isLoading ? (
              // Simple skeleton placeholder while fetching
              <div className="flex gap-6 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="shrink-0 w-full max-w-[252px] h-[380px] bg-gray-100 animate-pulse rounded-[16px]"
                  />
                ))}
              </div>
            ) : (
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
                    slidesToScroll: 2,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-6">
                    {products.map((product) => (
                      <CarouselItem
                        key={product._id}
                        className="pl-6 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                      >
                        <motion.div
                          className="w-[252px] flex h-full"
                          variants={itemVariants}
                        >
                          <ProductCard product={product as any} />
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </motion.div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
