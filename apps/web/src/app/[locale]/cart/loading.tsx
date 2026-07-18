import CartSkeleton from "@/components/skeletons/CartSkeleton";

/**
 * cart/loading.tsx
 * Shows while CartPage (server component) resolves its async work.
 */
export default function Loading() {
  return <CartSkeleton />;
}
