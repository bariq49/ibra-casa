import React from "react";
import { ApiProduct } from "@/hooks/useProducts";
import { ProductType } from "@/hooks/useProductTypes";
import { setRequestLocale } from "next-intl/server";
import NewlyLaunchedProductsClient from "./NewlyLaunchedProductsClient";

interface NewlyLaunchedProductsProps {
  slug?: string;
  productType?: ProductType;
  locale: string;
  /** Pre-fetched products passed from the page — avoids double-fetch waterfall */
  products?: ApiProduct[];
}

const NewlyLaunchedProducts = async ({
  slug = "newly-lunch-products",
  productType,
  locale,
  products: prefetchedProducts,
}: NewlyLaunchedProductsProps) => {
  setRequestLocale(locale);

  const products = prefetchedProducts ?? [];

  if (products.length === 0) {
    return null;
  }

  return (
    <NewlyLaunchedProductsClient
      products={products}
      productType={productType}
      slug={slug}
    />
  );
};

export default NewlyLaunchedProducts;
