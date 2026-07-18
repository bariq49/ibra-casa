import React from "react";
import { ApiProduct } from "@/hooks/useProducts";
import { ProductType } from "@/hooks/useProductTypes";
import { setRequestLocale } from "next-intl/server";
import BestSellingProductsClient from "./BestSellingProductsClient";

interface BestSellingProductsProps {
  slug?: string;
  productType?: ProductType;
  locale?: string;
  /** Pre-fetched products passed from the page — avoids double-fetch waterfall */
  products?: ApiProduct[];
}

const BestSellingProducts = async ({
  slug = "best-selling",
  productType,
  locale,
  products: prefetchedProducts,
}: BestSellingProductsProps) => {
  if (locale) setRequestLocale(locale);

  const products = prefetchedProducts ?? [];

  if (products.length === 0) {
    return null;
  }

  return (
    <BestSellingProductsClient
      products={products}
      productType={productType}
      slug={slug}
    />
  );
};

export default BestSellingProducts;
