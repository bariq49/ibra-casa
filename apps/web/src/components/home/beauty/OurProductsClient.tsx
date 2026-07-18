"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Container from "../../common/Container";
import ProductCard from "../../common/products/ProductCard";
import ProductSkeleton from "../../common/products/ProductSkeleton";
import { Category } from "@/hooks/useCategories";
import { SectionHeader } from "../../common/SectionHeader";
import { ApiProduct } from "@/hooks/useProducts";
import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface OurProductsClientProps {
  categories: Category[];
}

const OurProductsClient = ({ categories }: OurProductsClientProps) => {
  const [activeCategory, setActiveCategory] = useState<string>("all-products");
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Reference for the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollability = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  }, []);

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    // Slight delay to ensure layout is calculated after render
    const timer = setTimeout(checkScrollability, 100);
    return () => {
      window.removeEventListener("resize", checkScrollability);
      clearTimeout(timer);
    };
  }, [checkScrollability, categories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250; // Adjust scroll distance
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Construct URL based on active tab. The API uses 'category' query param.
  const endpoint =
    activeCategory === "all-products"
      ? `${PRODUCT_ENDPOINTS.BASE}?productBase=beauty&limit=10`
      : `${PRODUCT_ENDPOINTS.BASE}?productBase=beauty&category=${activeCategory}&limit=10`;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ products: ApiProduct[]; total: number }>(
        endpoint,
      );
      const mappedProducts = res.data.products.map((p) => ({
        ...p,
        bg: p.bg || "#ffeff6",
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <section className="py-10 md:py-14 lg:py-[70px] w-full bg-white relative">
      <Container>
        <div className="flex flex-col gap-[40px] items-start w-full">
          {/* Header & Tabs */}
          <div className="flex flex-col gap-[24px] items-center justify-center w-full">
            <SectionHeader title="Our Products" align="center" />

            {/* Horizontal Scrollable Tabs with Arrows */}
            <div className="relative w-full min-w-0 max-w-full mx-auto flex items-center justify-center xl:max-w-[80vw]">
              <AnimatePresence>
                {showLeftArrow && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => scroll("left")}
                    className="absolute left-0 z-10 flex items-center justify-center size-[36px] md:size-[40px] rounded-full border border-[rgba(145,158,171,0.32)] bg-white/95 text-light-primary-text hover:bg-gray-50 hover:shadow-md transition-all shadow-sm shrink-0"
                  >
                    <ChevronLeft className="size-4 md:size-5" />
                  </motion.button>
                )}
              </AnimatePresence>

              <div
                ref={scrollContainerRef}
                onScroll={checkScrollability}
                className="flex gap-[16px] items-center overflow-x-auto scroll-smooth py-2 px-4 md:px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {/* "All Products" Button */}
                <button
                  onClick={() => setActiveCategory("all-products")}
                  className={`flex items-center justify-center px-[24px] py-[12px] rounded-[55px] shrink-0 transition-all duration-300 ${
                    activeCategory === "all-products"
                      ? "bg-primary text-white shadow-color-primary"
                      : "bg-white border border-[rgba(145,158,171,0.32)] text-light-primary-text hover:bg-gray-50"
                  }`}
                >
                  <span className="font-['DM_Sans',sans-serif] font-bold text-[16px] leading-[26px] whitespace-nowrap">
                    All Products
                  </span>
                </button>

                {/* Individual Category Buttons */}
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setActiveCategory(cat._id)}
                    className={`flex items-center justify-center px-[24px] py-[12px] rounded-[51px] shrink-0 transition-all duration-300 ${
                      activeCategory === cat._id
                        ? "bg-primary text-white shadow-color-primary"
                        : "bg-white border border-[rgba(145,158,171,0.32)] text-light-primary-text hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-['DM_Sans',sans-serif] font-bold text-[16px] leading-[26px] whitespace-nowrap">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {showRightArrow && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => scroll("right")}
                    className="absolute right-0 z-10 flex items-center justify-center size-[36px] md:size-[40px] rounded-full border border-[rgba(145,158,171,0.32)] bg-white/95 text-light-primary-text hover:bg-gray-50 hover:shadow-md transition-all shadow-sm shrink-0"
                  >
                    <ChevronRight className="size-4 md:size-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Dynamic Grid Layout */}
          <div className="w-full min-h-[400px] relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 w-full"
                >
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="w-full h-full">
                      <ProductSkeleton variant="beauty" />
                    </div>
                  ))}
                </motion.div>
              ) : products && products.length > 0 ? (
                <motion.div
                  key={`grid-${activeCategory}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 w-full"
                >
                  {products.map((product: ApiProduct) => (
                    <div key={product._id} className="w-full h-full">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center w-full min-h-[400px] text-light-secondary-text bg-gray-50/50 rounded-2xl"
                >
                  <p className="text-lg font-['DM_Sans',sans-serif]">
                    No products found in this category.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default OurProductsClient;
