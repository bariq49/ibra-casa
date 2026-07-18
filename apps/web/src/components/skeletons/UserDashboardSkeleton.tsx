import React from "react";
import Container from "@/components/common/Container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * UserDashboardSkeleton — mirrors the user account layout:
 * left sidebar nav + right content area with cards.
 * Used for all pages under /user/* via the user/loading.tsx.
 */
const UserDashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-muted pt-8 pb-16">
      <Container>
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* ── Left: Sidebar Nav ─────────────────────────── */}
          <div className="w-full xl:w-[260px] shrink-0">
            <div className="bg-white rounded-2xl p-5 border border-border shadow-sm flex flex-col gap-3">
              {/* User avatar + name */}
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <Skeleton className="size-12 rounded-full bg-gray-300 shrink-0" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-28 bg-gray-300" />
                  <Skeleton className="h-3 w-40 bg-gray-200" />
                </div>
              </div>
              {/* Nav links */}
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-2">
                  <Skeleton className="size-5 rounded-md bg-gray-200 shrink-0" />
                  <Skeleton className="h-4 w-32 bg-gray-200" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Content Cards ───────────────────────── */}
          <div className="flex-1 w-full flex flex-col gap-6">
            {/* Welcome banner */}
            <div className="bg-white rounded-2xl p-8 border border-border shadow-sm">
              <Skeleton className="h-7 w-48 bg-gray-300 mb-4" />
              <Skeleton className="h-4 w-full bg-gray-200 mb-2" />
              <Skeleton className="h-4 w-2/3 bg-gray-200" />
            </div>

            {/* Two cards grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account info card */}
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col gap-5">
                <Skeleton className="h-5 w-32 bg-gray-300" />
                <div className="flex items-center gap-4">
                  <Skeleton className="size-14 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-5 w-32 bg-gray-300" />
                    <Skeleton className="h-4 w-48 bg-gray-200" />
                  </div>
                </div>
                <Skeleton className="h-px w-full bg-gray-200" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28 bg-gray-200" />
                  <Skeleton className="h-6 w-16 rounded-full bg-gray-200" />
                </div>
              </div>

              {/* Billing card */}
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col gap-5">
                <Skeleton className="h-5 w-36 bg-gray-300" />
                <div className="flex flex-col items-center gap-4 py-4">
                  <Skeleton className="size-12 rounded-full bg-gray-200" />
                  <Skeleton className="h-4 w-56 bg-gray-200" />
                  <Skeleton className="h-4 w-40 bg-gray-200" />
                </div>
              </div>
            </div>

            {/* Recent orders section */}
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col gap-4">
              <Skeleton className="h-5 w-36 bg-gray-300 mb-2" />
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="size-12 rounded-xl bg-gray-200 shrink-0" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-28 bg-gray-300" />
                      <Skeleton className="h-3 w-20 bg-gray-200" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full bg-gray-200" />
                  <Skeleton className="h-4 w-16 bg-gray-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default UserDashboardSkeleton;
