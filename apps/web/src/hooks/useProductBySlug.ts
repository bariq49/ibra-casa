import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";

export interface IReviewReply {
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

export interface IReview {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  likes: string[];
  replies: IReviewReply[];
}

export interface ProductVariantOption {
  _id?: string;
  name: string;
  value: string;
  slug?: string;
  priceModifier?: number;
}

export interface FullProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  discountPercentage: number;
  image: string;
  images: string[];
  averageRating: number;
  numReviews: number;
  description: string;
  stock: number;
  sku: string;
  isNewItem?: boolean;
  categories: { _id: string; name: string }[];
  category: { _id: string; name: string };
  colors: ProductVariantOption[];
  sizes: ProductVariantOption[];
  weights: ProductVariantOption[];
  reviews: IReview[];
}

export const useProductBySlug = (slug: string) => {
  const [product, setProduct] = useState<FullProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!slug) return;

    setIsLoading(true);
    try {
      const response = await api.get<FullProduct>(
        PRODUCT_ENDPOINTS.BY_ID(slug),
      );
      setProduct(response.data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching product by slug:", err);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, isLoading, error, refetch: fetchProduct };
};
