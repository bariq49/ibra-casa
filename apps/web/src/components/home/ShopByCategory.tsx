"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import Container from "../common/Container";
import { useCategories } from "@/hooks/useCategories";
import { Link } from "@/i18n/routing";
import { ChevronRight, ChevronLeft, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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

const ShopByCategory = () => {
  const { categories, isLoading, error } = useCategories();
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

  if (isLoading) {
    return (
      <section className="py-10 md:py-14 lg:py-[70px]">
        <Container>
          <div className="flex flex-col gap-3 mb-10">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-6">
                <Skeleton className="w-full aspect-square rounded-[16px]" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-[8px] text-center sm:text-left items-center sm:items-start"
          >
            <h3 className="font-['Urbanist',sans-serif] text-2xl md:text-3xl lg:text-[40px] font-bold leading-tight lg:leading-[48px] text-light-primary-text mb-2">
              Shop By Category
            </h3>
            <p className="font-dm-sans text-[14px] sm:text-[16px] font-normal text-light-secondary-text leading-[24px]">
              Up to 69% discount for limited time 🔥
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex gap-[24px] items-center justify-center sm:justify-end shrink-0 w-full sm:w-auto mt-2 sm:mt-0"
          >
            <button
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
              className={`size-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                canScrollPrev
                  ? "bg-light-disabled-text/10 hover:bg-light-disabled-text/20 text-gray-800"
                  : "bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              onClick={() => api?.scrollNext()}
              disabled={!canScrollNext}
              className={`size-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                canScrollNext
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="size-6" />
            </button>
          </motion.div>
        </div>

        <div className="relative w-full overflow-hidden">
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
                slidesToScroll: 1,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 sm:-ml-6">
                {Array.from({
                  length: Math.ceil(Math.min(categories.length, 16) / 4),
                }).map((_, chunkIndex) => {
                  const chunk = categories.slice(
                    chunkIndex * 4,
                    chunkIndex * 4 + 4,
                  );
                  return (
                    <CarouselItem
                      key={`chunk-${chunkIndex}`}
                      className="pl-4 sm:pl-6 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                    >
                      <div className="grid grid-cols-2 gap-4 sm:gap-6 h-full">
                        {chunk.map((category) => (
                          <motion.div
                            key={category._id}
                            variants={itemVariants}
                            className="w-full flex"
                          >
                            <Link
                              href={`/shop?category=${category.slug}`}
                              className="group flex flex-col items-center gap-[16px] xl:gap-[24px] w-full"
                            >
                              <div className="w-full aspect-square rounded-[16px] bg-white border border-gray-300 flex items-center justify-center overflow-hidden shrink-0 group-hover:shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] transition-all duration-300 group-hover:border-primary/30 relative p-4">
                                {category.image ? (
                                  <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-primary font-bold text-2xl">
                                      {category.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                {/* Outer animated border on hover */}
                                <div className="absolute inset-0 rounded-[16px] border-2 border-transparent group-hover:border-primary/20 scale-105 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                              </div>
                              <h4 className="font-dm-sans text-[14px] sm:text-[16px] font-semibold text-gray-800 group-hover:text-primary text-center w-full leading-[20px] sm:leading-[24px] transition-colors truncate px-1">
                                {category.name}
                              </h4>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </motion.div>
        </div>

        <div className="flex justify-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href={`/categories`}
              className="bg-white hover:bg-white/90 inline-flex items-center gap-[6px] py-[8px] mt-8 pl-[20px] pr-[10px] rounded-[59px] group/btn shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-md hoverEffect group border border-primary/20"
            >
              <span className="font-semibold leading-[26px] text-primary text-[16px] whitespace-nowrap">
                View All Categories
              </span>
              <div className="bg-primary flex items-center justify-center rounded-full size-[32px] ml-1">
                <ArrowUpRight className="size-4 text-white group-hover:rotate-45 hoverEffect" />
              </div>
            </Link>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default ShopByCategory;
