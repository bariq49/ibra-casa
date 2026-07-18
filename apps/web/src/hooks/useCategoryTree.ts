import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { CATEGORY_ENDPOINTS } from "@/constants/endpoints";

export interface CategoryTreeNode {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parent: string | null;
  path: string;
  level: number;
  order: number;
  isActive: boolean;
  isFavorite: boolean;
  productCount: number;
  children: CategoryTreeNode[];
  createdAt: string;
  updatedAt: string;
}

export const useCategoryTree = (initialTree: CategoryTreeNode[] = []) => {
  const [tree, setTree] = useState<CategoryTreeNode[]>(initialTree);
  const [isLoading, setIsLoading] = useState(initialTree.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<CategoryTreeNode[]>(
        CATEGORY_ENDPOINTS.TREE,
      );
      setTree(response.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching category tree:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return { tree, isLoading, error, refetch: fetchTree };
};
