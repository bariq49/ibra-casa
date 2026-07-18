import React from "react";
import Breadcrumb from "@/components/product/Breadcrumb";
import CareersHero from "@/components/careers/CareersHero";
import CareersBenefits from "@/components/careers/CareersBenefits";
import CareersJobs from "@/components/careers/CareersJobs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
};

const CareersPage = async () => {
  let careers = [];
  let collageImages: string[] = [];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    const [careersRes, configRes] = await Promise.all([
      fetch(`${apiUrl}/api/careers`, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/api/career-page`, { next: { revalidate: 60 } }),
    ]);

    if (careersRes.ok) {
      const parsed = await careersRes.json();
      if (parsed?.success) {
        careers = parsed.data;
      }
    }
    
    if (configRes.ok) {
      const parsedConfig = await configRes.json();
      if (parsedConfig?.success && parsedConfig.data) {
        collageImages = parsedConfig.data.collageImages || [];
      }
    }
  } catch (error) {
    console.error("Failed to fetch careers data", error);
  }

  return (
    <main className="bg-background min-h-screen">
      <Breadcrumb />
      <CareersHero collageImages={collageImages} />
      <CareersBenefits />
      <CareersJobs initialJobs={careers} />
    </main>
  );
};

export default CareersPage;
