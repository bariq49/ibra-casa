import React from "react";
import ShopLayoutEngine from "@/components/shop/ShopLayoutEngine";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Shop",
};


export default async function ShopPage(props: {
  params: Promise<{ locale: string; slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { locale, slug } = params;

  // By default, if no slug is provided, use the left-sidebar-3-column layout as requested.
  // E.g., /en/shop will render left-sidebar-3-column.
  const layoutSlug = slug ? slug.join("-") : "left-sidebar-4-column";

  // Optional: pass search query if available from search params
  const q = searchParams?.q as string | undefined;

  const getArray = (val: string | string[] | undefined) =>
    val ? (typeof val === "string" ? val.split(",") : val) : undefined;

  const initialFilters = {
    brands: getArray(searchParams?.brand),
    productTypes: getArray(searchParams?.type),
    category:
      typeof searchParams?.category === "string"
        ? searchParams.category
        : undefined,
    sizes: getArray(searchParams?.sizes),
    colors: getArray(searchParams?.colors),
    discount: getArray(searchParams?.discount),
    packSizes: getArray(searchParams?.packSizes),
    rating: searchParams?.rating ? Number(searchParams.rating) : undefined,
    priceMin: searchParams?.priceMin
      ? Number(searchParams.priceMin)
      : undefined,
    priceMax: searchParams?.priceMax
      ? Number(searchParams.priceMax)
      : undefined,
  };

  // filter out undefined values
  const cleanFilters = Object.fromEntries(
    Object.entries(initialFilters).filter(([_, v]) => v !== undefined),
  );

  return (
    <ShopLayoutEngine
      locale={locale}
      layoutSlug={layoutSlug}
      searchQuery={q}
      initialFilters={cleanFilters}
      initialLimit={25}
    />
  );
}
