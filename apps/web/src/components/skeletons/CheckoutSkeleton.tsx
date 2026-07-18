import React from "react";
import Container from "@/components/common/Container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * CheckoutSkeleton — mirrors the checkout two-column layout:
 * left: delivery + payment form panels, right: order summary.
 */
const CheckoutSkeleton = () => {
  return (
    <div className="min-h-screen bg-background py-8 md:py-14">
      <Container>
        {/* Page title */}
        <Skeleton className="h-8 w-44 bg-gray-300 rounded-lg mb-8" />

        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* ── Left: Form Panels ──────────────────────────── */}
          <div className="flex-1 w-full flex flex-col gap-6">
            {/* Section: Delivery */}
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col gap-5">
              <Skeleton className="h-6 w-40 bg-gray-300" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24 bg-gray-200" />
                    <Skeleton className="h-11 w-full rounded-xl bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Payment method */}
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col gap-5">
              <Skeleton className="h-6 w-36 bg-gray-300" />
              <div className="flex flex-col gap-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border"
                  >
                    <Skeleton className="size-5 rounded-full bg-gray-300 shrink-0" />
                    <Skeleton className="h-4 w-32 bg-gray-200" />
                    <Skeleton className="size-8 ml-auto rounded-md bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>

            {/* Place order button */}
            <Skeleton className="h-14 w-full rounded-full bg-gray-300" />
          </div>

          {/* ── Right: Order Summary ───────────────────────── */}
          <div className="w-full xl:w-[380px] shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col gap-5">
              <Skeleton className="h-6 w-36 bg-gray-300" />

              {/* Mini cart items */}
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="size-16 rounded-xl bg-gray-200 shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-4 w-3/4 bg-gray-300" />
                    <Skeleton className="h-4 w-1/3 bg-gray-200" />
                  </div>
                  <Skeleton className="h-5 w-16 bg-gray-300" />
                </div>
              ))}

              <Skeleton className="h-px w-full bg-gray-200" />

              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24 bg-gray-200" />
                  <Skeleton className="h-4 w-16 bg-gray-300" />
                </div>
              ))}

              <Skeleton className="h-px w-full bg-gray-200" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16 bg-gray-300" />
                <Skeleton className="h-6 w-20 bg-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CheckoutSkeleton;
