"use client";

import { Search, X, Loader2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import React, { useEffect, useState } from "react";
import { useSearchStore } from "@/store/useSearchStore";
import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";
import Image from "next/image";

interface ApiProduct {
  _id: string;
  name: string;
  image: string;
  slug: string;
}

interface SearchResponseProduct {
  _id: string;
  name: string;
  image: string[]; // Existing DB likely stores arrays of images or single image URL
  sku: string;
  price: number;
  slug: string;
}

interface SearchHeaderProps {
  id?: string;
  className?: string;
  autoFocus?: boolean;
}

const SearchHeader = ({
  id = "desktop-search",
  className,
  autoFocus = false,
}: SearchHeaderProps) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Data States
  const [recommendedProducts, setRecommendedProducts] = useState<ApiProduct[]>(
    [],
  );
  const [liveResults, setLiveResults] = useState<SearchResponseProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { recentSearches, addSearch, removeSearch, clearHistory } =
    useSearchStore();

  // Load recommended products strictly once
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const response = await api.get<{
          products: ApiProduct[];
          total: number;
        }>(`${PRODUCT_ENDPOINTS.BASE}?limit=10&sort=-createdAt`);
        if (response.data && response.data.products) {
          setRecommendedProducts(response.data.products);
        }
      } catch (err) {
        console.error("Failed to fetch recommended products:", err);
      }
    };
    fetchRecommended();
  }, []);

  // Debounced Live Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setLiveResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data } = await api.get(
          `/api/search/public?query=${encodeURIComponent(searchTerm)}&limit=5`,
        );
        if (data && data.products) {
          setLiveResults(data.products);
        }
      } catch (error) {
        console.error("Live search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleFocus = () => setIsSearchOpen(true);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".search-input-container")) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleClear = () => {
    setSearchTerm("");
    setLiveResults([]);
  };

  const executeSearch = (term: string) => {
    if (!term.trim()) return;
    addSearch(term);
    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeSearch(searchTerm);
    }
  };

  // Helper to extract a single image safely
  const getImageUrl = (imageOutput: any) => {
    if (Array.isArray(imageOutput) && imageOutput.length > 0)
      return imageOutput[0];
    if (typeof imageOutput === "string" && imageOutput.startsWith("http"))
      return imageOutput;
    return "/images/placeholder.png";
  };

  return (
    <div
      className={`relative search-input-container w-full min-w-0 max-w-full ${className || "2xl:max-w-[800px] xl:max-w-[600px]"}`}
    >
      <div className="relative flex items-center px-4 py-1.5 sm:px-5 sm:py-2 rounded-[100px] ring-1 ring-muted-foreground/32 focus-within:ring-foreground transition-shadow duration-200 bg-white shadow-sm z-50 h-10 sm:h-11">
        <div className="order-last ml-2">
          {searchTerm.length > 0 ? (
            <X
              className="text-muted-foreground size-5 cursor-pointer hover:text-primary transition-colors"
              onClick={handleClear}
            />
          ) : (
            <Search className="text-muted-foreground size-5" />
          )}
        </div>
        <input
          type="text"
          className="peer w-full bg-transparent text-sm sm:text-base text-foreground placeholder-muted-foreground focus:placeholder-transparent outline-none"
          placeholder="Search for items..."
          id={id}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoFocus={autoFocus}
        />
        <label
          htmlFor={id}
          className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-xs leading-[18px] transition-all peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:text-sm sm:peer-placeholder-shown:text-base peer-placeholder-shown:top-1/2 peer-focus:text-[12px] peer-focus:top-0 peer-[:not(:placeholder-shown)]:text-[12px] peer-[:not(:placeholder-shown)]:top-0 bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:px-1 z-10"
        >
          Search for items...
        </label>
      </div>

      <div
        data-state={isSearchOpen ? "open" : "close"}
        className={`absolute w-full top-[calc(100%-25px)] pt-[35px] left-0 border border-gray-300 shadow-[0px_24px_48px_rgba(145,158,171,0.16)] bg-white rounded-3xl z-40 transform transition-all duration-300 ease-[cubic-bezier(0.645,0.045,0.355,1)] ${isSearchOpen ? "translate-y-0 opacity-100 visible pointer-events-auto" : "hidden opacity-0 invisible pointer-events-none"}`}
      >
        <div className="p-4 overflow-y-auto max-h-[450px]">
          {/* STATE 1: Empty Search Input -> Show Recent & Recommended */}
          {!searchTerm.trim() ? (
            <>
              {/* Recent Searches */}
              <div className="flex justify-between items-center mb-4">
                <p className="font-semibold text-foreground">Recent Searches</p>
                {recentSearches.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-primary text-sm font-semibold cursor-pointer hover:underline"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {recentSearches.length === 0 ? (
                <p className="text-sm text-muted-foreground mb-6">
                  No recent searches
                </p>
              ) : (
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  {recentSearches.map((term, index) => (
                    <div
                      key={index}
                      className="text-sm border border-muted-foreground/32 px-3 py-1.5 rounded-[50px] inline-flex items-center gap-x-2 transition-colors hover:border-primary hover:text-primary cursor-pointer"
                      onClick={() => executeSearch(term)}
                    >
                      {term}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSearch(term);
                        }}
                        className="inline-flex shrink-0 items-center justify-center size-[18px] bg-muted-foreground/20 rounded-full hover:bg-destructive transition-colors ml-1"
                      >
                        <X className="size-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended List */}
              <div className="recommended-search-list-wrapper">
                <p className="text-base font-semibold text-foreground mb-4">
                  Recommended For You
                </p>
                <div className="flex flex-col gap-y-1 divide-y divide-gray-100">
                  {recommendedProducts.length === 0 ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="animate-spin text-primary size-5" />
                    </div>
                  ) : (
                    recommendedProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center gap-x-4 py-3 first:pt-0 last:pb-0 hover:bg-gray-50/50 px-2 rounded-xl cursor-pointer group transition-colors"
                        onClick={() => {
                          setIsSearchOpen(false);
                          router.push(`/product/${product.slug}`);
                        }}
                      >
                        <div className="size-12 shrink-0 rounded-lg bg-gray-50 flex items-center justify-center relative border border-gray-100 p-1">
                          <Image
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            fill
                            className="object-contain p-1 mix-blend-multiply"
                          />
                        </div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex-1 line-clamp-1">
                          {product.name}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            /* STATE 2: Typing Search -> Show Live Results */
            <div className="live-search-wrapper">
              <p className="font-semibold text-foreground mb-3 flex items-center justify-between">
                <span>Products matching "{searchTerm}"</span>
                {isSearching && (
                  <Loader2 className="animate-spin text-primary size-4" />
                )}
              </p>

              <div className="flex flex-col">
                {!isSearching && liveResults.length === 0 ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="size-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="size-5 text-gray-400" />
                    </div>
                    <p className="text-base font-medium text-foreground">
                      No products found
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Try checking your spelling or use more general terms.
                    </p>
                  </div>
                ) : (
                  liveResults.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center gap-x-4 py-3 hover:bg-primary/5 px-3 rounded-xl cursor-pointer group transition-all border-b border-transparent hover:border-primary/10"
                      onClick={() => {
                        setIsSearchOpen(false);
                        router.push(`/product/${product.slug}`);
                      }}
                    >
                      <div className="size-14 shrink-0 rounded-lg bg-white flex items-center justify-center relative border border-gray-200 overflow-hidden shadow-sm">
                        <Image
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-0.5 rounded">
                            ${product.price?.toFixed(2) || "0.00"}
                          </span>
                          {product.sku && (
                            <span className="text-xs text-muted-foreground truncate">
                              SKU: {product.sku}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {!isSearching && liveResults.length > 0 && (
                  <button
                    onClick={() => executeSearch(searchTerm)}
                    className="mt-4 w-full py-2.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-medium text-sm"
                  >
                    View all search results
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;
