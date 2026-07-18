import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { CATEGORY_ENDPOINTS } from "@/constants/endpoints";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string;
  isActive: boolean;
  isFavorite?: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ categories: Category[] }>(
        CATEGORY_ENDPOINTS.BASE,
      );
      setCategories(response.data.categories || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refetch: fetchCategories };
};
