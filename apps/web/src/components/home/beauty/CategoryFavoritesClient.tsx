"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import { Category } from "@/hooks/useCategories";
import Container from "../../common/Container";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/** Asymmetric spans for a 3-column grid: wide, narrow, narrow, wide */
const spanClasses = [
  "md:col-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-2",
];

interface CategoryFavoritesClientProps {
  categories: Category[];
}

const CategoryFavoritesClient = ({
  categories,
}: CategoryFavoritesClientProps) => {
  const featured = categories.slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <section className="py-10 md:py-14 lg:py-[70px] bg-white">
      <Container>
        <div className="mb-8 sm:mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl"
          >
            <h2
              className="text-light-primary-text text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-2"
              style={{ fontFamily: "'Urbanist', sans-serif" }}
            >
              Featured Categories
            </h2>
            <p
              className="text-light-secondary-text text-[15px] sm:text-base md:text-lg leading-relaxed max-w-xl"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Discover furniture designed for the future of living, work, and
              relaxation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="shrink-0"
          >
            <Link
              href="/shop"
              className="bg-white hover:bg-white/90 transition-colors duration-300 inline-flex items-center gap-[6px] py-[8px] pl-[20px] pr-[10px] rounded-[59px] group/btn shadow-sm border border-light-divider"
            >
              <span className="font-['DM_Sans',sans-serif] font-semibold leading-[26px] text-primary text-[16px] whitespace-nowrap">
                Explore all categories
              </span>
              <div className="bg-primary flex items-center justify-center rounded-full size-[32px] ml-1">
                <ArrowUpRight className="size-4 text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
              </div>
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 md:auto-rows-fr"
        >
          {featured.map((category, index) => {
            const description =
              category.description?.trim() ||
              (category.productCount != null
                ? `${category.productCount} products to explore`
                : "Explore this curated collection.");
            const imageSrc = category.image?.trim() || "";

            return (
              <motion.div
                key={category._id}
                variants={itemVariants}
                className={`${spanClasses[index] ?? "md:col-span-1"} h-full`}
              >
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="group relative flex h-[280px] sm:h-[320px] md:h-[360px] w-full flex-col overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {/* Image layer */}
                  <div className="absolute inset-0">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={category.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover object-center transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300">
                        <span className="text-5xl font-bold text-neutral-400/80">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Gradient for text readability */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent"
                    aria-hidden
                  />

                  {/* Title + subtitle — always fully visible */}
                  <div className="relative z-10 mt-auto flex flex-col justify-end p-5 sm:p-6 md:px-7 md:pb-7 md:pt-16">
                    <h3
                      className="text-white leading-tight drop-shadow-sm"
                      style={{
                        fontFamily: "'Urbanist', sans-serif",
                        fontWeight: 700,
                        fontSize: "clamp(18px, 2vw, 26px)",
                      }}
                    >
                      {category.name}
                    </h3>
                    <p
                      className="mt-1.5 text-white/90 text-sm sm:text-[15px] leading-snug line-clamp-2"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
};

export default CategoryFavoritesClient;
