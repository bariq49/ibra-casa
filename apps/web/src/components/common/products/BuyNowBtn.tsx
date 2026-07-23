"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Product } from "@/components/common/products/ProductCard";
import { cn } from "@/lib/utils";

interface BuyNowBtnProps {
  product: Product;
  variant?: "default" | "beauty" | "grocery";
  className?: string;
}

const BuyNowBtn = ({
  product,
  variant = "default",
  className,
}: BuyNowBtnProps) => {
  const pSlug = (product as { slug?: string }).slug;
  const href = pSlug ? `/product/${pSlug}` : "/shop";

  const isBeauty = variant === "beauty";
  const isGrocery = variant === "grocery";

  return (
    <Link
      href={href}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 font-semibold transition-all duration-300 active:scale-[0.98] whitespace-nowrap w-full",
        isBeauty &&
          "h-[44px] rounded-full bg-primary hover:bg-primary-dark text-white shadow-color-primary font-dm-sans text-[14px]",
        isGrocery &&
          "h-11 rounded-full bg-primary-light hover:bg-primary hover:text-primary-foreground text-[#212B36] text-[14px] shadow-sm",
        !isBeauty &&
          !isGrocery &&
          "h-11 px-[22px] rounded-[100px] bg-primary-light hover:bg-primary hover:text-primary-foreground text-foreground shadow-color-primary font-['DM_Sans',sans-serif] text-[16px] leading-[26px]",
        className,
      )}
      aria-label="Buy now"
    >
      <ShoppingCart className="size-5 shrink-0" />
      <span>Buy Now</span>
    </Link>
  );
};

export default BuyNowBtn;
