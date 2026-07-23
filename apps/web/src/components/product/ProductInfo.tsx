"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SizeChartSidebar from "./SizeChartSidebar";
import { Share2, GitCompare, Minus, Plus, ShoppingCart } from "lucide-react";
import Ratings from "../common/products/Ratings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import WishlistBtn from "../common/products/WishlistBtn";
import PriceFormatter from "../common/products/PriceFormatter";
import { FullProduct, ProductVariantOption } from "@/hooks/useProductBySlug";
import { useCartStore } from "@/store/useCartStore";
import { useCompareStore } from "@/store/useCompareStore";
import { calculateVariantPrice } from "@/lib/priceUtils";
import { toast } from "sonner";

interface ProductInfoProps {
  product: FullProduct;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<ProductVariantOption | null>(
    product.colors?.[0] || null,
  );
  const [selectedSize, setSelectedSize] = useState<ProductVariantOption | null>(
    product.sizes?.[0] || null,
  );
  const [selectedWeight, setSelectedWeight] = useState<ProductVariantOption | null>(
    product.weights?.[0] || null,
  );
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  const variantPricing = useMemo(
    () =>
      calculateVariantPrice(product.price, product.discountPercentage || 0, {
        size: selectedSize,
        color: selectedColor,
        weight: selectedWeight,
      }),
    [
      product.price,
      product.discountPercentage,
      selectedSize,
      selectedColor,
      selectedWeight,
    ],
  );

  const addToCompare = useCompareStore((state) => state.addToCompare);
  const removeFromCompare = useCompareStore((state) => state.removeFromCompare);
  const compareItems = useCompareStore((state) => state.compareItems);
  const isCompared = compareItems.some(
    (item) => (item.id || item._id) === product._id,
  );

  const cartProduct = useMemo(
    () => ({
      id: product._id,
      title: product.name,
      rating: product.numReviews || 0,
      stars: product.averageRating || 0,
      currentPrice: variantPricing.discountedPrice,
      oldPrice: variantPricing.originalPrice,
      discount: variantPricing.discountPercentage,
      image: product.image,
      slug: product.slug,
      price: variantPricing.originalPrice,
    }),
    [product, variantPricing],
  );

