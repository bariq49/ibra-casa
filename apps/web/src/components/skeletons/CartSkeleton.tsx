import React from "react";
import Container from "@/components/common/Container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * CartSkeleton — displayed while the Cart page server components are loading.
 * Mirrors the real cart layout: a list of cart rows + an order summary panel.
 */
const CartSkeleton = () => {
  return (
    <div className="min-h-screen bg-background py-8 md:py-14">
      <Container>
        {/* Page title */}
        <Skeleton className="h-8 w-40 bg-gray-300 rounded-lg mb-8" />

        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* ── Cart Items Column ──────────────────────────── */}
          <div className="flex-1 w-full flex flex-col gap-4">
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 pb-2 border-b border-border">
              {["Product", "Price", "Quantity", "Subtotal", ""].map((_, i) => (
                <Skeleton key={i} className="h-4 w-20 bg-gray-200" />
              ))}
            </div>

            {/* Cart rows */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[auto_1fr] md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center bg-white rounded-2xl p-4 border border-border shadow-sm"
              >
                {/* Thumb */}
                <Skeleton className="size-20 md:size-24 rounded-xl bg-gray-200 shrink-0" />
                {/* Name + meta */}
                <div className="flex flex-col gap-2 md:col-auto">
                  <Skeleton className="h-5 w-3/4 bg-gray-300" />
                  <Skeleton className="h-4 w-1/2 bg-gray-200" />
                </div>
                {/* Price */}
                <Skeleton className="hidden md:block h-5 w-16 bg-gray-200" />
                {/* Qty controls */}
                <Skeleton className="hidden md:block h-10 w-32 rounded-full bg-gray-200" />
                {/* Subtotal */}
                <Skeleton className="hidden md:block h-5 w-16 bg-gray-200" />
                {/* Remove icon */}
                <Skeleton className="hidden md:block size-8 rounded-full bg-gray-200" />
              </div>
            ))}

            {/* Coupon row */}
            <div className="flex gap-3 mt-2">
              <Skeleton className="h-11 flex-1 rounded-full bg-gray-200" />
              <Skeleton className="h-11 w-32 rounded-full bg-gray-300" />
            </div>
          </div>

          {/* ── Order Summary Panel ────────────────────────── */}
          <div className="w-full xl:w-[360px] shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col gap-5">
              <Skeleton className="h-6 w-36 bg-gray-300" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28 bg-gray-200" />
                  <Skeleton className="h-4 w-16 bg-gray-300" />
                </div>
              ))}
              <Skeleton className="h-px w-full bg-gray-200" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-24 bg-gray-300" />
                <Skeleton className="h-6 w-20 bg-gray-300" />
              </div>
              <Skeleton className="h-12 w-full rounded-full bg-gray-300 mt-2" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CartSkeleton;
