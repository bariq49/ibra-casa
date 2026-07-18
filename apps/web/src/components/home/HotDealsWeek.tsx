import React from "react";
import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";
import { ApiProduct } from "@/hooks/useProducts";
import { setRequestLocale } from "next-intl/server";
import HotDealsWeekClient from "./HotDealsWeekClient";

interface HotDealsWeekProps {
  slug?: string;
}

const HotDealsWeek = async ({
  slug = "limited-time-offer",
  locale,
}: HotDealsWeekProps & { locale?: string }) => {
  if (locale) setRequestLocale(locale);
  let products: ApiProduct[] = [];
  try {
    const response = await api.get<{ products: ApiProduct[]; total: number }>(
      `${PRODUCT_ENDPOINTS.BASE}?productType=${slug}`,
    );
    products = response.data.products;
  } catch (err: any) {
    console.error("Error fetching hot deals on server:", err);
  }

  if (products.length === 0) {
    return null;
  }

  return <HotDealsWeekClient products={products} slug={slug} />;
};

export default HotDealsWeek;
