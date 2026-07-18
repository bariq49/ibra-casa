import React from "react";
import api from "@/lib/api";
import { ApiProduct } from "@/hooks/useProducts";
import { ProductType } from "@/hooks/useProductTypes";
import { setRequestLocale } from "next-intl/server";
import { PRODUCT_ENDPOINTS, PRODUCT_TYPE_ENDPOINTS } from "@/constants/endpoints";
import MostLovedProductsClient from "./MostLovedProductsClient";

interface MostLovedProductsProps {
  slug?: string;
  locale: string;
}

/**
 * Server component — fetches "most-loved-products" products and renders the
 * Most Loved Products section for the beauty (Home-2) page.
 */
const MostLovedProducts = async ({
  slug = "most-loved-products",
  locale,
}: MostLovedProductsProps) => {
  setRequestLocale(locale);
  let products: ApiProduct[] = [];
  let productType: ProductType | null = null;
  
  try {
    const [productsRes, typeRes] = await Promise.all([
      api.get<{ products: ApiProduct[]; total: number }>(
        `${PRODUCT_ENDPOINTS.BASE}?productTypes=${slug}&productBase=beauty&limit=18`,
      ),
      api.get<ProductType[]>(`${PRODUCT_TYPE_ENDPOINTS.BASE}?slug=${slug}`),
    ]);

    // Inject the specific #ffeff6 pink backplate color requested by the figma design if none is set
    products = productsRes.data.products.map(p => ({
        ...p,
        bg: p.bg || "#ffeff6"
    }));
    
    if (typeRes.data && typeRes.data.length > 0) {
      productType = typeRes.data[0];
    }
  } catch (err) {
    console.error("Error fetching Most Loved products:", err);
  }

  if (products.length === 0) return null;

  return <MostLovedProductsClient products={products} productType={productType} slug={slug} />;
};

export default MostLovedProducts;
