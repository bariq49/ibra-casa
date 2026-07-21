import React from "react";
import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";
import { ApiProduct } from "@/hooks/useProducts";
import { setRequestLocale } from "next-intl/server";
import TopRatedProductsClient from "./TopRatedProductsClient";

interface TopRatedProductsProps {
  slug?: string;
  bgColor?: string;
}

const TopRatedProducts = async ({
  slug = "top-rated",
  bgColor = "#F4F3F5",
  locale,
}: TopRatedProductsProps & { locale?: string }) => {
  if (locale) setRequestLocale(locale);
  let products: ApiProduct[] = [];
  try {
    const response = await api.get<{ products: ApiProduct[]; total: number }>(
      `${PRODUCT_ENDPOINTS.BASE}?productType=${slug}&limit=6`,
    );
    products = response.data.products;
  } catch (err: any) {
    console.error("Error fetching top rated products on server:", err);
  }

  if (products.length === 0) {
    return null;
  }

  const heroProduct = products[0];
  const gridProducts = products.slice(1, 6);

  return (
    <TopRatedProductsClient
      heroProduct={heroProduct}
      gridProducts={gridProducts}
      bgColor={bgColor}
      slug={slug}
    />
  );
};

export default TopRatedProducts;
