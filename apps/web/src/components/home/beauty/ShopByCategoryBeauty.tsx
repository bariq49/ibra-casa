import React from "react";
import { Category } from "@/hooks/useCategories";
import ShopByCategoryBeautyClient from "./ShopByCategoryBeautyClient";

interface ShopByCategoryBeautyProps {
  categories: Category[];
}

/**
 * Server-compatible wrapper for the beauty Shop By Category section.
 * Categories are pre-fetched by the parent page server component.
 */
const ShopByCategoryBeauty = ({ categories }: ShopByCategoryBeautyProps) => {
  if (!categories || categories.length === 0) return null;
  return <ShopByCategoryBeautyClient categories={categories} />;
};

export default ShopByCategoryBeauty;
