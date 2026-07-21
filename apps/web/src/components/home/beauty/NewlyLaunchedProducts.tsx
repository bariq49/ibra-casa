import React from "react";
import { PRODUCT_TYPE_ENDPOINTS } from "@/constants/endpoints";
import { ProductType } from "@/hooks/useProductTypes";
import { setRequestLocale } from "next-intl/server";
import api from "@/lib/api";
import NewlyLaunchedProductsClient from "./NewlyLaunchedProductsClient";
import { getBeautyProductsByTypeSlug } from "@/lib/homeDataFetcher";

interface NewlyLaunchedProductsProps {
  slug?: string;
  locale: string;
}

const NewlyLaunchedProducts = async ({
  slug = "newly-lunch-products",
  locale,
}: NewlyLaunchedProductsProps) => {
  setRequestLocale(locale);

  let productType: ProductType | null = null;
  const [products, typeRes] = await Promise.all([
    getBeautyProductsByTypeSlug(slug, 8),
    api
      .get<ProductType[]>(`${PRODUCT_TYPE_ENDPOINTS.BASE}?slug=${slug}`)
      .catch(() => ({ data: [] as ProductType[] })),
  ]);

  if (typeRes.data?.length) productType = typeRes.data[0];

  const withBg = products.map((p) => ({ ...p, bg: p.bg || "#ffffff" }));
  if (!withBg.length) return null;

  const bgColor =
    productType?.productBasesBg?.["home-decor"] ||
    productType?.productBasesBg?.beauty ||
    productType?.bgColor ||
    "#F4F3F5";

  return (
    <NewlyLaunchedProductsClient
      products={withBg}
      productType={productType}
      slug={slug}
      bgColor={bgColor}
    />
  );
};

export default NewlyLaunchedProducts;
