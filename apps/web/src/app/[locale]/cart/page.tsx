import React from "react";
import Container from "@/components/common/Container";
import QualityPriority from "@/components/common/QualityPriority";
import NewBrandedProducts from "@/components/cart/NewBrandedProducts";
import CartClient from "@/components/cart/CartClient";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Cart",
};


export default async function CartPage() {
  return (
    <Container>
      <CartClient />

      {/* ========== Quality Priority Section ========== */}
      <QualityPriority />

      {/* ========== New Branded Products Carousel ========== */}
      <NewBrandedProducts />
    </Container>
  );
}
