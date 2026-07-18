import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSkeletonProps {
  variant?: "default" | "horizontal" | "beauty" | "grocery";
}

const ProductSkeleton = ({ variant = "default" }: ProductSkeletonProps) => {
  if (variant === "beauty") {
    return (
      <div className="bg-white border border-gray-200 border-solid flex flex-col items-start overflow-hidden relative rounded-[16px] w-full h-full shadow-sm">
        {/* Image Placeholder */}
        <Skeleton className="w-full h-[220px] sm:h-[260px] md:h-[300px] shrink-0 rounded-none bg-gray-200" />
        
        {/* Content Placeholder */}
        <div className="flex flex-col gap-[16px] items-start p-[16px] w-full grow justify-between">
          <div className="flex flex-col gap-[12px] w-full">
            {/* Title */}
            <div className="flex flex-col gap-2 w-full">
              <Skeleton className="h-5 w-full bg-gray-300" />
              <Skeleton className="h-5 w-3/4 bg-gray-300" />
            </div>

            {/* Ratings Placeholder */}
            <Skeleton className="h-4 w-24 bg-gray-300" />

            {/* Price Placeholder */}
            <div className="flex gap-[8px] items-center">
              <Skeleton className="h-6 w-20 bg-gray-300" />
              <Skeleton className="h-5 w-16 bg-gray-200" />
            </div>
          </div>

          {/* Buttons Placeholder */}
          <div className="flex gap-[12px] items-center w-full mt-4">
            <Skeleton className="size-[44px] rounded-full shrink-0 bg-gray-300" />
            <Skeleton className="h-[44px] w-full rounded-[100px] grow bg-gray-300" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "grocery") {
    return (
      <div className="border border-gray-200 rounded-2xl p-4 shadow-sm bg-card h-full w-full flex flex-col justify-between">
        <Skeleton className="rounded-xl mb-4 w-full aspect-square bg-gray-200" />
        <div className="pt-2">
          <Skeleton className="h-4 w-full mb-2 bg-gray-300" />
          <Skeleton className="h-4 w-2/3 mb-4 bg-gray-300" />
          <div className="flex justify-between items-center gap-2 mb-4">
             <Skeleton className="h-6 w-1/3 rounded-md bg-gray-300" />
             <Skeleton className="h-4 w-1/4 rounded-md bg-gray-300" />
          </div>
          <Skeleton className="h-[6px] w-full rounded-full bg-gray-300 mb-2" />
          <div className="flex justify-between items-center gap-2 mb-4">
             <Skeleton className="h-3 w-1/3 rounded-md bg-gray-300" />
             <Skeleton className="h-3 w-1/4 rounded-md bg-gray-300" />
          </div>
          <div className="flex justify-between items-center gap-2">
             <Skeleton className="h-10 w-10 rounded-full bg-gray-300" />
             <Skeleton className="h-10 grow rounded-full bg-gray-300" />
          </div>
        </div>
      </div>
    );
  }

  // Default variant (placeholder logic for completion)
  return (
    <div className="border border-gray-200 rounded-2xl p-4 shadow-sm bg-card h-full w-full flex flex-col justify-between">
      <Skeleton className="rounded-xl mb-4 w-full aspect-square bg-gray-200" />
      <div className="pt-2">
        <Skeleton className="h-5 w-full mb-2 bg-gray-300" />
        <Skeleton className="h-5 w-2/3 mb-4 bg-gray-300" />
        <Skeleton className="h-4 w-1/3 mb-4 bg-gray-300" />
        <Skeleton className="h-6 w-1/4 mb-4 bg-gray-300" />
        <div className="flex justify-between items-center gap-2">
           <Skeleton className="h-10 w-full rounded-md bg-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
