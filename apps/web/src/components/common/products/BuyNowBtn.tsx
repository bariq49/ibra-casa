"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Product } from "@/components/common/products/ProductCard";
import { toast } from "sonner";
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
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
  const pTitle = (product as { name?: string }).name || product.title;

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const req = addToCart(product, 1);
      if (req) await req;
      router.push("/cart");
    } catch {
      toast.error(`Failed to buy ${pTitle}`);
    }
  };

  const isBeauty = variant === "beauty";
  const isGrocery = variant === "grocery";

  return (
    <button
      type="button"
      onClick={handleBuyNow}
      className={cn(
        "w-full flex items-center justify-center gap-2 font-semibold transition-all duration-300 active:scale-[0.98] whitespace-nowrap",
        isBeauty &&
          "h-[44px] rounded-full bg-warning-light hover:bg-warning text-light-primary-text shadow-color-warning font-dm-sans text-[14px]",
        isGrocery &&
          "h-11 rounded-full bg-warning-light hover:bg-warning text-[#212B36] text-[14px] shadow-sm",
        !isBeauty &&
          !isGrocery &&
          "h-11 px-[22px] rounded-[100px] bg-warning-light hover:bg-warning text-foreground shadow-color-warning font-['DM_Sans',sans-serif] text-[16px] leading-[26px]",
        className,
      )}
      aria-label="Buy now"
    >
      <Zap className="size-5 shrink-0 fill-current opacity-90" />
      <span>Buy Now</span>
    </button>
  );
};

export default BuyNowBtn;
