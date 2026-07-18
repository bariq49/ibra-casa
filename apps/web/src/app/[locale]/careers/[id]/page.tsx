import React from "react";
import Breadcrumb from "@/components/product/Breadcrumb";
import CareerDetails from "@/components/careers/CareerDetails";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

const CareerDetailsPage = async ({ params }: PageProps) => {
  const { id } = await params;
  let careerInfo = null;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/careers/${id}`, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const parsed = await res.json();
      if (parsed?.success) {
        careerInfo = parsed.data;
      }
    } else if (res.status === 404) {
      notFound();
    }
  } catch (error) {
    console.error("Failed to fetch career details", error);
  }

  if (!careerInfo) {
    notFound();
  }

  return (
    <main className="bg-background min-h-screen">
      <Breadcrumb items={[
        { label: "Careers", href: "/careers" },
        { label: careerInfo.title }
      ]} />
      <CareerDetails career={careerInfo} />
    </main>
  );
};

export default CareerDetailsPage;
