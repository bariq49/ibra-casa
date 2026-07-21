import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { PRODUCT_TYPE_ENDPOINTS } from "@/constants/endpoints";

export interface ProductType {
  _id: string;
  name: string;
  slug: string;
  title?: string;
  description?: string;
  banner?: string;
  bannerImages?: string[];
  isActive: boolean;
  displayOrder: number;
  bgColor?: string;
  productBasesBg?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export const useProductTypes = (pageSlug?: string) => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = pageSlug
        ? `${PRODUCT_TYPE_ENDPOINTS.BASE}?page=${pageSlug}`
        : PRODUCT_TYPE_ENDPOINTS.BASE;
      const response = await api.get<ProductType[]>(url);
      setProductTypes(response.data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching product types:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pageSlug]);

  useEffect(() => {
    fetchProductTypes();
  }, [fetchProductTypes]);

  return { productTypes, isLoading, error, refetch: fetchProductTypes };
};
