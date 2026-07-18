import React from "react";
import { Category } from "@/hooks/useCategories";
import { setRequestLocale } from "next-intl/server";
import OurProductsClient from "./OurProductsClient";

interface OurProductsProps {
  categories: Category[];
  locale: string;
}

/**
 * Server component — acts as an entry point for the Our Products
 * section on the Beauty (Home-2) page. Passes categories directly to client.
 */
const OurProducts = ({ categories, locale }: OurProductsProps) => {
  setRequestLocale(locale);

  // We only want to show the category tabs if there are actual categories to pick from
  if (!categories || categories.length === 0) return null;

  // We can limit to top 5-6 categories for the tabs if there are too many
  const displayCategories = categories.slice(0, 6);

  return <OurProductsClient categories={displayCategories} />;
};

export default OurProducts;
