import React from "react";
import { Category } from "@/hooks/useCategories";
import CategoryFavoritesClient from "./CategoryFavoritesClient";

interface CategoryFavoritesProps {
  categories: Category[];
}

/**
 * Server-compatible wrapper for the beauty Category Favorites section.
 * Categories are pre-fetched by the parent page server component and filtered for favorites.
 */
export default function CategoryFavorites({ categories }: CategoryFavoritesProps) {
  if (!categories || categories.length === 0) return null;
  return <CategoryFavoritesClient categories={categories} />;
}
