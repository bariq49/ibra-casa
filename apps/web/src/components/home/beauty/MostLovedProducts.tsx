import React from "react";
import { ProductType } from "@/hooks/useProductTypes";
import { setRequestLocale } from "next-intl/server";
import { PRODUCT_TYPE_ENDPOINTS } from "@/constants/endpoints";
import api from "@/lib/api";
import MostLovedProductsClient from "./MostLovedProductsClient";
import { getBeautyProductsByTypeSlug } from "@/lib/homeDataFetcher";

interface MostLovedProductsProps {
  slug?: string;
  locale: string;
}

const MostLovedProducts = async ({
  slug = "most-loved-products",
  locale,
}: MostLovedProductsProps) => {
  setRequestLocale(locale);

  let productType: ProductType | null = null;
  const [products, typeRes] = await Promise.all([
    getBeautyProductsByTypeSlug(slug, 18),
    api
      .get<ProductType[]>(`${PRODUCT_TYPE_ENDPOINTS.BASE}?slug=${slug}`)
      .catch(() => ({ data: [] as ProductType[] })),
  ]);

  if (typeRes.data?.length) productType = typeRes.data[0];

  const withBg = products.map((p) => ({ ...p, bg: p.bg || "#ffeff6" }));
  if (!withBg.length) return null;

  return (
    <MostLovedProductsClient
      products={withBg}
      productType={productType}
      slug={slug}
    />
  );
};

export default MostLovedProducts;
