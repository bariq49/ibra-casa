import React from "react";
import { ApiProduct } from "@/hooks/useProducts";
import { ProductType } from "@/hooks/useProductTypes";
import { setRequestLocale } from "next-intl/server";
import BeautyProductsClient from "./BeautyProductsClient";

interface BeautyProductsProps {
  slug?: string;
  productType?: ProductType;
  locale: string;
  /** Pre-fetched products passed from the page — avoids double-fetch waterfall */
  products?: ApiProduct[];
}

const BeautyProducts = async ({
  slug = "beauty-products",
  productType,
  locale,
  products: prefetchedProducts,
}: BeautyProductsProps) => {
  setRequestLocale(locale);

  const products = prefetchedProducts ?? [];

  if (products.length === 0) {
    return null;
  }

  return (
    <BeautyProductsClient
      products={products}
      productType={productType}
      slug={slug}
    />
  );
};

export default BeautyProducts;
