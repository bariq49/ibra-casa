/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import {
  ChevronRight,
  Home,
  Minus,
  Plus,
  Trash2,
  Heart,
  X,
  ArrowRight,
  Truck,
} from "lucide-react";
import Ratings from "@/components/common/products/Ratings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PriceFormatter from "@/components/common/products/PriceFormatter";
import { calculateProductPrice, calculateVariantPrice } from "@/lib/priceUtils";
import {
  useCartTotalsFromStore,
  useStorePricingOptions,
} from "@/hooks/useStorePricing";

const CartClient = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } =
    useCartStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [coupon, setCoupon] = useState("");
  const storePricing = useStorePricingOptions();
  const {
    subtotalDiscounted,
    totalDiscount,
    vatPercentage,
    taxAmount,
    shippingCost,
    totalPayable,
  } = useCartTotalsFromStore(cartItems);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const freeShippingThreshold = storePricing.freeDeliveryThreshold ?? 999;
  const qualifiesForFreeShipping =
    freeShippingThreshold > 0 && subtotalDiscounted >= freeShippingThreshold;
  const amountUntilFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotalDiscounted,
  );

  return (
    <div className=" py-8 md:py-12">
      <div className="breadcrumb hidden md:block">
        <div className="flex items-center gap-1 sm:gap-2 text-sm text-muted-foreground pb-4 mb-6 md:mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            <Home className="size-4" />
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground font-medium">Pages</span>
          <ChevronRight className="size-4" />
          <span className="text-foreground font-medium">Cart Page</span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-background border border-border rounded-[16px] w-full mx-auto">
          <div className="bg-muted size-24 rounded-full flex items-center justify-center mb-6">
            <svg
              className="size-12 text-light-disabled-text"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="font-urbanist font-bold text-[24px] leading-tight mb-2 text-light-primary-text">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground mb-8 text-center max-w-sm">
            Looks like you haven't added anything to your cart yet. Browse our
            products and find something you love.
          </p>
          <Link
            href="/shop"
            className="h-[48px] px-8 bg-primary hover:bg-primary-dark text-white font-dm-sans font-semibold text-[16px] rounded-[80px] shadow-sm transition-all flex items-center justify-center gap-2 group"
          >
            Go back to shopping
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start relative w-full">
          {/* Left Side: Cart Items Table */}
          <div className="w-full lg:flex-[1_0_0] bg-background border border-border rounded-[16px] overflow-hidden">
            {/* Header Bar */}
            <div className="flex justify-between items-center py-[24px] px-[24px] border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="font-urbanist font-bold text-[20px] leading-[30px] text-light-primary-text">
                  Cart
                </h2>
                <span className="font-dm-sans text-[16px] leading-[24px] text-light-secondary-text">
                  ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})
                </span>
              </div>

              {cartItems.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center gap-1 font-dm-sans font-semibold text-red-600 text-[16px] hover:opacity-80 transition-opacity">
                      <X className="size-5" />
                      Remove All
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Shopping Cart</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove all items from your
                        cart?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearCart}
                        variant="destructive"
                      >
                        Clear Cart
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* Cart Table wrapper handling responsive overflow */}
            <div className="w-full overflow-x-auto rounded-b-[16px]">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="py-4 px-6 font-dm-sans font-semibold text-light-secondary-text text-[16px]">
                      Product
                    </th>
                    <th className="py-4 px-6 font-dm-sans font-semibold text-light-secondary-text text-[16px]">
                      Price
                    </th>
                    <th className="py-4 px-6 font-dm-sans font-semibold text-light-secondary-text text-[16px]">
                      Quantity
                    </th>
                    <th className="py-4 px-6 font-dm-sans font-semibold text-light-secondary-text text-[16px]">
                      Total Price
                    </th>
                    <th className="py-4 px-6 font-dm-sans font-semibold text-light-secondary-text text-[16px] text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems
                    .filter((item) => item?.product)
                    .map((item, idx) => {
                      const product = item.product as any;
                      const basePrice =
                        Number(product.price) ||
                        Number(product.oldPrice) ||
                        Number(product.currentPrice) ||
                        0;
                      const discountPercentage =
                        Number(product.discountPercentage) ||
                        Number(product.discount) ||
                        0;
                      const hasModifiers =
                        item.size?.priceModifier != null ||
                        item.color?.priceModifier != null ||
                        (item as any).weight?.priceModifier != null;
                      const { originalPrice, discountedPrice } = hasModifiers
                        ? calculateVariantPrice(basePrice, discountPercentage, {
                            size: item.size,
                            color: item.color,
                            weight: (item as any).weight,
                          })
                        : calculateProductPrice(item.product);
                      const pStars =
                        (item.product as any).averageRating ||
                        item.product.stars ||
                        0;
                      const pRating =
                        (item.product as any).numReviews ||
                        item.product.rating ||
                        0;

                      return (
                        <tr
                          key={`${item.id}-${idx}`}
                          className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                        >
                          {/* 1. Product Details */}
                          <td className="p-4">
                            <div className="flex gap-4 items-center">
                              <div className="relative size-[116px] bg-muted rounded-[8px] overflow-hidden shrink-0 flex items-center justify-center p-2">
                                <Image
                                  src={
                                    item.product.image ||
                                    (item.product as any).images?.[0] ||
                                    "/images/placeholder.png"
                                  }
                                  alt={
                                    item.product.title ||
                                    (item.product as any).name ||
                                    "Product"
                                  }
                                  fill
                                  className="object-contain p-2"
                                />
                              </div>
                              <div className="flex flex-col gap-2 min-w-0">
                                <Link
                                  href={`/product/${item.product.slug || item.id}`}
                                  className="font-dm-sans font-semibold text-[16px] leading-[24px] text-light-primary-text hover:text-primary transition-colors line-clamp-2"
                                >
                                  {item.product.title ||
                                    (item.product as any).name ||
                                    "Unknown Product"}
                                </Link>

                                <p className="font-dm-sans text-[14px] leading-[22px] text-light-secondary-text">
                                  Category:{" "}
                                  {(item.product.category as any)?.name ||
                                    (typeof item.product.category === "string"
                                      ? item.product.category
                                      : "General")}
                                </p>
                                <p className="font-dm-sans text-[14px] leading-[22px] text-light-secondary-text">
                                  Available: {(item.product as any).stock || 0}
                                </p>

                                <div className="flex items-center gap-1">
                                  <Ratings
                                    rating={pStars}
                                    totalReviews={pRating}
                                    iconClassName="w-4 h-4"
                                  />
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Unit Price */}
                          <td className="p-4 align-middle">
                            <div className="flex gap-3 items-center">
                              <span className="font-dm-sans font-semibold text-[16px] text-light-primary-text">
                                <PriceFormatter amount={discountedPrice} />
                              </span>
                              {originalPrice > discountedPrice && (
                                <span className="font-dm-sans text-[16px] text-light-secondary-text line-through">
                                  <PriceFormatter amount={originalPrice} />
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 3. Quantity Controls */}
                          <td className="p-4 align-middle">
                            <div className="inline-flex items-center justify-between border border-border rounded-[80px] p-2 w-[108px] h-10">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                className="size-[20px] rounded-full flex items-center justify-center hover:bg-muted disabled:opacity-50 text-light-primary-text transition-colors"
                              >
                                <Minus className="size-4" />
                              </button>
                              <span className="font-dm-sans font-semibold text-[16px] text-light-primary-text">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => {
                                  if (
                                    item.quantity >=
                                    ((item.product as any).stock || Infinity)
                                  ) {
                                    toast.error(
                                      "Cannot add more than available stock quantity.",
                                    );
                                    return;
                                  }
                                  updateQuantity(item.id, item.quantity + 1);
                                }}
                                className="size-[20px] rounded-full flex items-center justify-center hover:bg-muted text-light-primary-text transition-colors"
                              >
                                <Plus className="size-4" />
                              </button>
                            </div>
                          </td>

                          {/* 4. Total Price per Item */}
                          <td className="p-4 align-middle">
                            <span className="font-dm-sans font-semibold text-[16px] text-light-primary-text">
                              <PriceFormatter
                                amount={discountedPrice * item.quantity}
                              />
                            </span>
                          </td>

                          {/* 5. Actions */}
                          <td className="p-4 align-middle">
                            <div className="flex items-center justify-center gap-4">
                              <button
                                className="text-light-disabled-text hover:text-red-500 transition-colors"
                                aria-label="Favorite"
                              >
                                <Heart className="size-5 sm:size-6" />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-light-disabled-text hover:text-red-500 transition-colors"
                                aria-label="Delete"
                              >
                                <Trash2 className="size-5 sm:size-6" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Side: Order Summary Panel */}
          <div className="w-full lg:w-[400px] xl:w-[420px] flex flex-col gap-6 bg-background border border-border rounded-[16px] p-6 shrink-0 lg:sticky lg:top-24">
            {/* Shipping Notification Pill */}
            <div className="flex items-center gap-2 bg-primary/10 rounded-full px-4 py-3 border border-transparent">
              <div className="flex items-center justify-center text-light-primary-text">
                <Truck className="size-5 text-primary" />
              </div>
              <p className="font-dm-sans font-bold text-[14px] text-light-primary-text">
                {qualifiesForFreeShipping ? (
                  <>
                    You&apos;ve unlocked{" "}
                    <span className="font-semibold text-primary">
                      free shipping
                    </span>
                  </>
                ) : freeShippingThreshold > 0 ? (
                  <>
                    Spend{" "}
                    <PriceFormatter amount={amountUntilFreeShipping} /> more for{" "}
                    <span className="font-semibold text-primary">
                      free shipping
                    </span>
                  </>
                ) : (
                  <>
                    Standard shipping:{" "}
                    <PriceFormatter amount={shippingCost} />
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-col gap-6 p-6 border border-border rounded-[16px]">
              <h3 className="font-urbanist font-bold text-[20px] leading-[30px] text-light-primary-text">
                Order Summary
              </h3>

              {/* Coupon Code Input */}
              <div className="flex w-full items-center">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 h-[48px] px-4 rounded-l-[80px] border-y border-l border-border outline-none font-dm-sans text-[16px] text-light-primary-text placeholder:text-light-disabled-text focus:border-primary transition-colors"
                  aria-label="Coupon Code"
                />
                <button className="bg-primary hover:bg-primary-dark text-white font-dm-sans font-semibold text-[16px] h-[48px] px-6 rounded-r-[80px] shadow-sm transition-all shrink-0">
                  Apply
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center font-dm-sans text-[16px] text-light-secondary-text">
                  <span>Sub-Total</span>
                  <span className="text-light-primary-text font-medium">
                    <PriceFormatter amount={subtotalDiscounted} />
                  </span>
                </div>
                <div className="flex justify-between items-center font-dm-sans text-[16px] text-light-secondary-text">
                  <span>Discount</span>
                  <span className="text-error font-medium">
                    {totalDiscount > 0 ? (
                      <>
                        -<PriceFormatter amount={totalDiscount} />
                      </>
                    ) : (
                      <PriceFormatter amount={0} />
                    )}
                  </span>
                </div>
                {vatPercentage > 0 && (
                  <div className="flex justify-between items-center font-dm-sans text-[16px] text-light-secondary-text">
                    <span>Tax ({vatPercentage}%)</span>
                    <span className="text-light-primary-text font-medium">
                      <PriceFormatter amount={taxAmount} />
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center font-dm-sans text-[16px] text-light-secondary-text">
                  <span>Shipping</span>
                  <span className="text-light-primary-text font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-primary font-semibold">Free</span>
                    ) : (
                      <PriceFormatter amount={shippingCost} />
                    )}
                  </span>
                </div>
                <div className="h-px w-full bg-border my-1" />
                <div className="flex justify-between items-center font-urbanist font-bold text-[18px] text-light-primary-text">
                  <span>Total</span>
                  <span className="text-light-primary-text text-xl">
                    <PriceFormatter amount={totalPayable} />
                  </span>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer group px-1">
              <input
                type="checkbox"
                className="size-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
              />
              <p className="font-dm-sans text-[14px] text-light-secondary-text">
                I agree with the{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/conditions"
                  className="text-blue-600 hover:underline"
                >
                  conditions
                </Link>
              </p>
            </label>

            {/* Checkout CTAs */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => router.push("/checkout")}
                disabled={!agreed || cartItems.length === 0}
                className="w-full h-[48px] bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:opacity-50 text-white font-dm-sans font-semibold text-[16px] rounded-[80px] shadow-sm transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              >
                Proceed to checkout
              </button>
              <Link
                href="/shop"
                className="w-full h-[48px] bg-background border border-border text-light-primary-text hover:bg-muted/50 font-dm-sans font-semibold text-[16px] rounded-[80px] transition-all flex items-center justify-center gap-2 group"
              >
                Continue shopping
                <ArrowRight className="size-4 text-light-primary-text group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartClient;
