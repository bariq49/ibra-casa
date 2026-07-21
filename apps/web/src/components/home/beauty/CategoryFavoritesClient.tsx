"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import Container from "../../common/Container";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import { Category } from "@/hooks/useCategories";

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
        <div className="mb-8 sm:mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl"
          >
            <h2
              className="text-light-primary-text leading-tight"
              style={{
                fontFamily: "'Urbanist', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(24px, 3vw, 32px)",
              }}
            >
              Featured Categories
            </h2>
            <p
              className="mt-2 text-light-secondary-text text-[15px] sm:text-base leading-relaxed"
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
              className="inline-flex items-center gap-1.5 text-sm sm:text-[15px] font-medium text-light-primary-text hover:text-primary transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Explore all categories
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6"
        >
          {featured.map((category, index) => {
            const description =
              category.description?.trim() ||
              (category.productCount != null
                ? `${category.productCount} products to explore`
                : "Explore this curated collection.");

            return (
              <motion.div
                key={category._id}
                variants={itemVariants}
                className={spanClasses[index] ?? "md:col-span-1"}
              >
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="group relative block h-[260px] sm:h-[300px] md:h-[340px] overflow-hidden rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-200">
                      <span className="text-4xl font-bold text-neutral-400">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
                    aria-hidden
                  />

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-7">
                    <h3
                      className="text-white leading-tight line-clamp-1"
                      style={{
                        fontFamily: "'Urbanist', sans-serif",
                        fontWeight: 700,
                        fontSize: "clamp(20px, 2.2vw, 28px)",
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
