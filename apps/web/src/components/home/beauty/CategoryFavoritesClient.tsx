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

// Colors for the text bar blocks at the bottom of the card
const bgColors = ["#5ed9ba", "#84a9ff", "#74caff", "#ffe16a"];

interface CategoryFavoritesClientProps {
  categories: Category[];
}

const CategoryFavoritesClient = ({
  categories,
}: CategoryFavoritesClientProps) => {
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
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-2"
          >
            <h3
              className="text-light-primary-text leading-tight"
              style={{
                fontFamily: "'Urbanist', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(24px, 3vw, 32px)",
              }}
            >
              Category Favorites
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex gap-4 items-center shrink-0"
          >
            {/* Prev */}
            <button
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
              aria-label="Previous categories"
              className={`size-10 sm:size-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
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
              className={`size-10 sm:size-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                canScrollNext
                  ? "bg-primary hover:bg-primary-dark text-white"
                  : "bg-[rgba(145,158,171,0.08)] text-light-disabled-text cursor-not-allowed"
              }`}
            >
              <ChevronRight className="size-5" />
            </button>
          </motion.div>
        </div>

        {/* ── Category Cards Carousel ── */}
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
                slidesToScroll: 1,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-6">
                {categories.map((category, index) => {
                  const bgColor = bgColors[index % bgColors.length];
                  return (
                    <CarouselItem
                      key={category._id}
                      className="pl-6 basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3"
                    >
                      <motion.div
                        variants={itemVariants}
                        className="w-full h-full"
                      >
                        <Link
                          href={`/shop?category=${category.slug}`}
                          className="group flex flex-col h-[400px] sm:h-[460px] md:h-[520px] rounded-[24px] overflow-hidden transition-all duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          {/* Top Image Portion */}
                          <div className="flex-1 bg-gray-100 relative overflow-hidden">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                <span className="text-gray-400 font-bold text-4xl">
                                  {category.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Bottom Info Block */}
                          <div
                            className="flex flex-col gap-2 items-center justify-center px-6 py-8 shrink-0 text-center"
                            style={{ backgroundColor: bgColor }}
                          >
                            <p
                              className="text-gray-800 leading-tight line-clamp-1"
                              style={{
                                fontFamily: "'Urbanist', sans-serif",
                                fontWeight: 700,
                                fontSize: "clamp(20px, 2vw, 24px)",
                              }}
                            >
                              {category.name}
                            </p>
                            <p
                              className="text-gray-900 text-[16px] leading-[24px] font-semibold opacity-90"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {category.productCount || 0} Products
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default CategoryFavoritesClient;