  const incrementQty = () => {
    if (quantity >= (product.stock || Infinity)) {
      toast.error("Cannot add more than available stock quantity.");
      return;
    }
    setQuantity((prev) => prev + 1);
  };
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleCompare = () => {
    if (isCompared) {
      removeFromCompare(product._id);
      toast.info(`${product.name} removed from compare`);
    } else {
      addToCompare(cartProduct);
      toast.success(`${product.name} added to compare`);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ url });
        toast.success("Shared successfully");
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch (error: unknown) {
      if ((error as { name?: string }).name !== "AbortError") {
        toast.error("Failed to share");
      }
    }
  };

  const hasDiscount =
    variantPricing.discountPercentage > 0 &&
    variantPricing.originalPrice > variantPricing.discountedPrice;

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="bg-white border border-light-divider border-solid flex flex-col gap-3 items-start p-5 rounded-3xl w-full">
      {/* Title & Badge */}
      <div className="flex flex-col gap-2 items-start w-full">
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex gap-2.5 items-center min-h-8">
            {hasDiscount && (
              <div className="flex justify-center items-center bg-warning-lighter px-2 py-0.5 rounded-sm">
                <span className="font-medium text-[14px] text-black">SALES</span>
              </div>
            )}
            {product.isNewItem && (
              <p className="font-bold text-[12px] text-info uppercase">
                New Arrival
              </p>
            )}
          </div>
          <div className="shrink-0">
            <WishlistBtn product={cartProduct} />
          </div>
        </div>

        <h1 className="font-bold text-[28px] overflow-hidden text-light-primary-text leading-9">
          {product.name}
        </h1>

        <div className="flex items-center gap-3">
          <Ratings
            rating={product.averageRating || 0}
            totalReviews={product.numReviews || 0}
          />
          <p className="text-light-secondary-text text-[14px]">
            ({((product.numReviews || 0) / 1000).toFixed(2)}k reviews)
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <p className="font-bold text-[22px] text-light-primary-text">
            <PriceFormatter amount={variantPricing.discountedPrice} />
          </p>
          {hasDiscount && (
            <>
              <div className="w-px h-5 bg-light-disabled-text/20" />
              <p className="font-normal text-[20px] text-light-disabled-text line-through">
                <PriceFormatter amount={variantPricing.originalPrice} />
              </p>
              <div className="flex justify-center items-center bg-warning px-2 py-0.5 rounded-sm">
                <span className="font-medium text-[13px] text-black">
                  {variantPricing.discountPercentage}% OFF
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-dashed border-light-disabled-text/30 w-full" />

      {product.colors && product.colors.length > 0 && (
        <div className="flex flex-col gap-2 w-full items-start">
          <div className="flex items-center gap-2 text-[15px]">
            <p className="font-semibold text-light-primary-text">Color :</p>
            <p className="text-light-primary-text">{selectedColor?.name}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {product.colors.map((color) => (
              <button
                key={color.slug || color.name}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "size-9 rounded-full border-2 p-0.5 transition-all flex items-center justify-center bg-white",
                  selectedColor?.slug === color.slug ||
                    selectedColor?.name === color.name
                    ? "border-sellzy-teal"
                    : "border-transparent",
                )}
              >
                <div
                  className="w-full h-full rounded-full border border-border"
                  style={{ backgroundColor: color.value }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {product.sizes && product.sizes.length > 0 && (
        <div className="flex flex-col gap-2 w-full items-start">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-[15px]">
              <p className="font-semibold text-light-primary-text">Size :</p>
              <p className="text-light-primary-text">{selectedSize?.name}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsSizeChartOpen(true)}
              className="text-[13px] text-light-secondary-text underline hover:text-light-primary-text"
            >
              See size chart
            </button>
          </div>
          <div className="flex flex-wrap gap-2 w-full">
            <TooltipProvider delayDuration={200}>
              {product.sizes.map((size) => {
                const initials = size.name.split(" ")[0];
                const isSelected =
                  selectedSize?.slug === size.slug ||
                  selectedSize?.name === size.name;
                return (
                  <Tooltip key={size.slug || size.name}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "flex-1 h-9 min-w-17.5 rounded-[100px] font-semibold text-[14px] transition-all flex items-center justify-center",
                          isSelected
                            ? "bg-sellzy-teal text-foreground shadow-color-primary border-transparent"
                            : "border border-[rgba(145,158,171,0.32)] text-light-primary-text hover:bg-muted bg-white",
                        )}
                      >
                        {initials}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground border-border text-sm px-3 py-1.5 rounded-md">
                      {size.name}
                      {(size.priceModifier ?? 0) !== 0 && (
                        <span className="ml-1 text-muted-foreground">
                          ({size.priceModifier! > 0 ? "+" : ""}
                          {size.priceModifier})
                        </span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>
        </div>
      )}

      {product.weights && product.weights.length > 0 && (
        <div className="flex flex-col gap-2 w-full items-start">
          <div className="flex items-center gap-2 text-[15px]">
            <p className="font-semibold text-light-primary-text">Weight :</p>
            <p className="text-light-primary-text">{selectedWeight?.name}</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full">
            {product.weights.map((weight) => {
              const isSelected =
                selectedWeight?.slug === weight.slug ||
                selectedWeight?.name === weight.name;
              return (
                <button
                  key={weight.slug || weight.name}
                  type="button"
                  onClick={() => setSelectedWeight(weight)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 font-semibold text-[14px] transition-all",
                    isSelected
                      ? "bg-sellzy-teal text-foreground border-transparent"
                      : "border border-[rgba(145,158,171,0.32)] text-light-primary-text hover:bg-muted bg-white",
                  )}
                >
                  {weight.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 w-full items-start">
        <p className="font-semibold text-[15px] text-light-primary-text">
          Quantity
        </p>
        <div className="flex xl:flex-row flex-col items-start gap-3 w-full">
          <div className="border border-[rgba(145,158,171,0.32)] flex items-center justify-between px-4 py-2.5 rounded-[80px] w-full sm:w-40 h-11 bg-white">
            <button
              type="button"
              onClick={decrementQty}
              className="hover:text-primary transition-colors text-light-primary-text"
            >
              <Minus className="size-5" />
            </button>
            <span className="font-semibold text-[16px] text-light-primary-text">
              {quantity}
            </span>
            <button
              type="button"
              onClick={incrementQty}
              className="hover:text-primary transition-colors text-light-primary-text"
            >
              <Plus className="size-5" />
            </button>
          </div>
          <div className="flex sm:flex-row flex-col items-center gap-3 w-full flex-1">
            <Button
              onClick={() => {
                const req = useCartStore
                  .getState()
                  .addToCart(
                    cartProduct,
                    quantity,
                    selectedColor,
                    selectedSize,
                  );
                if (req) {
                  toast.promise(req, {
                    loading: `Preparing ${product.name}...`,
                    success: () => {
                      router.push("/cart");
                      return `${product.name} ready for checkout`;
                    },
                    error: `Failed to buy ${product.name}`,
                  });
                } else {
                  router.push("/cart");
                }
              }}
              className="w-full sm:flex-1 h-11 rounded-[80px] bg-warning hover:bg-warning/90 text-foreground font-semibold text-[15px] shadow-color-warning border-none"
            >
              Buy Now
            </Button>
            <Button
              onClick={() => {
                const req = useCartStore
                  .getState()
                  .addToCart(
                    cartProduct,
                    quantity,
                    selectedColor,
                    selectedSize,
                  );
                if (req) {
                  toast.promise(req, {
                    loading: `Adding ${product.name} to cart...`,
                    success: `${product.name} added to cart`,
                    error: `Failed to add ${product.name} to cart`,
                    action: {
                      label: "View Cart",
                      onClick: () => {
                        import("@/store/useHeaderStore").then((mod) =>
                          mod.useHeaderStore.getState().onCartOpen(),
                        );
                      },
                    },
                  });
                }
              }}
              className="w-full sm:flex-1 h-11 rounded-[80px] bg-sellzy-teal hover:bg-primary text-foreground hover:text-primary-foreground font-semibold text-[15px] gap-2 shadow-color-primary border-none"
            >
              <ShoppingCart className="size-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-light-disabled-text/30 w-full" />

      <div className="flex items-center gap-4 w-full">
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 text-light-primary-text hover:text-primary transition-colors"
        >
          <Share2 className="size-4" />
          <span className="text-[15px]">Share</span>
        </button>
        <div className="w-px h-3 bg-[rgba(145,158,171,0.24)]" />
        <button
          type="button"
          onClick={handleCompare}
          className={cn(
            "flex items-center gap-2 transition-colors",
            isCompared
              ? "text-primary"
              : "text-light-primary-text hover:text-primary",
          )}
        >
          <GitCompare className="size-4" />
          <span className="text-[15px]">
            {isCompared ? "Remove from Compare" : "Compare"}
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-1.5 w-full text-[14px]">
        <div className="flex items-start gap-3 w-full">
          <p className="font-semibold text-light-primary-text w-28 shrink-0">
            Free Shipping :
          </p>
          <p className="text-light-secondary-text">
            Estimated Delivery Time 5-7 Days
          </p>
        </div>
        <div className="flex items-start gap-3 w-full">
          <p className="font-semibold text-light-primary-text w-28 shrink-0">
            Categories :
          </p>
          <p className="text-light-secondary-text">
            {product.category?.name ||
              product.categories?.map((c) => c.name).join(", ") ||
              "N/A"}
          </p>
        </div>
      </div>
      </div>

      <div className="w-full px-1">
        <img
          src="/images/payment-methods.png"
          alt="Payment Methods"
          className="block w-full h-12"
        />
      </div>

      <SizeChartSidebar
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={product.category?.name || "General"}
      />
    </div>
  );
};

export default ProductInfo;
