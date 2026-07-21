import { useState, useEffect } from "react";
import api from "@/lib/api";
import { BANNER_ENDPOINTS } from "@/constants/endpoints";
import type { HeroBanner } from "@/types/banner";

export type Banner = HeroBanner;

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await api.get<Banner[] | { banners: Banner[] }>(
          BANNER_ENDPOINTS.BASE,
        );
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.banners || [];
        setBanners(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching banners:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const getBannersByType = (type: string) => {
    return banners
      .filter((b) => b.bannerType === type)
      .sort((a, b) => (a.weight ?? a.startFrom) - (b.weight ?? b.startFrom));
  };

  return { banners, isLoading, error, getBannersByType };
};
