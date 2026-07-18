import CheckoutSkeleton from "@/components/skeletons/CheckoutSkeleton";

/**
 * checkout/loading.tsx
 * Shows while CheckoutPage resolves getServerSession() and any async work.
 */
export default function Loading() {
  return <CheckoutSkeleton />;
}
