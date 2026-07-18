"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, Variants } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/common/Container";
import { Link } from "@/i18n/routing";
import { useProductBases } from "@/hooks/useProductBases";
import api from "@/lib/api";
import { CATEGORY_ENDPOINTS } from "@/constants/endpoints";
import { Skeleton } from "@/components/ui/skeleton";
import PaginationBar from "@/components/shop/PaginationBar";
import { Category } from "@/hooks/useCategories";

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

export default function AllCategoriesClient() {
  const { productBases, isLoading: isLoadingBases } = useProductBases();
  const [activeBase, setActiveBase] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      // Added a 5px tolerance to account for potential padding or sub-pixel snapping
      setCanScrollLeft(Math.ceil(scrollLeft) > 5);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
    }
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const current = scrollContainerRef.current;
    if (current) {
      current.addEventListener("scroll", updateScrollButtons);
      window.addEventListener("resize", updateScrollButtons);
    }
    return () => {
      if (current) {
        current.removeEventListener("scroll", updateScrollButtons);
      }
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [productBases, updateScrollButtons]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.5; // Scroll 50% of container width
      scrollContainerRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollLeft - scrollAmount
            : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const fetchCategories = useCallback(
    async (baseSlug: string, currentPage: number) => {
      setIsLoadingCats(true);
      try {
        const url = CATEGORY_ENDPOINTS.BASE;
        const params: any = { perPage: 24, page: currentPage };
        if (baseSlug !== "all") {
          params.bases = baseSlug;
        }
        const response = await api.get(url, { params });
        setCategories(response.data.categories || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch categorized layout data", err);
      } finally {
        setIsLoadingCats(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchCategories(activeBase, page);
  }, [activeBase, page, fetchCategories]);

  const handleBaseChange = (slug: string) => {
    if (slug !== activeBase) {
      setActiveBase(slug);
      setPage(1);
    }
  };

  return (
    <section className="py-10 md:py-14 lg:py-[70px] min-h-screen">
      <Container>
        {/* Header Section */}
        <div className="flex flex-col gap-[8px] text-center items-center mb-8 sm:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-['Urbanist',sans-serif] text-3xl md:text-4xl lg:text-[46px] font-bold leading-tight text-light-primary-text mb-2"
          >
            Explore All Categories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-dm-sans text-[16px] font-normal text-light-secondary-text leading-[24px] max-w-lg"
          >
            Find exactly what you are looking for by browsing through our
            extensive collection of high quality products.
          </motion.p>
        </div>

        {/* Filter Tabs */}
        <div className="relative w-full max-w-full mb-10 group flex justify-center overflow-hidden">
          {isLoadingBases ? (
            <div className="relative w-full max-w-4xl mx-auto flex items-center px-10 sm:px-14">
              <Skeleton className="absolute left-0 sm:left-2 z-10 w-9 h-9 rounded-full shrink-0" />
              <div className="flex items-center gap-[12px] overflow-hidden py-2 px-1 w-full">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-[42px] w-[110px] sm:w-[130px] rounded-[50px] shrink-0"
                  />
                ))}
              </div>
              <Skeleton className="absolute right-0 sm:right-2 z-10 w-9 h-9 rounded-full shrink-0" />
            </div>
          ) : (
            <div className="relative w-full max-w-4xl mx-auto flex items-center px-10 sm:px-14">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className={`absolute left-0 sm:left-2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-100 transition-all ${
                  canScrollLeft
                    ? "text-gray-600 hover:text-primary hover:border-primary/30 cursor-pointer opacity-100"
                    : "text-gray-300 opacity-50 cursor-not-allowed"
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} className="ml-[-2px]" />
              </button>

              <div
                ref={scrollContainerRef}
                className="flex items-center gap-[12px] overflow-x-auto snap-x py-2 px-1 w-full"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                  .overflow-x-auto::-webkit-scrollbar { display: none; }
                `,
                  }}
                />
                <button
                  onClick={() => handleBaseChange("all")}
                  className={`snap-start shrink-0 px-[24px] py-[10px] rounded-[50px] font-dm-sans font-medium text-[15px] transition-all whitespace-nowrap border ${
                    activeBase === "all"
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-light-secondary-text border-light-border hover:border-primary hover:text-primary"
                  }`}
                >
                  All Categories
                </button>
                {productBases.map((base) => (
                  <button
                    key={base._id}
                    onClick={() => handleBaseChange(base.slug)}
                    className={`snap-start shrink-0 px-[24px] py-[10px] rounded-[50px] font-dm-sans font-medium text-[15px] transition-all whitespace-nowrap border ${
                      activeBase === base.slug
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-light-secondary-text border-light-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {base.title}
                  </button>
                ))}
              </div>

              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className={`absolute right-0 sm:right-2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-100 transition-all ${
                  canScrollRight
                    ? "text-gray-600 hover:text-primary hover:border-primary/30 cursor-pointer opacity-100"
                    : "text-gray-300 opacity-50 cursor-not-allowed"
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight size={20} className="mr-[-2px]" />
              </button>
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="w-full">
          {isLoadingCats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                  <Skeleton className="w-full aspect-square rounded-[16px]" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">📭</span>
              </div>
              <h3 className="text-xl font-bold font-Urbanist text-light-primary-text mb-2">
                No Categories Found
              </h3>
              <p className="text-light-secondary-text font-dm-sans">
                We couldn't find any categories for this specific segment.
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6"
            >
              {categories.map((category) => (
                <motion.div
                  key={category._id}
                  variants={itemVariants}
                  className="w-full flex"
                >
                  <Link
                    href={`/shop?category=${category.slug}`}
                    className="group flex flex-col items-center gap-[16px] w-full"
                  >
                    <div className="w-full aspect-square rounded-[16px] bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08)] transition-all duration-300 group-hover:border-primary/40 relative p-6">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="size-16 bg-primary/10 rounded-[12px] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                          <span className="text-primary font-bold text-2xl">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {/* Outer animated border on hover */}
                      <div className="absolute inset-0 rounded-[16px] border-2 border-transparent group-hover:border-primary/20 scale-105 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                    </div>
                    <h4 className="font-dm-sans text-[14px] sm:text-[16px] font-semibold text-gray-800 group-hover:text-primary text-center w-full leading-[20px] transition-colors truncate px-2">
                      {category.name}
                    </h4>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Pagination Row */}
        {totalPages > 1 && (
          <div className="w-full flex justify-end items-center mt-12">
            <PaginationBar
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </Container>
    </section>
  );
}
