// Define the valid paths we can support to prevent 404s

import ShopLayoutEngine from "@/components/shop/ShopLayoutEngine";
import type { Metadata } from "next";


export async function generateMetadata({ params }: { params: Promise<{ layoutSlug: string }> }): Promise<Metadata> {
  return {
    title: "Menu Details"
  };
}


interface ShopLayoutPageProps {
  params: Promise<{ layoutSlug: string; locale: string }>;
}

export default async function ShopLayoutPage({ params }: ShopLayoutPageProps) {
  const { layoutSlug, locale } = await params;

  // Let the client components fetch the products natively.
  // We just pass down the parameters

  return (
    <main className="min-h-screen bg-gray-50/50">
      <ShopLayoutEngine layoutSlug={layoutSlug} locale={locale} />
    </main>
  );
}
