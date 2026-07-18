import React from "react";
import Container from "../common/Container";

export const SectionSkeleton = ({
  height = "h-[450px]",
}: {
  height?: string;
}) => {
  return (
    <Container className="py-8 lg:py-12 w-full">
      {/* Title Placeholder */}
      <div className="w-[200px] h-8 bg-gray-300 animate-pulse rounded-lg mb-8" />

      {/* Grid Placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col gap-4 w-full">
            <div className="aspect-4/5 w-full bg-gray-200 animate-pulse rounded-2xl" />
            <div className="h-4 w-3/4 bg-gray-300 animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-gray-300 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </Container>
  );
};
