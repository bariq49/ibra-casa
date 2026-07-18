import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { PRODUCT_BASE_ENDPOINTS } from "@/constants/endpoints";

export interface ProductBase {
  _id: string;
  title: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export const useProductBases = () => {
  const [productBases, setProductBases] = useState<ProductBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductBases = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ProductBase[]>(PRODUCT_BASE_ENDPOINTS.BASE);
      // Ensure all product bases are shown, including inactive ones as requested
      const sortedBases = response.data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setProductBases(sortedBases);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching product bases:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductBases();
  }, [fetchProductBases]);

  return { productBases, isLoading, error, refetch: fetchProductBases };
};
