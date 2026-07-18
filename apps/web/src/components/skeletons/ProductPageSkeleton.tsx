import React from "react";
import Container from "@/components/common/Container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ProductPageSkeleton
 *
 * Mirrors the exact layout of the single product page:
 *   - Breadcrumb bar
 *   - 12-column grid: col-span-7 gallery (thumb strip + main image) | col-span-5 info panel
 *   - Support info strip
 *   - Tabs (Description / Specifications / Shipping)
 *   - Reviews section
 *   - Related products row
 */
const ProductPageSkeleton = () => {
  return (
    <main className="bg-white">
      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <div className="py-12">
        <Container>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-5 rounded bg-gray-200" />
            <Skeleton className="h-4 w-12 rounded bg-gray-200" />
            <Skeleton className="h-4 w-4 rounded bg-gray-200" />
            <Skeleton className="h-4 w-20 rounded bg-gray-200" />
            <Skeleton className="h-4 w-4 rounded bg-gray-200" />
            <Skeleton className="h-4 w-48 rounded bg-gray-300" />
          </div>
        </Container>
      </div>

      <Container>
        {/* ── Gallery + Info Grid ───────────────────────────── */}
        <section className="pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Gallery — col-span-7 */}
            <div className="lg:col-span-7">
              <div className="flex flex-col xl:flex-row gap-6 min-h-[500px]">
                {/* Thumbnail strip — sidebar on XL, bottom row on mobile */}
                <div className="xl:w-[114px] w-full order-2 xl:order-1 shrink-0">
                  <div className="flex xl:flex-col flex-row gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton
                        key={i}
                        className="xl:h-[114px] xl:w-[114px] h-20 w-20 rounded-xl bg-gray-200 shrink-0"
                      />
                    ))}
                  </div>
                </div>

                {/* Main image */}
                <div className="xl:flex-1 order-1 xl:order-2 min-w-0">
                  <Skeleton className="w-full aspect-square xl:aspect-auto xl:h-full min-h-[420px] rounded-2xl bg-gray-200" />
                </div>
              </div>
            </div>

            {/* Product Info panel — col-span-5 */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Category badge */}
              <Skeleton className="h-5 w-24 rounded-full bg-gray-200" />

              {/* Title */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-full bg-gray-300 rounded-lg" />
                <Skeleton className="h-8 w-3/4 bg-gray-300 rounded-lg" />
              </div>

              {/* Rating + review count */}
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="size-5 rounded bg-gray-200" />
                  ))}
                </div>
                <Skeleton className="h-4 w-24 rounded bg-gray-200" />
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-28 bg-gray-300 rounded-lg" />
                <Skeleton className="h-6 w-20 bg-gray-200 rounded-lg" />
                <Skeleton className="h-6 w-14 rounded-full bg-gray-200" />
              </div>

              <Skeleton className="h-px w-full bg-gray-200" />

              {/* Color selector */}
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-16 bg-gray-200" />
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="size-8 rounded-full bg-gray-200" />
                  ))}
                </div>
              </div>

              {/* Size selector */}
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-12 bg-gray-200" />
                <div className="flex gap-2 flex-wrap">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-9 w-14 rounded-xl bg-gray-200" />
                  ))}
                </div>
              </div>

              {/* Qty + Add to cart */}
              <div className="flex gap-3 items-center">
                <Skeleton className="h-12 w-32 rounded-full bg-gray-200" />
                <Skeleton className="h-12 flex-1 rounded-full bg-gray-300" />
                <Skeleton className="size-12 rounded-full bg-gray-200 shrink-0" />
              </div>

              <Skeleton className="h-px w-full bg-gray-200" />

              {/* Meta info rows */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Skeleton className="h-4 w-20 bg-gray-200" />
                  <Skeleton className="h-4 w-32 bg-gray-300" />
                </div>
              ))}

              {/* Share row */}
              <div className="flex items-center gap-3 pt-2">
                <Skeleton className="h-4 w-12 bg-gray-200" />
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="size-8 rounded-full bg-gray-200" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Support Info Strip ────────────────────────────── */}
        <div className="py-10 border-y border-border mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-14 rounded-2xl bg-gray-200 shrink-0" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-28 bg-gray-300" />
                  <Skeleton className="h-3 w-40 bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Product Tabs (Description / Specs / Shipping) ─── */}
        <div className="mb-12">
          {/* Tab headers */}
          <div className="flex gap-6 border-b border-border mb-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                className={`h-10 w-32 rounded-t-lg ${i === 0 ? "bg-gray-300" : "bg-gray-200"}`}
              />
            ))}
          </div>
          {/* Tab content */}
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                className={`h-4 rounded bg-gray-200 ${i === 4 ? "w-2/3" : "w-full"}`}
              />
            ))}
          </div>
        </div>

        {/* ── Reviews Section ───────────────────────────────── */}
        <div className="mb-16 flex flex-col gap-6">
          <Skeleton className="h-7 w-36 bg-gray-300 rounded" />
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex gap-4 p-5 rounded-2xl border border-border bg-gray-50"
            >
              <Skeleton className="size-10 rounded-full bg-gray-200 shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-28 bg-gray-300" />
                  <Skeleton className="h-3 w-20 bg-gray-200" />
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="size-4 rounded bg-gray-200" />
                  ))}
                </div>
                <Skeleton className="h-4 w-full bg-gray-200" />
                <Skeleton className="h-4 w-3/4 bg-gray-200" />
              </div>
            </div>
          ))}
        </div>

        {/* ── Related Products ──────────────────────────────── */}
        <div className="pb-16">
          <Skeleton className="h-7 w-48 bg-gray-300 rounded mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-4/5 w-full rounded-2xl bg-gray-200" />
                <Skeleton className="h-4 w-3/4 bg-gray-300 rounded" />
                <Skeleton className="h-4 w-1/2 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
};

export default ProductPageSkeleton;
