/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, RefreshCw, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Ratings from "./Ratings";
import AddToCartBtn from "./AddToCartBtn";
import BuyNowBtn from "./BuyNowBtn";
import WishlistBtn from "./WishlistBtn";
import PriceFormatter from "./PriceFormatter";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCompareStore } from "@/store/useCompareStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { calculateProductPrice } from "@/lib/priceUtils";

export interface Product {
  id?: string | number;
  _id?: string | number;
  title?: string;
  name?: string;
  rating?: number; // Count of reviews
  stars?: number; // Rating value usually 0-5
  currentPrice?: number;
  oldPrice?: number;
  discount?: number;
  image?: string;
  images?: string[];
  bg?: string;
  slug: string;
  category?: string | { name: string; slug?: string };
  productType?: { name: string; slug?: string };
  averageRating?: number;
  numReviews?: number;
  stock?: number;
  purchasedQuantity?: number;
  baseQty?: number;
  sold?: number;
  available?: number;
  description?: string;
  brand?: string | { name: string; slug?: string; _id?: string };
  colors?: { name: string; value: string; slug: string; _id?: string }[];
  sizes?: { name: string; value: string; slug: string; _id?: string }[];
}

export interface ProductCardProps {
  product: Product;
  variant?: "default" | "horizontal" | "beauty" | "grocery";
}

