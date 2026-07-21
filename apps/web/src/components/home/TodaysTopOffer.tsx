import React from "react";
import { setRequestLocale } from "next-intl/server";
import TodaysTopOfferClient from "./TodaysTopOfferClient";
import api from "@/lib/api";
import { ApiProduct } from "@/hooks/useProducts";

interface TodaysOfferResponse {
  title?: string;
  description?: string;
  endsAt?: string;
  isActive?: boolean;
  bgColor?: string;
  products?: ApiProduct[];
}

interface TodaysTopOfferProps {
  locale: string;
}

const TodaysTopOffer = async ({ locale }: TodaysTopOfferProps) => {
  setRequestLocale(locale);

  try {
    const { data } = await api.get<TodaysOfferResponse>("/api/todays-offer", {
      next: { revalidate: 60 },
    });

    if (!data?.isActive) return null;

    const products = data.products || [];
    if (!products.length) return null;

    return (
      <TodaysTopOfferClient
        products={products}
        title={data.title || "Today's Top Offer"}
        description={
          data.description || "Up to 69% discount for limited time 🔥"
        }
        endsAt={data.endsAt}
        bgColor={data.bgColor || "#F4F3F5"}
      />
    );
  } catch (err) {
    console.error("Error fetching Today's Top Offer:", err);
    return null;
  }
};

export default TodaysTopOffer;
