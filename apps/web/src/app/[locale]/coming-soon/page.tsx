import ComingSoon from "@/components/coming-soon/ComingSoon";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Coming Soon",
};


export default async function ComingSoonPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="bg-muted py-20 min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="container">
        <ComingSoon />
      </div>
    </main>
  );
}
