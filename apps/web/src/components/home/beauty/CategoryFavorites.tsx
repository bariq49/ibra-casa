import React from "react";
import { Category } from "@/hooks/useCategories";
import CategoryFavoritesClient from "./CategoryFavoritesClient";

interface CategoryFavoritesProps {
  categories: Category[];
}

/**
 * Server wrapper for Featured Categories (asymmetric image grid).
 * Categories are pre-fetched by the parent and filtered for favorites.
 */
export default function CategoryFavorites({ categories }: CategoryFavoritesProps) {
  if (!categories || categories.length === 0) return null;
  return <CategoryFavoritesClient categories={categories} />;
}