const ProductCard = ({
  product,
  variant = "default",
}: ProductCardProps) => {
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const addToCompare = useCompareStore((state) => state.addToCompare);
  const removeFromCompare = useCompareStore((state) => state.removeFromCompare);
  const compareItems = useCompareStore((state) => state.compareItems);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);



  const pId = product._id || product.id;
  const pTitle = product.name || product.title || "Product";
  const pImage = product.image || product.images?.[0] || "/images/placeholder.png";
  const pSlug = product.slug;
  const pCategory =
    (typeof product.category === 'object' ? product.category?.name : product.category) ||
    product.productType?.name ||
    "General";
  const pStars = product.averageRating || product.stars || 0;
  const pRating = product.numReviews || product.rating || 0;
  const pBg = product.bg || "#F4F3F5";

  // Use Global Price Utility
  const { originalPrice, discountedPrice, discountPercentage } =
    calculateProductPrice(product);
  const discountBadgeContent =
    discountPercentage > 0 ? `-${discountPercentage}%` : "Sale";

  const isWishlisted =
    isMounted && wishlistItems.some((item) => (item.id || item._id) === pId);
  const isCompared =
    isMounted && compareItems.some((item) => (item.id || item._id) === pId);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (!isWishlisted) {
      toast.success(`${pTitle} added to wishlist`);
    } else {
      toast.info(`${pTitle} removed from wishlist`);
    }
  };

  const handleCompareMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(pId!);
      toast.info(`${pTitle} removed from compare`);
    } else {
      addToCompare(product);
    }
  };

  if (variant === "horizontal") {
    return (
      <div className="bg-card border border-border border-solid rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 group hover:border-light-border-strong hover:shadow-sm transition-all duration-300 w-full relative">
        {/* Product Image */}
        <div
          className="relative w-full sm:w-65 h-65 shrink-0 rounded-xl overflow-hidden flex items-center justify-center p-4"
          style={{ backgroundColor: pBg }}
        >
          {discountPercentage > 0 && (
            <div className="absolute top-4 left-4 bg-error rounded-sm px-2 h-5.5 flex items-center justify-center z-10 shadow-sm">
              <span className="font-dm-sans font-medium text-warning-lighter text-[12px] leading-5.5">
                {discountPercentage}% OFF
              </span>
            </div>
          )}
          <Link
            href={`/product/${pSlug}`}
            className="w-full h-full relative flex items-center justify-center"
          >
            <Image
              src={pImage}
              alt={pTitle}
              width={200}
              height={200}
              className="object-contain group-hover:scale-110 transition-transform duration-500 max-h-55"
            />
          </Link>
        </div>

        {/* Product Details right side */}
        <div className="flex-1 min-w-0 flex flex-col justify-center h-full gap-4 py-2.5">
          <div className="flex flex-col gap-2">
            <p className="font-dm-sans font-medium text-light-secondary-text text-[14px] leading-6">
              {pCategory}
            </p>

            <Link
              href={`/product/${pSlug}`}
              className="font-Urbanist font-bold text-light-primary-text text-[20px] leading-7.5 line-clamp-2 hover:text-primary transition-colors"
            >
              {pTitle}
            </Link>

            <div className="flex items-center gap-1 mt-1">
              <Ratings rating={pStars} totalReviews={0} />
              <span className="font-dm-sans font-normal text-light-secondary-text text-[14px] leading-6 ml-1">
                ({pRating} Reviews)
              </span>
            </div>
          </div>

          <p className="font-dm-sans font-normal text-light-secondary-text text-[16px] leading-6.5 line-clamp-2 max-w-125">
            {/* Minimal mock description if none provided */}
            Experience premium quality with this exquisite product, designed to
            meet your daily needs with style and durability.
          </p>

          <div className="flex items-baseline gap-3 mt-2">
            <span className="font-Urbanist font-bold text-primary text-[24px] leading-9">
              <PriceFormatter
                amount={discountedPrice}
                className="text-[18px]"
              />
            </span>
            {originalPrice > discountedPrice && (
              <span className="text-[14px] text-light-secondary-text line-through opacity-70 flex items-center font-urbanist">
                <PriceFormatter amount={originalPrice} />
              </span>
            )}
          </div>

          <div className="flex gap-4 items-center mt-2">
            <WishlistBtn product={product} />
            <AddToCartBtn product={product} />
          </div>
          <BuyNowBtn product={product} className="mt-3" />
        </div>
      </div>
    );
  }

  if (variant === "beauty") {
    return (
      <div className="bg-white border border-gray-300 border-solid flex flex-col items-start overflow-hidden relative rounded-2xl w-full h-full group transition-shadow duration-300 hover:shadow-md">
        {/* Cover Image Section */}
        <div
          className="relative shrink-0 w-full h-55 sm:h-65 md:h-75 overflow-hidden"
          style={{ backgroundColor: pBg }}
        >
          <Link
            href={`/product/${pSlug}`}
            className="relative w-full h-full block"
          >
            <Image
              src={pImage}
              alt={pTitle}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
            />
          </Link>
        </div>

        {/* Content Section */}
        <div className="flex flex-col items-start p-4 relative shrink-0 w-full grow">
          <div className="flex flex-col gap-1.5 w-full">
            <Link
              href={`/product/${pSlug}`}
              className="font-Urbanist font-bold leading-6 relative shrink-0 text-light-primary-text text-[18px] line-clamp-1 hover:text-primary transition-colors"
            >
              {pTitle}
            </Link>

            <div className="flex items-center overflow-hidden relative shrink-0 gap-1">
              <Ratings rating={pStars} totalReviews={0} />
              <p className="font-['DM_Sans',sans-serif] font-normal leading-5.5 relative shrink-0 text-light-secondary-text text-[14px]">
                ({pRating})
              </p>
            </div>

            <div className="flex flex-col gap-2 items-start relative shrink-0 w-full mt-1">
              <div className="flex gap-3 items-start leading-7.5 relative shrink-0 text-[20px] whitespace-nowrap flex-wrap">
                <p className="font-Urbanist font-bold relative shrink-0 text-light-primary-text">
                  <PriceFormatter amount={discountedPrice} />
                </p>
                {discountPercentage > 0 && (
                  <>
                    <p className="font-Urbanist font-medium line-through relative shrink-0 text-[#919EAB]">
                      <PriceFormatter amount={originalPrice} />
                    </p>
                    <p className="font-Urbanist font-medium relative shrink-0 text-[#FF5630]">
                      {discountPercentage}% OFF
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 relative shrink-0 w-full mt-auto pt-4">
            <div className="flex gap-4 items-end w-full">
              <WishlistBtn product={product} />
              <AddToCartBtn product={product} variant="beauty" />
            </div>
            <BuyNowBtn product={product} variant="beauty" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "grocery") {
    const rawStock = product.stock ?? product.available ?? 0;
    const calculatedSold =
      product.sold ?? Math.max(0, (product.purchasedQuantity || 0) - rawStock);
    const baseQuantity = product.baseQty ?? rawStock + calculatedSold;
    const progressPercent = Math.min(
      (calculatedSold / (baseQuantity || 1)) * 100,
      100,
    );

    return (
      <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-start overflow-hidden relative w-full h-full group transition-shadow duration-300 hover:shadow-lg p-4 xs:p-5">
        {/* Image Block */}
        <div
          className="relative shrink-0 w-full aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden flex items-center justify-center p-4 mb-5"
          style={{ backgroundColor: pBg }}
        >
          <Link
            href={`/product/${pSlug}`}
            className="relative w-full h-full flex items-center justify-center"
          >
            <Image
              src={pImage}
              alt={pTitle}
              fill
              className="object-contain hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </Link>
        </div>

        {/* Details Block */}
        <div className="flex flex-col flex-1 w-full relative">
          {discountPercentage > 0 && (
            <div className="w-fit relative flex items-center justify-center h-5.5 pl-2 pr-3 mb-3">
              <div
                className="absolute inset-0 bg-[#CB0233]"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 92% 16%, 100% 33%, 92% 50%, 100% 66%, 92% 83%, 100% 100%, 0 100%)",
                }}
              />
              <span className="relative z-10 text-[#FFF7CD] text-[12px] font-['DM_Sans',sans-serif] font-medium leading-5.5 tracking-wide">
                SALES
              </span>
            </div>
          )}

          <p className="font-['DM_Sans',sans-serif] font-normal text-[#637381] text-[13px] leading-5.5 mb-1 line-clamp-1">
            {pCategory}
          </p>

          <Link
            href={`/product/${pSlug}`}
            className="font-Urbanist font-bold text-[#212B36] text-[15px] sm:text-[16px] leading-6 mb-2 line-clamp-1 hover:text-[#0A6C36] transition-colors"
          >
            {pTitle}
          </Link>

          {/* Pricing */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span className="font-Urbanist font-bold text-[#212B36] text-[16px]">
              <PriceFormatter amount={discountedPrice} />
            </span>
            {originalPrice > discountedPrice && (
              <>
                <span className="font-urbanist font-medium text-[16px] text-[#A6ADA6] line-through">
                  <PriceFormatter amount={originalPrice} />
                </span>
                <span className="font-Urbanist font-bold text-[#FF5630] text-[12px]">
                  {discountPercentage}% OFF
                </span>
              </>
            )}
          </div>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mb-5">
            <Ratings rating={pStars} totalReviews={0} />
          </div>

          {/* Progress Bar Layer */}
          <div className="w-full flex-1 flex flex-col justify-end">
            <div className="w-full bg-[#FFE4C4] h-1.5 rounded-full mb-3 relative overflow-hidden">
              <div
                className="h-full bg-[#FFB01D] absolute top-0 left-0 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[#637381] font-['DM_Sans',sans-serif] text-[13px] mb-5">
              <span>
                Sold: &nbsp;
                <strong className="text-[#212B36] font-medium">
                  {calculatedSold}
                </strong>
              </span>
              <span>
                Available: &nbsp;
                <strong className="text-[#212B36] font-medium">
                  {rawStock}
                </strong>
              </span>
            </div>

            {/* Actions Row using component APIs */}
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center gap-3 w-full">
                <WishlistBtn product={product} variant="grocery" />
                <AddToCartBtn product={product} variant="grocery" />
              </div>
              <BuyNowBtn product={product} variant="grocery" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Variant
  return (
    <div className="border border-gray-300 rounded-2xl p-4 group hover:shadow-lg transition-shadow duration-300 bg-card h-full w-full flex flex-col justify-between">
      <div className="relative">
        <div
          className="rounded-xl mb-4 overflow-hidden relative aspect-square flex items-center justify-center"
          style={{ backgroundColor: pBg }}
        >
          <Link
            href={`/product/${pSlug}`}
            className="w-full h-full relative block"
          >
            <Image
              src={pImage}
              alt={pTitle}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="group-hover:scale-110 object-cover hoverEffect"
            />
          </Link>
        </div>
        {discountPercentage > 0 && (
          <Badge className="absolute top-2 left-2 z-10 bg-[#FF5555] hover:bg-[#FF5555]/90 text-white border-none text-[12px] font-dm-sans px-2 py-0.5 pointer-events-none shadow-sm rounded-full">
            {discountBadgeContent} off
          </Badge>
        )}
        <div className="absolute bottom-0 right-0 left-0 flex justify-center z-10 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 group-hover:bottom-3">
          <ul className="flex items-center gap-x-px">
            <li>
              <button
                onClick={handleWishlistToggle}
                aria-label="Add to Wishlist"
                className={cn(
                  "relative size-11 inline-flex items-center justify-center rounded-tl-sm rounded-bl-sm transition-colors group/wishlist",
                  isWishlisted
                    ? "bg-error text-white"
                    : "bg-card text-gray-600 hover:bg-error hover:text-white",
                )}
              >
                <Heart
                  className={cn(
                    "size-5 transition-colors",
                    isWishlisted
                      ? "fill-white"
                      : "group-hover/wishlist:fill-white",
                  )}
                />
              </button>
            </li>
            <li>
              <button
                onClick={handleCompareMessage}
                aria-label="Compare"
                className={cn(
                  "relative size-11 inline-flex items-center justify-center transition-colors group/compare",
                  isCompared
                    ? "bg-primary text-white"
                    : "bg-card text-gray-600 hover:bg-primary hover:text-white",
                )}
              >
                <RefreshCw
                  className={cn(
                    "size-5 transition-colors",
                    isCompared
                      ? "text-white"
                      : "group-hover/compare:text-white",
                  )}
                />
              </button>
            </li>
            <li>
              <Link
                aria-label="Quick view"
                className="relative size-11 bg-card inline-flex items-center justify-center rounded-tr-sm rounded-br-sm hover:bg-gray-100 transition-colors"
                href={`/product/${pSlug}`}
              >
                <Eye className="size-5 text-gray-600" />
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-2">
        <h5 className="text-base leading-6 font-semibold font-dm-sans mb-1.5 line-clamp-1">
          <Link
            href={`/product/${pSlug}`}
            className="hover:text-primary hoverEffect font-medium"
          >
            {pTitle}
          </Link>
        </h5>
        <Ratings className="mb-3" rating={pStars} totalReviews={pRating} />
        <div className="flex items-center gap-x-3 mb-2">
          <span className="text-base font-semibold text-primary">
            <PriceFormatter amount={discountedPrice} />
          </span>
          {originalPrice > discountedPrice && (
            <span className="text-sm leading-5.5 font-normal text-muted-foreground line-through">
              <PriceFormatter amount={originalPrice} />
            </span>
          )}
          {discountPercentage > 0 && originalPrice > discountedPrice && (
            <span className="text-xs leading-5.5 font-semibold text-error uppercase">
              {discountPercentage}% Off
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <WishlistBtn product={product} />
            <AddToCartBtn product={product} />
          </div>
          <BuyNowBtn product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
