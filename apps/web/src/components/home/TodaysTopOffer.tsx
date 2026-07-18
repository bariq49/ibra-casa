import React from "react";
import api from "@/lib/api";
import { ApiProduct } from "@/hooks/useProducts";
import { ProductType } from "@/hooks/useProductTypes";
import { setRequestLocale } from "next-intl/server";
import { PRODUCT_ENDPOINTS, PRODUCT_TYPE_ENDPOINTS } from "@/constants/endpoints";
import TodaysTopOfferClient from "./TodaysTopOfferClient";

interface TodaysTopOfferProps {
  slug?: string;
  locale: string;
}

/**
 * Server component — fetches "todays-top-offer" products and renders the
 * Today's Top Offer section for the beauty (Home-2) page.
 */
const TodaysTopOffer = async ({
  slug = "todays-top-offer",
  locale,
}: TodaysTopOfferProps) => {
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
    products = productsRes.data.products;
    
    if (typeRes.data && typeRes.data.length > 0) {
      productType = typeRes.data[0];
    }
  } catch (err) {
    console.error("Error fetching Today's Top Offer products:", err);
  }

  if (products.length === 0) return null;

  return <TodaysTopOfferClient products={products} productType={productType} slug={slug} />;
};

export default TodaysTopOffer;
