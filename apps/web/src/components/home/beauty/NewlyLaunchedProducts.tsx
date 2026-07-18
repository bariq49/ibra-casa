import React from "react";
import api from "@/lib/api";
import {
  PRODUCT_ENDPOINTS,
  PRODUCT_TYPE_ENDPOINTS,
} from "@/constants/endpoints";
import { ApiProduct } from "@/hooks/useProducts";
import { ProductType } from "@/hooks/useProductTypes";
import { setRequestLocale } from "next-intl/server";
import NewlyLaunchedProductsClient from "./NewlyLaunchedProductsClient";

interface NewlyLaunchedProductsProps {
  slug?: string;
  locale: string;
}

/**
 * Server component — fetches "newly-launched-products" products and renders the
 * Newly Launched Products section for the beauty (Home-2) page.
 */
const NewlyLaunchedProducts = async ({
  slug = "newly-lunch-products",
  locale,
}: NewlyLaunchedProductsProps) => {
  setRequestLocale(locale);
  let products: ApiProduct[] = [];
  let productType: ProductType | null = null;

  try {
    const [productsRes, typeRes] = await Promise.all([
      api.get<{ products: ApiProduct[]; total: number }>(
        `${PRODUCT_ENDPOINTS.BASE}?productTypes=${slug}&productBase=beauty&limit=8`,
      ),
      api.get<ProductType[]>(`${PRODUCT_TYPE_ENDPOINTS.BASE}?slug=${slug}`),
    ]);

    products = productsRes.data.products.map((p) => ({
      ...p,
      bg: p.bg || "#ffeff6", // Inject the specific #ffeff6 pink backplate color
    }));

    if (typeRes.data && typeRes.data.length > 0) {
      productType = typeRes.data[0];
    }
  } catch (err) {
    console.error("Error fetching Newly Launched products or type:", err);
  }

  if (products.length === 0) return null;

  // Determine the correct background color, prioritizing the specific productBase color override.
  const bgColor =
    productType?.productBasesBg?.beauty || productType?.bgColor || "#FFEB69";

  return (
    <NewlyLaunchedProductsClient
      products={products}
      productType={productType}
      slug={slug}
      bgColor={bgColor}
    />
  );
};

export default NewlyLaunchedProducts;
