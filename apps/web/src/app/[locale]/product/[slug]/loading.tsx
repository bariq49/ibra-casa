import ProductPageSkeleton from "@/components/skeletons/ProductPageSkeleton";

/**
 * product/[slug]/loading.tsx
 *
 * Shown while the server fetches the product by slug.
 * Mirrors the exact layout of the real product page so there's
 * zero layout shift when the content streams in.
 */
export default function Loading() {
  return <ProductPageSkeleton />;
}
