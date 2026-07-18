"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X, SearchX } from "lucide-react";
import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";
import { Product } from "@/components/common/products/ProductCard";
import { ApiProduct } from "@/hooks/useProducts";
import Container from "@/components/common/Container";
import ShopSidebarFilter from "./filters/ShopSidebarFilter";
import ShopHorizontalFilter from "./filters/ShopHorizontalFilter";
import ShopTopHero from "./banners/ShopTopHero";
import ShopSortToolbar from "./filters/ShopSortToolbar";
import ShopGridAdvert from "./banners/ShopGridAdvert";
import Hero from "@/components/home/Hero";
import PaginationBar from "./PaginationBar";
import ProductCard from "@/components/common/products/ProductCard";
import { motion, AnimatePresence } from "motion/react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { formatStorePrice } from "@/lib/storeCurrency";
import { useStoreCurrencySymbol } from "@/hooks/useStorePricing";

interface ShopLayoutEngineProps {
  layoutSlug: string;
  locale: string;
  searchQuery?: string;
  initialFilters?: Partial<FilterState>;
  initialLimit?: number;
}

export interface FilterState {
  category?: string;
  productTypes?: string[];
  priceMin?: number;
  priceMax?: number;
  brands?: string[];
  rating?: number;
  sortBy?: string;
  sizes?: string[];
  colors?: string[];
  discount?: string[];
  packSizes?: string[];
}

