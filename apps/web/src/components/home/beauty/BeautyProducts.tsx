import React from "react";
import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";
import { ApiProduct } from "@/hooks/useProducts";
import { ProductType } from "@/hooks/useProductTypes";
import { setRequestLocale } from "next-intl/server";
import BeautyProductsClient from "./BeautyProductsClient";

interface BeautyProductsProps {
  slug?: string;
  productType?: ProductType;
  locale: string;
}

const BeautyProducts = async ({
  slug = "beauty-products",
  productType,
  locale,
}: BeautyProductsProps) => {
  setRequestLocale(locale);
  let products: ApiProduct[] = [];
  try {
    const response = await api.get<{ products: ApiProduct[]; total: number }>(
      `${PRODUCT_ENDPOINTS.BASE}?productTypes=${slug}&productBase=beauty&limit=8`,
    );

    products = response.data.products;
  } catch (err: any) {
    // console.error("Error fetching Beauty products on server:", err);
  }

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
