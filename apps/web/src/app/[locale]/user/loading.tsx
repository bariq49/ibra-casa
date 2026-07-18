import UserDashboardSkeleton from "@/components/skeletons/UserDashboardSkeleton";

/**
 * user/loading.tsx
 *
 * This loading boundary covers ALL pages under /user/* because it
 * sits at the /user/ segment level — dashboard, orders, settings,
 * notifications, wishlist, etc. all share this skeleton via the
 * user/layout.tsx wrapper.
 */
export default function Loading() {
  return <UserDashboardSkeleton />;
}
