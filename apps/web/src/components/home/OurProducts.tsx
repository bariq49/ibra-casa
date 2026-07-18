import React from "react";
import { ApiProduct } from "@/hooks/useProducts";
import { Category } from "@/hooks/useCategories";
import { setRequestLocale } from "next-intl/server";
import OurProductsClient from "./OurProductsClient";

interface OurProductsProps {
  locale: string;
  /** Pre-fetched data passed from the page — avoids double-fetch waterfall */
  initialProducts?: ApiProduct[];
  parentCategories?: Category[];
}

const OurProducts = async ({
  locale,
  initialProducts: prefetchedProducts,
  parentCategories: prefetchedCategories,
}: OurProductsProps) => {
  if (locale) setRequestLocale(locale);

  const initialProducts = prefetchedProducts ?? [];
  const parentCategories = prefetchedCategories ?? [];

  if (initialProducts.length === 0) {
    return null;
  }

  return (
    <OurProductsClient
      initialProducts={initialProducts}
      categories={parentCategories}
      locale={locale}
    />
  );
};

export default OurProducts;
