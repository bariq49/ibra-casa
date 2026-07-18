"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { Trash2, Heart, ShoppingCart } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import PriceFormatter from "../common/products/PriceFormatter";
import Ratings from "../common/products/Ratings";
import AddToCartBtn from "../common/products/AddToCartBtn";
import { calculateProductPrice } from "@/lib/priceUtils";

export function WishlistClient({
  title = "Product Wishlist",
}: {
  title?: string;
}) {
  const router = useRouter();
  const { wishlistItems, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  // Local state for selected items via checkbox
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(
    new Set(),
  );

  const toggleSelection = (id: string | number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedItems.size === wishlistItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(wishlistItems.map((item) => (item.id || item._id)!)));
    }
  };

  const handleBuyNow = (product: any) => {
    addToCart(product, 1);
    router.push("/cart");
  };

  const handleAddSelectedToCart = () => {
    wishlistItems.forEach((product) => {
      if (selectedItems.has((product.id || product._id)!)) {
        addToCart(product, 1);
      }
    });
    // Optional: could un-select them or remove them from wishlist after adding
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-border/50 py-16 gap-6 shadow-sm">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <Heart className="w-12 h-12 text-primary fill-primary/20" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-urbanist text-light-primary-text">
            Your Wishlist is Empty
          </h2>
          <p className="text-light-secondary-text font-dm-sans">
            Looks like you haven't added anything to your wishlist yet.
            <br />
            Explore our products and find something you love!
          </p>
        </div>
        <Link
          href="/"
          className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[32px] w-full animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h1 className="text-light-primary-text font-urbanist text-[24px] sm:text-[32px] font-bold leading-tight">
          {title}
        </h1>
        <div className="flex items-center gap-[24px]">
          <span className="text-light-primary-text font-dm-sans font-semibold text-[16px]">
            {selectedItems.size} items is selected
          </span>
          <button
            disabled={selectedItems.size === 0}
            onClick={handleAddSelectedToCart}
            className="flex items-center justify-center gap-[8px] h-[48px] px-[24px] rounded-[80px] bg-primary shadow-color-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            <ShoppingCart className="w-[20px] h-[20px]" />
            <span className="font-semibold text-[15px]">Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white rounded-[16px] border border-border/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-light-bg border-b border-border/50">
                <th className="p-4 w-[400px]">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.size === wishlistItems.length &&
                        wishlistItems.length > 0
                      }
                      onChange={toggleAll}
                      className="size-[18px] rounded-[4px] border-light-divider text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="font-dm-sans font-semibold text-[14px] leading-[22px] text-light-secondary-text uppercase">
                      Product
                    </span>
                  </div>
                </th>
                <th className="p-4">
                  <span className="font-dm-sans font-semibold text-[14px] leading-[22px] text-light-secondary-text uppercase">
                    Stock Status
                  </span>
                </th>
                <th className="p-4">
                  <span className="font-dm-sans font-semibold text-[14px] leading-[22px] text-light-secondary-text uppercase">
                    Price
                  </span>
                </th>
                <th className="p-4">
                  <span className="font-dm-sans font-semibold text-[14px] leading-[22px] text-light-secondary-text uppercase">
                    Buy Action
                  </span>
                </th>
                <th className="p-4 text-center">
                  <span className="font-dm-sans font-semibold text-[14px] leading-[22px] text-light-secondary-text uppercase">
                    Remove
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {wishlistItems.map((item, idx) => {
                const { originalPrice, discountedPrice } =
                  calculateProductPrice(item);
                return (
                  <tr
                    key={item?._id}
                    className={`border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors ${selectedItems.has((item.id || item._id)!) ? "bg-primary/5" : ""}`}
                  >
                    {/* 1. Product Details */}
                    <td className="p-4">
                      <div className="flex gap-4 items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.has((item.id || item._id)!)}
                          onChange={() => toggleSelection((item.id || item._id)!)}
                          className="size-[18px] rounded-[4px] border-light-divider text-primary focus:ring-primary cursor-pointer shrink-0"
                        />
                        <div className="relative size-[100px] bg-muted/30 rounded-[8px] overflow-hidden shrink-0 flex items-center justify-center p-2">
                          <Image
                            src={item.image || "/placeholder.jpg"}
                            alt={item.title || "Product image"}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <Link
                            href={`/product/${item.slug || item.id}`}
                            className="font-dm-sans font-semibold text-[16px] leading-[24px] text-light-primary-text hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.title}
                          </Link>

                          <p className="font-dm-sans text-[14px] leading-[22px] text-success">
                            {(item.category as any)?.name ||
                              (item as any).productType?.name ||
                              (typeof item.category === "string"
                                ? item.category
                                : "General")}
                          </p>

                          <div className="flex items-center gap-1 mt-1">
                            <Ratings
                              rating={item.stars || item.rating || 5}
                              totalReviews={0}
                              iconClassName="w-[14px] h-[14px]"
                            />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Stock Status */}
                    <td className="p-4 align-middle">
                      <span className="font-dm-sans font-semibold text-[16px] text-light-primary-text">
                        {item.available || 10} in stock
                      </span>
                    </td>

                    {/* 3. Price */}
                    <td className="p-4 align-middle">
                      <div className="flex gap-2 items-center">
                        <span className="font-bold text-light-primary-text">
                          <PriceFormatter amount={discountedPrice} />
                        </span>
                        {originalPrice > discountedPrice && (
                          <span className="text-gray-400 line-through">
                            <PriceFormatter amount={originalPrice} />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Buy Action */}
                    <td className="p-4 align-middle">
                      <div className="flex flex-row items-center gap-[8px] xl:gap-[12px]">
                        <button
                          onClick={() => handleBuyNow(item)}
                          className="h-[44px] w-[130px] rounded-[80px] bg-warning hover:bg-warning/90 transition-colors text-light-primary-text font-bold text-[14px] font-urbanist whitespace-nowrap hidden xl:block"
                        >
                          Buy Now
                        </button>
                        <div className="w-[130px] flex-none">
                          <AddToCartBtn
                            product={item}
                            variant="beauty"
                            className="w-full text-[14px]"
                            boxClassName="w-full h-full"
                          />
                        </div>
                      </div>
                    </td>

                    {/* 6. Remove Action */}
                    <td className="p-4 align-middle text-center">
                      <button
                        onClick={() => toggleWishlist(item)}
                        className="text-light-disabled-text hover:text-red-500 transition-colors mx-auto p-2 rounded-full hover:bg-red-50"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
