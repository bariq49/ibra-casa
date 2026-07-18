import React from "react";
import type { Metadata } from "next";
import AllCategoriesClient from "@/components/categories/AllCategoriesClient";
import Breadcrumb from "@/components/product/Breadcrumb";

export const metadata: Metadata = {
  title: "All Categories | Sellzy Ecommerce",
  description:
    "Browse our complete collection of diverse product categories, securely curated for all your needs.",
};

export default function CategoriesPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "#", active: true },
  ];

  return (
    <main className="bg-muted pb-60">
      <Breadcrumb items={breadcrumbItems} />
      <AllCategoriesClient />
    </main>
  );
}
