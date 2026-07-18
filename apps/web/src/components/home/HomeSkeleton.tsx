import React from "react";
import Container from "../common/Container";
import { SectionSkeleton } from "../ui/SectionSkeleton";

export const HomeSkeleton = () => {
  return (
    <div className="flex flex-col w-full pb-20">
      {/* Hero Banner Skeleton */}
      <div className="w-full bg-gray-100 animate-pulse relative h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]">
        <Container className="h-full flex flex-col justify-center gap-6 w-full">
          <div className="w-2/3 md:w-1/2 h-12 md:h-16 bg-gray-300 rounded-2xl animate-pulse" />
          <div className="w-1/2 md:w-1/3 h-6 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-[150px] h-14 bg-gray-300 rounded-xl animate-pulse mt-4" />
        </Container>
      </div>

      {/* Support Info Skeleton */}
      <div className="py-10 border-b border-border">
        <Container className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-gray-200 animate-pulse" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-4 w-3/4 bg-gray-300 animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Product Sections Skeletons */}
      <SectionSkeleton height="h-[520px]" />
      <SectionSkeleton height="h-[520px]" />
      <SectionSkeleton height="h-[300px]" />
      <SectionSkeleton height="h-[520px]" />
    </div>
  );
};

export default HomeSkeleton;
