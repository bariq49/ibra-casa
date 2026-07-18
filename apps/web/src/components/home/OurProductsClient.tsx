"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "../common/Container";
import ProductCard from "../common/products/ProductCard";
import { ApiProduct } from "@/hooks/useProducts";
import { Category } from "@/hooks/useCategories";
import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";
import { Skeleton } from "@/components/ui/skeleton";

interface OurProductsClientProps {
  initialProducts: ApiProduct[];
  categories: Category[];
  locale: string;
}

const OurProductsClient = ({
  initialProducts,
  categories,
  locale,
}: OurProductsClientProps) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [products, setProducts] = useState<ApiProduct[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const scrollPrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (activeCategory === "all") {
      // Re-fetch initial state if needed, or just use initialProducts
      // The requirement says "fetch product without category filtering"
      const fetchAllProducts = async () => {
        setIsLoading(true);
        try {
          const response = await api.get<{
            products: ApiProduct[];
            total: number;
          }>(`${PRODUCT_ENDPOINTS.BASE}?limit=12`);
          setProducts(response.data.products);
        } catch (error) {
          console.error("Error fetching all products:", error);
        } finally {
          setIsLoading(false);
        }
      };

      if (activeCategory === "all") {
        fetchAllProducts();
      }
      return;
    }

    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<{
          products: ApiProduct[];
          total: number;
        }>(`${PRODUCT_ENDPOINTS.BASE}?category=${activeCategory}&limit=12`);
        setProducts(response.data.products);
      } catch (error) {
        console.error("Error fetching filtered products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [activeCategory, initialProducts]);

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
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-10 md:py-14 lg:py-17.5">
      <Container>
        {/* Header: "Our Products" left, [categories + nav] right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          {/* Title */}
          <motion.div
            className="shrink-0"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-['Urbanist',sans-serif] text-2xl sm:text-3xl lg:text-[40px] font-bold leading-tight lg:leading-[48px] text-gray-900 whitespace-nowrap">
              Our Products
            </h2>
          </motion.div>

          {/* Right side: scrollable categories + prev/next buttons */}
          <motion.div
            className="flex items-center gap-2 min-w-0 flex-1 sm:justify-end"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Category Filters */}
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth min-w-0 pb-1"
            >
              <button
                onClick={() => setActiveCategory("all")}
                className={`shrink-0 px-4 py-2 rounded-full text-[13px] sm:text-[14px] font-medium transition-all duration-300 whitespace-nowrap ${
                  activeCategory === "all"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setActiveCategory(category._id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-[13px] sm:text-[14px] font-medium transition-all duration-300 whitespace-nowrap ${
                    activeCategory === category._id
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Prev / Next Buttons — right of categories */}
            <div className="flex items-center gap-1.5 shrink-0 pl-1">
              <button
                onClick={scrollPrev}
                disabled={!canScrollLeft}
                aria-label="Previous categories"
                className={`p-2 rounded-full border transition-all ${
                  !canScrollLeft
                    ? "opacity-30 cursor-not-allowed border-gray-200 text-gray-400"
                    : "border-gray-300 text-gray-700 hover:bg-primary hover:text-white hover:border-primary shadow-sm cursor-pointer"
                }`}
              >
                <ChevronLeft className="size-4 sm:size-5" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollRight}
                aria-label="Next categories"
                className={`p-2 rounded-full border transition-all ${
                  !canScrollRight
                    ? "opacity-30 cursor-not-allowed border-gray-200 text-gray-400"
                    : "border-gray-300 text-gray-700 hover:bg-primary hover:text-white hover:border-primary shadow-sm cursor-pointer"
                }`}
              >
                <ChevronRight className="size-4 sm:size-5" />
              </button>
            </div>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="w-full aspect-square rounded-[16px]" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative w-full overflow-hidden">
            <motion.div
              key={`grid-${activeCategory}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-6 gap-y-8 gap-x-6 w-full"
            >
              <AnimatePresence mode="popLayout">
                {products.map((product) => (
                  <motion.div
                    key={product._id}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full h-full"
                  >
                    <ProductCard
                      product={{
                        id: product._id,
                        title: product.name,
                        rating: product.numReviews || 0,
                        stars: product.averageRating || 0,
                        currentPrice: parseFloat(
                          (
                            product.price *
                            (1 - (product.discountPercentage || 0) / 100)
                          ).toFixed(2),
                        ),
                        oldPrice: product.price,
                        discount: product.discountPercentage || 0,
                        image: product.image,
                        slug: product.slug,
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {products.length === 0 && (
                <div className="col-span-full text-center py-20 bg-gray-50 rounded-[16px] border border-dashed border-gray-200">
                  <p className="text-gray-500">
                    No products found in this category.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </Container>
    </section>
  );
};

export default OurProductsClient;
