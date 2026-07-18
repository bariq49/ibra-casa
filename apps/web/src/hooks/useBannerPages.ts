import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { BANNER_PAGE_ENDPOINTS } from "@/constants/endpoints";

export interface BannerPage {
  _id: string;
  name: string;
  title: string;
  slug: string;
  description?: string;
}

export const useBannerPages = () => {
  const [bannerPages, setBannerPages] = useState<BannerPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBannerPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<BannerPage[]>(BANNER_PAGE_ENDPOINTS.BASE);
      setBannerPages(response.data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching banner pages:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBannerPages();
  }, [fetchBannerPages]);

  return { bannerPages, isLoading, error, refetch: fetchBannerPages };
};
