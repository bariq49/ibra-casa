import AboutHero from "@/components/about/AboutHero";
import AboutQuality from "@/components/about/AboutQuality";
import AboutFeatures from "@/components/about/AboutFeatures";
import AboutTeam from "@/components/about/AboutTeam";
import AboutTestimonials from "@/components/about/AboutTestimonials";
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
  // Fetch from the new API endpoint
  let aboutData: AboutPageConfig | null = null;
  let teamMembers = [];
  let customerReviews = [];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Attempt parallel fetching with safe settling
    const [aboutRes, teamRes, reviewsRes] = await Promise.allSettled([
      fetch(`${apiUrl}/api/about-page`, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/api/team-members?public=true`, {
        next: { revalidate: 60 },
      }),
      fetch(`${apiUrl}/api/customer-reviews?public=true`, {
        next: { revalidate: 60 },
      }),
    ]);

    if (aboutRes.status === "fulfilled" && aboutRes.value.ok) {
      const parsedAbout = await aboutRes.value.json();
      if (parsedAbout?.success) aboutData = parsedAbout.data;
    }

    if (teamRes.status === "fulfilled" && teamRes.value.ok) {
      const parsedTeam = await teamRes.value.json();
      if (parsedTeam?.success) teamMembers = parsedTeam.data;
    }

    if (reviewsRes.status === "fulfilled" && reviewsRes.value.ok) {
      const parsedReviews = await reviewsRes.value.json();
      if (parsedReviews?.success) customerReviews = parsedReviews.data;
    }
  } catch (error) {
    console.warn(
      "Failed to complete data fetching for about page. Using static fallbacks.",
    );
  }

  return (
    <main className="bg-background">
      <Breadcrumb />
      <AboutHero data={aboutData} />
      <AboutFeatures features={aboutData?.features} />
      <AboutQuality />
      {/* <AboutTeam members={teamMembers} /> */}
      {/* <AboutTestimonials reviews={customerReviews} /> */}
    </main>
  );
};

export default AboutPage;
