"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import Container from "../../common/Container";
import { Link } from "@/i18n/routing";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Category } from "@/hooks/useCategories";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

interface ShopByCategoryBeautyClientProps {
  categories: Category[];
}

const ShopByCategoryBeautyClient = ({
  categories,
}: ShopByCategoryBeautyClientProps) => {
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

  if (categories.length === 0) return null;

  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        {/* ── Header row: title left, arrows right ── */}
        <div className="flex items-center justify-between mb-10">
          {/* Title block */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-[12px]"
          >
            <h3
              className="text-light-primary-text leading-[48px]"
              style={{
                fontFamily: "'Urbanist', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(22px, 3vw, 32px)",
              }}
            >
              Shop By Category
            </h3>
            <p
              className="text-light-secondary-text text-[16px] leading-[24px] font-normal"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Up to 69% discount for limited time 🔥
            </p>
          </motion.div>

          {/* Carousel nav arrows */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex gap-[24px] items-center shrink-0"
          >
            {/* Prev */}
            <button
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
              aria-label="Previous categories"
              className={`size-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                canScrollPrev
                  ? "bg-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.18)] text-light-primary-text"
                  : "bg-[rgba(145,158,171,0.08)] text-light-disabled-text cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="size-5" />
            </button>
            {/* Next */}
            <button
              onClick={() => api?.scrollNext()}
              disabled={!canScrollNext}
              aria-label="Next categories"
              className={`size-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                canScrollNext
                  ? "bg-primary hover:bg-primary-dark text-white"
                  : "bg-[rgba(145,158,171,0.08)] text-light-disabled-text cursor-not-allowed"
              }`}
            >
              <ChevronRight className="size-5" />
            </button>
          </motion.div>
        </div>

        {/* ── Category carousel: one card per slide, single row ── */}
        <div className="relative w-full overflow-hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
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
                {categories.map((category) => (
                  <CarouselItem
                    key={category._id}
                    className="pl-6 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-[calc(100%/8)]"
                  >
                    <motion.div variants={itemVariants} className="w-full">
                      <Link
                        href={`/shop?category=${category.slug}`}
                        className="group flex flex-col items-center gap-[24px] w-full"
                      >
                        {/* ── Circular image container ── */}
                        <div className="w-full aspect-square rounded-full border border-gray-300 overflow-hidden flex items-center justify-center bg-white group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] group-hover:border-primary/30 transition-all duration-300 relative">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="size-14 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-bold text-2xl">
                                {category.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* ── Category name ── */}
                        <p
                          className="text-light-primary-text text-[14px] lg:text-[16px] font-semibold leading-[24px] text-center w-full group-hover:text-primary transition-colors line-clamp-2"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {category.name}
                        </p>
                      </Link>
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

export default ShopByCategoryBeautyClient;
