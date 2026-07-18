import React from "react";
import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";
import { ApiProduct } from "@/hooks/useProducts";
import { ProductType } from "@/hooks/useProductTypes";
import { setRequestLocale } from "next-intl/server";
import DynamicProductSectionClient from "./DynamicProductSectionClient";

interface DynamicProductSectionProps {
  productType: ProductType;
}

const DynamicProductSection = async ({
  productType,
  locale,
}: DynamicProductSectionProps & { locale?: string }) => {
  if (locale) setRequestLocale(locale);
  let products: ApiProduct[] = [];
  try {
    const response = await api.get<{ products: ApiProduct[]; total: number }>(
      `${PRODUCT_ENDPOINTS.BASE}?productType=${productType.slug}&limit=6`,
    );
    products = response.data.products;
  } catch (err: any) {
    console.error("Error fetching dynamic products on server:", err);
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <DynamicProductSectionClient
      products={products}
      productType={productType}
    />
  );
};

export default DynamicProductSection;
