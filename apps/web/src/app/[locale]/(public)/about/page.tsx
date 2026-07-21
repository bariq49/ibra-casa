import AboutHero from "@/components/about/AboutHero";
import AboutQuality from "@/components/about/AboutQuality";
import AboutFeatures from "@/components/about/AboutFeatures";
import type { Metadata } from "next";
import Breadcrumb from "@/components/product/Breadcrumb";

export const metadata: Metadata = {
  title: "About us",
};

interface AboutPageConfig {
  title: string;
  mission: string;
  vision: string;
  stats: { value: string; label: string }[];
  heroImage?: string;
  heroImageSmall?: string;
  features?: any[];
}

const AboutPage = async () => {
  let aboutData: AboutPageConfig | null = null;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const aboutRes = await fetch(`${apiUrl}/api/about-page`, {
      next: { revalidate: 60 },
    });

    if (aboutRes.ok) {
      const parsedAbout = await aboutRes.json();
      if (parsedAbout?.success) aboutData = parsedAbout.data;
    }
  } catch (error) {
    console.warn("Failed to complete data fetching for about page.", error);
  }

  return (
    <main className="bg-background">
      <Breadcrumb />
      <AboutHero data={aboutData} />
      <AboutFeatures features={aboutData?.features} />
      <AboutQuality />
    </main>
  );
};

export default AboutPage;
