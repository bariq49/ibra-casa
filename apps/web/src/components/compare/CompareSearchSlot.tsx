"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import Image from "next/image";
import PriceFormatter from "@/components/common/products/PriceFormatter";
import api from "@/lib/api";
import { useCompareStore } from "@/store/useCompareStore";

interface SearchResponseProduct {
  _id: string;
  name: string;
  image: string[];
  sku: string;
  price: number;
  slug: string;
  numReviews?: number;
  averageRating?: number;
  category?: { name: string };
  brand?: { name: string };
  colors?: { name: string; value: string; slug: string }[];
  sizes?: { name: string; value: string; slug: string }[];
  description?: string;
  stock?: number;
  discountPercentage?: number;
  productType?: { name: string };
  bg?: string;
}

const CompareSearchSlot = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [liveResults, setLiveResults] = useState<SearchResponseProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const addToCompare = useCompareStore((state) => state.addToCompare);
  const isInCompare = useCompareStore((state) => state.isInCompare);

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
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getImageUrl = (imageOutput: any) => {
    if (Array.isArray(imageOutput) && imageOutput.length > 0)
      return imageOutput[0];
    if (typeof imageOutput === "string" && imageOutput.startsWith("http"))
      return imageOutput;
    return "/images/placeholder.png";
  };

  const handleSelectProduct = (product: SearchResponseProduct) => {
    if (isInCompare(product._id)) {
      // It's already in the compare store, it's handled by addToCompare internally as well,
      // but let's just close the dropdown.
    }
    
    addToCompare({
      id: product._id,
      title: product.name,
      rating: product.numReviews || 0,
      stars: product.averageRating || 0,
      currentPrice: parseFloat(
        (
          product.price *
          (1 - (product.discountPercentage || 0) / 100)
        ).toFixed(2)
      ),
      oldPrice: product.price,
      discount: product.discountPercentage || 0,
      image: getImageUrl(product.image),
      bg: product.bg,
      slug: product.slug,
      category: product.category?.name || product.productType?.name || "General",
      brand: product.brand?.name,
      colors: product.colors,
      sizes: product.sizes,
      description: product.description,
      available: product.stock || 0,
    });
    
    setSearchTerm("");
    setIsSearchOpen(false);
  };

  return (
    <div className="relative w-full h-[280px] border border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col p-4">
      <div 
        ref={wrapperRef}
        className="w-full relative z-20"
      >
        <div className="relative flex items-center px-4 py-2 rounded-full ring-1 ring-gray-200 focus-within:ring-primary transition-shadow duration-200 bg-white shadow-sm w-full">
          <Search className="text-muted-foreground size-4 shrink-0 mr-2" />
          <input
            type="text"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder-muted-foreground"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
          {searchTerm && (
            <X 
              className="text-muted-foreground size-4 ml-2 cursor-pointer hover:text-primary transition-colors shrink-0" 
              onClick={() => {
                setSearchTerm("");
                setIsSearchOpen(false);
              }}
            />
          )}
        </div>

        {isSearchOpen && searchTerm.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden max-h-[250px] flex flex-col">
            {isSearching ? (
              <div className="flex items-center justify-center p-6 text-muted-foreground">
                <Loader2 className="size-5 animate-spin mr-2" />
                <span className="text-sm">Searching...</span>
              </div>
            ) : liveResults.length > 0 ? (
              <div className="overflow-y-auto w-full">
                {liveResults.map((product) => (
                  <button
                    key={product._id}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors text-left"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="size-10 rounded bg-white border border-gray-100 overflow-hidden shrink-0 relative flex items-center justify-center p-1">
                      <Image 
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-primary font-bold mt-0.5">
                        <PriceFormatter amount={product.price} />
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No products found for "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareSearchSlot;
