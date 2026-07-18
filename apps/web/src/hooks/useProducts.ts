import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";

export interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPercentage: number;
  image: string;
  images: string[];
  averageRating: number;
  numReviews: number;
  description: string;
  stock: number;
  productType?: {
    _id: string;
    name: string;
    type: string;
  };
  brand?: { name: string };
  category?: { name: string };
  colors?: { name: string; value: string; slug: string }[];
  sizes?: { name: string; value: string; slug: string }[];
  bg?: string;
  // ... other fields as needed
}

export const useProducts = (productTypeSlug?: string) => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!productTypeSlug) return;

    setIsLoading(true);
    try {
      const response = await api.get<{ products: ApiProduct[]; total: number }>(
        `${PRODUCT_ENDPOINTS.BASE}?productTypes=${productTypeSlug}&limit=6`,
      );
      setProducts(response.data.products);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  }, [productTypeSlug]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
};
