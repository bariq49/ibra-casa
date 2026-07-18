import { setRequestLocale } from "next-intl/server";
import { BRAND_ENDPOINTS } from "@/constants/endpoints";
import api from "@/lib/api";
import ShopByBrandsClient from "./ShopByBrandsClient";

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productBase?: any;
  isFeatured?: boolean;
}

export default async function ShopByBrands({ locale }: { locale: string }) {
  setRequestLocale(locale);
  let brands: Brand[] = [];

  try {
    // Fetch brands
    const res = await api.get<Brand[]>(`${BRAND_ENDPOINTS.BASE}?perPage=50`);

    // Filter by beauty product base AND isFeatured === true
    brands = (res.data || []).filter((brand) => {
      // Must be featured
      if (!brand.isFeatured) return false;

      // Must belong to a product base
      if (!brand.productBase) return false;
      const baseInfo = brand.productBase;

      // Check for 'beauty' in title, name, or specific ID
      return (
        baseInfo.title?.toLowerCase() === "beauty" ||
        baseInfo.name?.toLowerCase() === "beauty" ||
        baseInfo === "69a663a850f68158c5623580" ||
        baseInfo._id === "69a663a850f68158c5623580"
      );
    });
  } catch (error) {
    console.error("Failed to fetch featured beauty brands", error);
  }

  // Do not render section if there are no featured brands
  if (!brands || brands.length === 0) return null;

  return <ShopByBrandsClient brands={brands} />;
}
