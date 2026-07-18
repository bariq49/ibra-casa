"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { X, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCompareStore } from "@/store/useCompareStore";
import { useCartStore } from "@/store/useCartStore";
import CompareSearchSlot from "@/components/compare/CompareSearchSlot";
import Ratings from "@/components/common/products/Ratings";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ComparePageClient = () => {
  const [mounted, setMounted] = useState(false);
  const compareItems = useCompareStore((state) => state.compareItems);
  const removeFromCompare = useCompareStore((state) => state.removeFromCompare);
  const addToCart = useCartStore((state) => state.addToCart);

  // Local quantity map keyed by product ID
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  const maxCompareSlots = 4;
  const currentCount = compareItems.length;
  const emptySlotsCount = Math.max(0, maxCompareSlots - currentCount);

  return (
    <div className="w-full overflow-x-auto pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
      <div className="w-full min-w-max border border-border rounded-xl overflow-hidden">
        {/* Table Head / Images */}
        <div className="flex border-b border-border">
          <div className="w-[100px] md:w-[130px] shrink-0 p-3 md:p-4 flex items-center font-bold text-foreground">
            Product
          </div>
          <div className="flex-1 flex">
            {compareItems.map((item) => (
              <div
                key={item.id || item._id}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border relative flex flex-col justify-between"
              >
                <button
                  onClick={() => removeFromCompare((item.id || item._id)!)}
                  className="absolute top-4 right-4 z-10 size-8 rounded-full bg-white shadow-sm hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="size-4 text-gray-500" />
                </button>
                <div className="w-full h-full min-h-[160px] md:min-h-[260px] relative rounded-xl overflow-hidden flex items-center justify-center bg-[#F8F9FA]">
                  <Link
                    href={`/product/${item.slug}`}
                    className="w-full h-full absolute inset-0 cursor-pointer block"
                  >
                    <Image
                      src={item.image || (item as any).images?.[0] || "/images/placeholder.png"}
                      alt={item.title || (item as any).name || "Product"}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </Link>
                </div>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border flex items-center justify-center"
              >
                <CompareSearchSlot />
              </div>
            ))}
          </div>
        </div>

        {/* Row: Name */}
        <div className="flex border-b border-border bg-[#F9FAFB]">
          <div className="w-[100px] md:w-[130px] shrink-0 p-3 md:p-4 flex items-center font-bold text-foreground text-sm">
            Name
          </div>
          <div className="flex-1 flex">
            {compareItems.map((item) => (
              <div
                key={item.id || item._id}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border text-xs md:text-sm font-medium text-foreground flex items-center"
              >
                {item.title || (item as any).name || "Unknown"}
              </div>
            ))}
            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty-name-${idx}`}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border"
              />
            ))}
          </div>
        </div>



        {/* Row: Category */}
        <div className="flex border-b border-border">
          <div className="w-[100px] md:w-[130px] shrink-0 p-3 md:p-4 flex items-center font-bold text-foreground text-sm">
            Category
          </div>
          <div className="flex-1 flex">
            {compareItems.map((item) => (
              <div
                key={item.id || item._id}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border text-xs md:text-sm font-bold text-foreground flex items-center"
              >
                {((item.category as any)?.name) || (typeof item.category === 'string' ? item.category : "General")}
              </div>
            ))}
            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty-cat-${idx}`}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border"
              />
            ))}
          </div>
        </div>

        {/* Row: Color */}
        <div className="flex border-b border-border bg-[#F9FAFB]">
          <div className="w-[100px] md:w-[130px] shrink-0 p-3 md:p-4 flex items-center font-bold text-foreground text-sm">
            Color
          </div>
          <div className="flex-1 flex">
            {compareItems.map((item) => (
              <div
                key={item.id || item._id}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border flex flex-wrap items-center gap-1 md:gap-2"
              >
                {item.colors && item.colors.length > 0 ? (
                  item.colors.map((color, i) => (
                    <div
                      key={i}
                      className="size-[18px] rounded-full border border-gray-200"
                      style={{ backgroundColor: typeof color === 'string' ? color : color.value }}
                      title={typeof color === 'string' ? color : color.name}
                    />
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            ))}
            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty-color-${idx}`}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border"
              />
            ))}
          </div>
        </div>

        {/* Row: Sizes */}
        <div className="flex border-b border-border">
          <div className="w-[100px] md:w-[130px] shrink-0 p-3 md:p-4 flex items-center font-bold text-foreground text-sm">
            Sizes
          </div>
          <div className="flex-1 flex">
            {compareItems.map((item) => (
              <div
                key={item.id || item._id}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border text-xs md:text-sm font-bold text-foreground flex items-center"
              >
                {item.sizes && item.sizes.length > 0
                  ? item.sizes.map((s) => typeof s === 'string' ? s : s.name).filter(Boolean).join(", ")
                  : "-"}
              </div>
            ))}
            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty-qty-${idx}`}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border"
              />
            ))}
          </div>
        </div>

        {/* Row: Rating */}
        <div className="flex border-b border-border bg-[#F9FAFB]">
          <div className="w-[100px] md:w-[130px] shrink-0 p-3 md:p-4 flex items-center font-bold text-foreground text-sm">
            Rating
          </div>
          <div className="flex-1 flex">
            {compareItems.map((item) => (
              <div
                key={item.id || item._id}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border flex flex-col md:flex-row items-start md:items-center justify-start gap-1 md:gap-2"
              >
                <Ratings rating={((item as any).averageRating || item.stars || 0)} />
                <span className="text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap">
                  ({(item as any).numReviews || item.rating || 0} reviews)
                </span>
              </div>
            ))}
            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty-rating-${idx}`}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border"
              />
            ))}
          </div>
        </div>

        {/* Row: Brand */}
        <div className="flex border-b border-border">
          <div className="w-[100px] md:w-[130px] shrink-0 p-3 md:p-4 flex items-center font-bold text-foreground text-sm">
            Brand
          </div>
          <div className="flex-1 flex">
            {compareItems.map((item) => (
              <div
                key={item.id || item._id}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border text-xs md:text-sm font-bold text-foreground flex items-center"
              >
                {((item.brand as any)?.name) || (typeof item.brand === 'string' ? item.brand : "-")}
              </div>
            ))}
            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty-brand-${idx}`}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border"
              />
            ))}
          </div>
        </div>

        {/* Row: Availability */}
        <div className="flex border-b border-border bg-[#F9FAFB]">
          <div className="w-[100px] md:w-[130px] shrink-0 p-3 md:p-4 flex items-center font-bold text-foreground text-sm">
            Availability
          </div>
          <div className="flex-1 flex">
            {compareItems.map((item) => (
              <div
                key={item.id || item._id}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border text-xs md:text-sm font-bold text-foreground flex items-center"
              >
                {(item as any).stock ?? item.available ?? 0}
              </div>
            ))}
            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty-avail-${idx}`}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border"
              />
            ))}
          </div>
        </div>

        {/* Row: Add to Cart */}
        <div className="flex border-b border-border">
          <div className="w-[100px] md:w-[130px] shrink-0 p-3 md:p-4 flex items-center font-bold text-foreground text-sm">
            Add to Cart
          </div>
          <div className="flex-1 flex">
            {compareItems.map((item) => (
              <div
                key={item.id || item._id}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border flex flex-col justify-center items-start md:items-center"
              >
                <div className="flex items-center gap-3 w-full justify-center xl:justify-start 2xl:justify-center flex-wrap xl:flex-nowrap">
                  <div className="flex items-center justify-between border border-border rounded-full px-2 h-11 w-[90px] xl:w-[100px] bg-white shrink-0">
                    <button
                      className="text-muted-foreground hover:text-foreground size-7 flex items-center justify-center rounded-full transition-colors"
                      onClick={() =>
                        setQuantities((prev) => ({
                          ...prev,
                          [item.id || (item as any)._id]: Math.max(1, (prev[item.id || (item as any)._id] || 1) - 1),
                        }))
                      }
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="font-bold text-sm min-w-[20px] text-center select-none">
                      {quantities[item.id || (item as any)._id] || 1}
                    </span>
                    <button
                      className="text-primary hover:text-primary/80 hover:bg-primary/10 size-7 flex items-center justify-center rounded-full transition-colors"
                      onClick={() =>
                        setQuantities((prev) => ({
                          ...prev,
                          [item.id || (item as any)._id]: (prev[item.id || (item as any)._id] || 1) + 1,
                        }))
                      }
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <Button
                    onClick={() => {
                      addToCart(
                        {
                          id: item.id || (item as any)._id,
                          title: item.title || (item as any).name,
                          rating: (item as any).numReviews || item.rating,
                          stars: (item as any).averageRating || item.stars,
                          currentPrice: item.currentPrice,
                          oldPrice: item.oldPrice,
                          discount: item.discount,
                          image: item.image || (item as any).images?.[0],
                          slug: item.slug,
                        },
                        quantities[item.id || (item as any)._id] || 1,
                      );
                      toast.success(`${item.title || (item as any).name} added to cart`);
                    }}
                    className="bg-primary hover:bg-primary/90 text-white rounded-full px-3 md:px-5 h-10 md:h-11 font-bold shadow-primary-btn flex-1 min-w-[80px] md:min-w-[90px] text-xs md:text-sm"
                  >
                    <ShoppingCart className="size-3.5 md:size-4 mr-1 md:mr-1.5" />
                    Add
                  </Button>
                </div>
              </div>
            ))}
            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty-cart-${idx}`}
                className="flex-1 min-w-[140px] md:min-w-[150px] xl:min-w-[200px] p-3 md:p-4 border-l border-border"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePageClient;
