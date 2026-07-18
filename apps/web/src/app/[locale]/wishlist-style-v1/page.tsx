import React from "react";
import { setRequestLocale } from "next-intl/server";
import { WishlistClient } from "@/components/wishlist/WishlistClient";
import Container from "@/components/common/Container";
import Breadcrumb from "@/components/product/Breadcrumb";

export const metadata = {
  title: "Wishlist | Sellzy eCommerce",
  description: "View and manage your saved products.",
};

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  setRequestLocale(resolvedParams.locale);

  return (
    <main className="min-h-screen bg-light-bg">
      <Breadcrumb />
      <Container>
        <WishlistClient />
      </Container>
    </main>
  );
}
