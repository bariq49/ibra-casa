import { useState, useEffect } from "react";
import api from "@/lib/api";
import { BANNER_ENDPOINTS } from "@/constants/endpoints";
import type { HeroBanner, AdsBanner } from "@/types/banner";

export type Banner = HeroBanner | AdsBanner;

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // Fetch all banners
        const response = await api.get<Banner[]>(BANNER_ENDPOINTS.BASE);
        setBanners(response.data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching banners:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const getBannersByTypeAndPage = (type: string, page: string) => {
    return (banners as any[])
      .filter((b) => b.bannerType === type && b.bannerPage === page)
      .sort((a, b) => (a.weight ?? a.startFrom) - (b.weight ?? b.startFrom));
  };

  return { banners, isLoading, error, getBannersByTypeAndPage };
};
