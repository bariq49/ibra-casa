import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const BlogSkeleton = () => {
  return (
    <div className="pt-8">
      {/* Header / Toolbar Skeleton */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-2 bg-gray-100/50 p-1 rounded-full border border-border/40">
            <Skeleton className="size-[34px] rounded-full" />
            <Skeleton className="size-[34px] rounded-full" />
          </div>
          <Skeleton className="h-4 w-32 hidden sm:block" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Skeleton className="h-11 flex-1 md:w-[260px] rounded-full" />
          <Skeleton className="h-11 w-[110px] rounded-full" />
        </div>
      </div>

      {/* Blogs Grid Skeleton */}
      <div className="grid gap-[30px] mb-14 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col border border-border rounded-2xl bg-white w-full overflow-visible"
          >
            <div className="relative w-full h-[350px] rounded-t-2xl overflow-visible shrink-0 bg-gray-100 animate-pulse">
              <div className="absolute left-6 -bottom-6 size-12 rounded-full border-[3px] border-white bg-gray-200 shadow-sm" />
            </div>
            <div className="flex flex-col px-6 pt-10 pb-6 flex-1">
              <div className="flex justify-between items-start gap-4 mb-5 w-full">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-20 rounded shadow-sm" />
              </div>
              <div className="flex flex-col gap-3 mb-7">
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-4 w-5/12 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
                <Skeleton className="h-[42px] w-full rounded-[8px]" />
                <Skeleton className="h-[42px] w-full rounded-[8px]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-center gap-x-2">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex items-center gap-x-1">
          {[1, 2, 3, 4, 5].map((page) => (
            <Skeleton key={page} className="size-10 rounded-full" />
          ))}
          <Skeleton className="size-10 rounded-full" />
        </div>
        <Skeleton className="size-10 rounded-full" />
      </div>
    </div>
  );
};

export default BlogSkeleton;