export default function ShopLayoutEngine({
  layoutSlug,
  searchQuery,
  initialFilters,
  initialLimit,
}: ShopLayoutEngineProps) {
  const [products, setProducts] = useState<(Product | ApiProduct)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "default",
    ...initialFilters,
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [limit, setLimit] = useState(initialLimit || 25);
  const currencySymbol = useStoreCurrencySymbol();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sync state cleanly to the URL
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    const updateParam = (
      key: string,
      value: string | string[] | number | undefined,
    ) => {
      const current = params.get(key);
      let nextStr = "";

      if (Array.isArray(value)) {
        nextStr = value.length > 0 ? value.join(",") : "";
      } else if (value !== undefined && value !== null) {
        nextStr = String(value);
      }

      if (nextStr && current !== nextStr) {
        params.set(key, nextStr);
        hasChanges = true;
      } else if (!nextStr && current) {
        params.delete(key);
        hasChanges = true;
      }
    };

    updateParam("category", filters.category);
    updateParam("type", filters.productTypes);
    updateParam("brand", filters.brands); // use singular 'brand' matching the backend!

    // Purge plural 'brands' if caught from legacy states
    if (params.has("brands")) {
      params.delete("brands");
      hasChanges = true;
    }

    updateParam("sizes", filters.sizes);
    updateParam("colors", filters.colors);
    updateParam("discount", filters.discount);
    updateParam("packSizes", filters.packSizes);
    updateParam("priceMin", filters.priceMin);
    updateParam("priceMax", filters.priceMax);
    updateParam("rating", filters.rating);

    if (filters.sortBy && filters.sortBy !== "default") {
      updateParam("sortBy", filters.sortBy);
    } else {
      if (params.has("sortBy")) {
        params.delete("sortBy");
        hasChanges = true;
      }
    }

    if (searchQuery) {
      updateParam("q", searchQuery);
    }

    if (hasChanges) {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [filters, searchParams, pathname, router, searchQuery]);

  // Parse layout strategy from slug
  const decodedSlug = decodeURIComponent(layoutSlug).toLowerCase();

  // Extract number of columns from slug
  let columns = 5; // default
  if (decodedSlug.includes("1-column")) columns = 1;
  else if (decodedSlug.includes("2-column")) columns = 2;
  else if (decodedSlug.includes("3-column")) columns = 3;
  else if (decodedSlug.includes("4-column")) columns = 4;
  else if (decodedSlug.includes("5-column")) columns = 5;
  else if (decodedSlug.includes("6-column")) columns = 5; // 6-column not in ViewModeType, use 5

  // Map columns to view mode, or use list if explicitly specified
  const getInitialViewMode =
    (): import("./filters/ShopSortToolbar").ViewModeType => {
      if (decodedSlug.includes("list")) return "list";
      switch (columns) {
        case 1:
          return "list";
        case 2:
          return "grid-2";
        case 3:
          return "grid-3";
        case 4:
          return "grid-4";
        case 5:
          return "grid-5";
        default:
          return "grid-5";
      }
    };

  const [viewMode, setViewMode] =
    useState<import("./filters/ShopSortToolbar").ViewModeType>(
      getInitialViewMode(),
    );

  const hasLeftFilter =
    decodedSlug.includes("left-filter") || decodedSlug.includes("left-sidebar");
  const hasHorizontalFilter = decodedSlug.includes("horizontal-filter");
  const hasBannerWithFilter = decodedSlug.includes("banner-with-filter");
  const hasPromoBanners = decodedSlug.includes("banner-with-left-sidebar");
  const hasGridBanner =
    decodedSlug.includes("grid-banner") ||
    decodedSlug.includes("grid-with-banner");
  const hasTopBanner = decodedSlug.includes("top-banner");
  const isFullWidth = decodedSlug.includes("full-width");

  // Fetch logic
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let queryParams = `?page=${page}&limit=${limit}`;

        if (searchQuery) {
          queryParams += `&search=${encodeURIComponent(searchQuery)}`;
        }
        if (filters.category) {
          queryParams += `&category=${filters.category}`;
        }
        if (filters.priceMin !== undefined) {
          queryParams += `&priceMin=${filters.priceMin}`;
        }
        if (filters.priceMax !== undefined) {
          queryParams += `&priceMax=${filters.priceMax}`;
        }
        if (filters.brands && filters.brands.length > 0) {
          queryParams += `&brand=${filters.brands.join(",")}`;
        }
        if (filters.productTypes && filters.productTypes.length > 0) {
          queryParams += `&productTypes=${filters.productTypes.join(",")}`;
        }
        if (filters.sizes && filters.sizes.length > 0) {
          queryParams += `&sizes=${filters.sizes.join(",")}`;
        }
        if (filters.colors && filters.colors.length > 0) {
          queryParams += `&colors=${filters.colors.join(",")}`;
        }
        if (filters.discount && filters.discount.length > 0) {
          queryParams += `&discount=${filters.discount.join(",")}`;
        }
        if (filters.packSizes && filters.packSizes.length > 0) {
          queryParams += `&packSizes=${filters.packSizes.join(",")}`;
        }
        if (filters.rating) {
          queryParams += `&rating=${filters.rating}`;
        }
        if (filters.sortBy && filters.sortBy !== "default") {
          queryParams += `&sortBy=${filters.sortBy}`;
        }

        const res = await api.get<{
          products: (Product | ApiProduct)[];
          total: number;
        }>(`${PRODUCT_ENDPOINTS.BASE}${queryParams}`);

        if (res.data) {
          setProducts(res.data.products);
          setTotalProducts(res.data.total);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [page, limit, decodedSlug, searchQuery, filters]);

  // Determine standard grid sizing based on direct ViewMode rather than hard slug mapping
  // Rule: lg (1024px) must NEVER exceed 4 columns — 5-col only kicks in at xl (1280px+)
  let gridClass = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"; // default
  // Gap class: tighter at xl when showing 5 columns so titles fit on one line at 1440px
  let gapClass = "gap-4 sm:gap-6";

  if (viewMode === "grid-5") {
    gridClass =
      "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    gapClass = "gap-3 xs:gap-4 sm:gap-6 xl:gap-4";
  } else if (viewMode === "grid-4") {
    gridClass =
      "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    gapClass = "gap-3 xs:gap-4 sm:gap-6";
  } else if (viewMode === "grid-3") {
    gridClass = "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3";
    gapClass = "gap-3 xs:gap-4 sm:gap-6";
  } else if (viewMode === "grid-2") {
    gridClass = "grid-cols-1 sm:grid-cols-2";
    gapClass = "gap-4 sm:gap-6";
  } else if (viewMode === "list") {
    gridClass = "grid-cols-1";
    gapClass = "gap-4";
  }

  const renderContentGrid = () => {
    if (isLoading) {
      return (
        <div className={`grid ${gapClass} ${gridClass}`}>
          {Array.from({ length: viewMode === "list" ? 4 : 9 }).map((_, i) => (
            <div
              key={i}
              className={`${viewMode === "list" ? "h-75" : "h-112.5"} bg-gray-200 rounded-xl animate-pulse`}
            />
          ))}
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="py-12 sm:py-16 md:py-24 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-2xl sm:rounded-3xl border border-gray-100 mt-4 px-4">
          <div className="size-12 sm:size-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 sm:mb-6">
            <SearchX className="size-6 sm:size-8 text-gray-400" />
          </div>
          <h3 className="font-Urbanist text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-sm sm:text-base text-gray-500 font-dm-sans max-w-sm mb-6 sm:mb-8 px-4">
            We couldn&apos;t find anything matching your current filters. Try
            adjusting your search or clearing some constraints.
          </p>
          <button
            onClick={handleClearAll}
            className="h-10 sm:h-12 px-6 sm:px-8 rounded-full bg-primary text-white font-dm-sans text-sm sm:text-base font-medium hover:bg-primary/90 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      );
    }

    return (
      <motion.div layout className={`grid ${gapClass} ${gridClass}`}>
        <AnimatePresence mode="popLayout">
          {products.map((product, idx) => {
            const productKey =
              "_id" in product ? product._id : product.id || idx;

            // If grid with banner, maybe inject banner element at first pos
            if (hasGridBanner && idx === 0 && viewMode !== "list") {
              return (
                <div key={`grid-advert-${productKey}`}>
                  <ShopGridAdvert />
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={product as Product} />
                  </motion.div>
                </div>
              );
            }

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={productKey}
              >
                {viewMode === "list" ? (
                  <ProductCard
                    product={product as Product}
                    variant="horizontal"
                  />
                ) : (
                  <ProductCard product={product as Product} />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    );
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to page 1 when filtering
  };

  const removeFilter = (key: keyof FilterState, valueToRemove?: any) => {
    setFilters((prev) => {
      const state = { ...prev };
      if (Array.isArray(state[key]) && valueToRemove) {
        state[key] = (state[key] as any[]).filter(
          (v) => v !== valueToRemove,
        ) as any;
      } else {
        state[key] = undefined;
      }
      return state;
    });
    setPage(1);
  };

  const handleClearAll = () => {
    setFilters({ sortBy: filters.sortBy || "default" });
    setPage(1);
  };

  const renderActiveFilters = () => {
    const filterTags: React.ReactNode[] = [];

    if (filters.category) {
      filterTags.push(
        <div
          key="category"
          className="flex items-center gap-1 bg-primary/10 text-primary px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-medium"
        >
          <span className="truncate max-w-30 xs:max-w-none">
            Category: {filters.category}
          </span>
          <button
            onClick={() => removeFilter("category")}
            className="hover:bg-primary/20 rounded-full p-0.5 shrink-0"
          >
            <X className="size-3" />
          </button>
        </div>,
      );
    }

    if (filters.brands && filters.brands.length > 0) {
      filters.brands.forEach((b) => {
        filterTags.push(
          <div
            key={`brand-${b}`}
            className="flex items-center gap-1 bg-primary/10 text-primary px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-medium"
          >
            <span className="truncate max-w-25 xs:max-w-none">Brand: {b}</span>
            <button
              onClick={() => removeFilter("brands", b)}
              className="hover:bg-primary/20 rounded-full p-0.5 shrink-0"
            >
              <X className="size-3" />
            </button>
          </div>,
        );
      });
    }

    if (filters.productTypes && filters.productTypes.length > 0) {
      filters.productTypes.forEach((pt) => {
        filterTags.push(
          <div
            key={`type-${pt}`}
            className="flex items-center gap-1 bg-primary/10 text-primary px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-medium"
          >
            <span className="truncate max-w-25 xs:max-w-none">Type: {pt}</span>
            <button
              onClick={() => removeFilter("productTypes", pt)}
              className="hover:bg-primary/20 rounded-full p-0.5 shrink-0"
            >
              <X className="size-3" />
            </button>
          </div>,
        );
      });
    }

    if (filters.colors && filters.colors.length > 0) {
      filters.colors.forEach((c) => {
        filterTags.push(
          <div
            key={`color-${c}`}
            className="flex items-center gap-1 bg-primary/10 text-primary px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-medium"
          >
            <span className="truncate max-w-20 xs:max-w-none">Color: {c}</span>
            <button
              onClick={() => removeFilter("colors", c)}
              className="hover:bg-primary/20 rounded-full p-0.5 shrink-0"
            >
              <X className="size-3" />
            </button>
          </div>,
        );
      });
    }

    if (filters.sizes && filters.sizes.length > 0) {
      filters.sizes.forEach((s) => {
        filterTags.push(
          <div
            key={`size-${s}`}
            className="flex items-center gap-1 bg-primary/10 text-primary px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-medium"
          >
            <span className="truncate max-w-20 xs:max-w-none">Size: {s}</span>
            <button
              onClick={() => removeFilter("sizes", s)}
              className="hover:bg-primary/20 rounded-full p-0.5 shrink-0"
            >
              <X className="size-3" />
            </button>
          </div>,
        );
      });
    }

    if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
      filterTags.push(
        <div
          key="price"
          className="flex items-center gap-1 bg-primary/10 text-primary px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-medium"
        >
          <span className="whitespace-nowrap">
            {formatStorePrice(filters.priceMin, currencySymbol)} -{" "}
            {formatStorePrice(filters.priceMax, currencySymbol)}
          </span>
          <button
            onClick={() => {
              removeFilter("priceMin");
              removeFilter("priceMax");
            }}
            className="hover:bg-primary/20 rounded-full p-0.5 shrink-0"
          >
            <X className="size-3" />
          </button>
        </div>,
      );
    }

    if (filters.rating) {
      filterTags.push(
        <div
          key="rating"
          className="flex items-center gap-1 bg-primary/10 text-primary px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-medium"
        >
          <span className="whitespace-nowrap">{filters.rating}★ & up</span>
          <button
            onClick={() => removeFilter("rating")}
            className="hover:bg-primary/20 rounded-full p-0.5 shrink-0"
          >
            <X className="size-3" />
          </button>
        </div>,
      );
    }

    if (filters.discount && filters.discount.length > 0) {
      filters.discount.forEach((d) => {
        filterTags.push(
          <div
            key={`discount-${d}`}
            className="flex items-center gap-1 bg-primary/10 text-primary px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-medium"
          >
            <span className="truncate max-w-25 xs:max-w-none">{d}</span>
            <button
              onClick={() => removeFilter("discount", d)}
              className="hover:bg-primary/20 rounded-full p-0.5 shrink-0"
            >
              <X className="size-3" />
            </button>
          </div>,
        );
      });
    }

    if (filters.packSizes && filters.packSizes.length > 0) {
      filters.packSizes.forEach((p) => {
        filterTags.push(
          <div
            key={`pack-${p}`}
            className="flex items-center gap-1 bg-primary/10 text-primary px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-medium"
          >
            <span className="truncate max-w-25 xs:max-w-none">Weight: {p}</span>
            <button
              onClick={() => removeFilter("packSizes", p)}
              className="hover:bg-primary/20 rounded-full p-0.5 shrink-0"
            >
              <X className="size-3" />
            </button>
          </div>,
        );
      });
    }

    if (filterTags.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 mb-3 sm:mb-4">
        <span className="text-xs xs:text-sm text-muted-foreground mr-1 shrink-0">
          Filters:
        </span>
        {filterTags}
        <button
          onClick={handleClearAll}
          className="text-xs xs:text-sm text-primary hover:underline ml-1 xs:ml-2 shrink-0 font-medium"
        >
          Clear All
        </button>
      </div>
    );
  };

  const activeResultCount = products.length;

  return (
    <div className="py-6 sm:py-8 md:py-10 bg-white">
      {hasTopBanner && <ShopTopHero layoutType={decodedSlug} />}

      <Container
        className={isFullWidth ? "max-w-full px-3 sm:px-4 md:px-6 lg:px-8" : ""}
      >
        {(hasHorizontalFilter || hasBannerWithFilter) && (
          <ShopHorizontalFilter />
        )}

        <div
          className={`flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6 md:mt-8`}
        >
          {hasLeftFilter && (
            <div className="hidden xl:block w-64 lg:w-72 xl:w-75 shrink-0">
              <ShopSidebarFilter
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col gap-3 sm:gap-4 md:gap-6">
            {hasPromoBanners && (
              <div className="w-full relative z-10 xl:mt-0">
                <Hero homeVersionSlug="home-1" compact={true} />
              </div>
            )}

            <ShopSortToolbar
              totalResults={totalProducts}
              currentResultCount={activeResultCount}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              limit={limit}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1); // Reset to page 1 on limit change
              }}
              sortBy={filters.sortBy}
              onSortChange={(sort) => handleFilterChange({ sortBy: sort })}
              onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
              hasLeftFilter={hasLeftFilter}
            />

            {renderActiveFilters()}

            {renderContentGrid()}

            {/* Pagination Box */}
            {totalProducts > 0 && (
              <div className="mt-6 sm:mt-8 flex justify-center px-2">
                <PaginationBar
                  currentPage={page}
                  totalPages={Math.ceil(totalProducts / limit)}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Sheet */}
        {hasLeftFilter && (
          <Sheet
            open={isMobileFiltersOpen}
            onOpenChange={setIsMobileFiltersOpen}
          >
            <SheetContent
              side="left"
              className="w-70 xs:w-[300px] sm:w-[320px] p-0 border-none overflow-y-auto hidden-scrollbar"
            >
              <SheetTitle className="sr-only">Filters</SheetTitle>
              <div className="p-3 xs:p-4 bg-white min-h-full">
                <ShopSidebarFilter
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </Container>
    </div>
  );
}
