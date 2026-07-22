import type { Metadata } from "next";
import { Public_Sans, Urbanist } from "next/font/google";
import "../globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import Header from "@/components/common/header/Header";
import Footer from "@/components/common/footer/Footer";
import { Toaster } from "@/components/ui/sonner";
import ComparePopup from "@/components/common/ComparePopup";
import UrlMessageHandler from "@/components/common/UrlMessageHandler";
export const metadata: Metadata = {
  title: {
    template: "Sellzy Ecommerce App | %s",
    default: "Sellzy Ecommerce App",
  },
  description: "Sellzy - Multipurpose eCommerce",
};

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "de" },
    { locale: "fr" },
    { locale: "it" },
    { locale: "en-SG" },
  ];
}

import api from "@/lib/api";
import { MENU_ENDPOINTS, CATEGORY_ENDPOINTS } from "@/constants/endpoints";
import StoreSettingsProvider from "@/components/common/StoreSettingsProvider";
import { DEFAULT_STORE_SETTINGS } from "@/lib/storeCurrency";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Pre-fetch header data and store settings for instant render
  const [menusRes, categoriesRes, storeSettingsRes, messages] =
    await Promise.all([
      api.get(MENU_ENDPOINTS.PUBLIC, { next: { revalidate: 600 } }),
      api.get(CATEGORY_ENDPOINTS.TREE, { next: { revalidate: 600 } }),
      api
        .get("/api/system-metrics/store-settings", {
          next: { revalidate: 600 },
        })
        .catch(() => ({ data: { settings: DEFAULT_STORE_SETTINGS } })),
      getMessages(),
    ]);

  const initialMenus = menusRes.data || [];
  const initialCategoryTree = categoriesRes.data || [];
  const initialStoreSettings =
    (storeSettingsRes.data as { settings?: typeof DEFAULT_STORE_SETTINGS })
      ?.settings || DEFAULT_STORE_SETTINGS;

  return (
    <html
      lang={locale}
      className={`${publicSans.variable} ${urbanist.variable} overflow-x-hidden`}
    >
      <head></head>
      <body className="w-full max-w-full overflow-x-hidden">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <StoreSettingsProvider initialSettings={initialStoreSettings}>
            <UrlMessageHandler />
            <Header
              initialMenus={initialMenus}
              initialCategoryTree={initialCategoryTree}
            />
            {children}
            <Footer />
            <ComparePopup />
          </StoreSettingsProvider>
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
