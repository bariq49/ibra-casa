import Hero from "@/components/home/Hero";
import SupportInfo from "@/components/home/SupportInfo";
import ShopByCategory from "@/components/home/ShopByCategory";
import OurProducts from "@/components/home/OurProducts";
import HotDealsWeek from "@/components/home/HotDealsWeek";
import BeautyProducts from "@/components/home/BeautyProducts";
import BottomPromoBanners from "@/components/home/BottomPromoBanners";
import LatestBlogs from "@/components/home/LatestBlogs";
import HomePromoBanners from "@/components/home/HomePromoBanners";
import NewlyLaunchedProducts from "@/components/home/NewlyLaunchedProducts";
import BestSellingProducts from "@/components/home/BestSellingProducts";
import TopSellingProducts from "@/components/home/TopSellingProducts";
import ShopByCategoryBeauty from "@/components/home/beauty/ShopByCategoryBeauty";
import MostLovedProducts from "@/components/home/beauty/MostLovedProducts";
import ShopByBrands from "@/components/home/beauty/ShopByBrands";
import ProductThreeColumnAdsBanner from "@/components/home/beauty/ProductThreeColumnAdsBanner";
import BeautyTopBrands from "@/components/home/beauty/BeautyTopBrands";
import TwoColumnAdsBanner from "@/components/home/beauty/TwoColumnAdsBanner";
import NewlyLaunchedProductsBeauty from "@/components/home/beauty/NewlyLaunchedProducts";
import OurProductsBeauty from "@/components/home/beauty/OurProducts";
import CategoryFavorites from "@/components/home/beauty/CategoryFavorites";
import BeautyCareProducts from "@/components/home/beauty/BeautyCareProducts";
import {
  getHeroBanners,
  getHomeProductTypes,
  getProductsByTypeSlug,
  getOurProducts,
  getParentCategories,
  getLatestBlogs,
  getAdsBanners,
} from "@/lib/homeDataFetcher";
import api from "@/lib/api";
import { CATEGORY_ENDPOINTS } from "@/constants/endpoints";
import { Category } from "@/hooks/useCategories";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";
import { ProductType } from "@/hooks/useProductTypes";
import type { AdsBanner } from "@/types/banner";

// ─── Ads banner helpers ───
function filterHealthcareBanners(adsBanners: AdsBanner[]): AdsBanner[] {
  return adsBanners.filter((banner) => {
    if (!banner.productBases || !Array.isArray(banner.productBases))
      return false;
    return banner.productBases.some((pb) => {
      if (typeof pb === "string") return pb.toLowerCase() === "healthcare";
      if (pb.slug) return pb.slug === "healthcare";
      if (pb.name) return pb.name.toLowerCase() === "healthcare";
      if (pb.title) return pb.title.toLowerCase() === "healthcare";
      return false;
    });
  });
}

function isRowBanner(banner: AdsBanner): boolean {
  if (!banner.productTypes || !Array.isArray(banner.productTypes)) return false;
  return banner.productTypes.some((pt) => {
    if (typeof pt === "string")
      return (
        pt.toLowerCase() === "two-row-banner" ||
        pt.toLowerCase() === "tow-row-banner"
      );
    if (pt.slug)
      return pt.slug === "two-row-banner" || pt.slug === "tow-row-banner";
    if (pt.name) {
      const n = pt.name.toLowerCase();
      return n.includes("tow-row") || n.includes("two ") || n.includes("tow ");
    }
    return false;
  });
}

/** Fetches top-selling products then renders the section */
const DeferredTopSelling = async ({
  locale,
  productTypes,
}: {
  locale: string;
  productTypes: ProductType[];
}) => {
  const products = await getProductsByTypeSlug("top-selling-products", 25);
  const productType = productTypes.find(
    (t) => t.slug === "top-selling-products",
  );
  if (!products.length) return null;
  return (
    <TopSellingProducts
      slug="top-selling-products"
      productType={productType}
      locale={locale}
      products={products}
    />
  );
};

/** Fetches OurProducts + parent categories then renders the section */
const DeferredOurProducts = async ({ locale }: { locale: string }) => {
  const [products, categories] = await Promise.all([
    getOurProducts(),
    getParentCategories(),
  ]);
  return (
    <OurProducts
      locale={locale}
      initialProducts={products}
      parentCategories={categories}
    />
  );
};

/** Fetches promo ads banners then renders HomePromoBanners + BottomPromoBanners */
const DeferredPromoBanners = async () => {
  const adsBanners = await getAdsBanners();
  const healthcare = filterHealthcareBanners(adsBanners);
  const bottom = healthcare.filter(isRowBanner);
  const home = healthcare.filter(
    (banner) => !bottom.find((bb) => bb._id === banner._id),
  );
  return (
    <>
      {home.length > 0 && <HomePromoBanners banners={home.slice(0, 2)} />}
      {bottom.length > 0 && <BottomPromoBanners banners={bottom.slice(0, 2)} />}
    </>
  );
};

/** Fetches newly launched products then renders the section */
const DeferredNewlyLaunched = async ({
  locale,
  productTypes,
}: {
  locale: string;
  productTypes: ProductType[];
}) => {
  const products = await getProductsByTypeSlug("newly-lunch-products", 10);
  const productType = productTypes.find(
    (t) => t.slug === "newly-lunch-products",
  );
  if (!products.length) return null;
  return (
    <NewlyLaunchedProducts
      slug="newly-lunch-products"
      productType={productType}
      locale={locale}
      products={products}
    />
  );
};

/** Fetches beauty products then renders the section */
const DeferredBeauty = async ({
  locale,
  productTypes,
}: {
  locale: string;
  productTypes: ProductType[];
}) => {
  const products = await getProductsByTypeSlug("beauty-products", 8);
  const productType = productTypes.find((t) => t.slug === "beauty-products");
  if (!products.length) return null;
  return (
    <BeautyProducts
      slug="beauty-products"
      productType={productType}
      locale={locale}
      products={products}
    />
  );
};

/** Fetches latest healthcare blogs then renders the section */
const DeferredLatestBlogs = async ({ locale }: { locale: string }) => {
  const blogs = await getLatestBlogs("healthcare");
  return <LatestBlogs locale={locale} productBase="healthcare" blogs={blogs} />;
};

/** Fetches latest beauty blogs then renders the section */
const DeferredBeautyLatestBlogs = async ({ locale }: { locale: string }) => {
  const blogs = await getLatestBlogs("beauty");
  return <LatestBlogs locale={locale} productBase="beauty" blogs={blogs} />;
};

const AsyncShopByCategoryBeauty = async () => {
  const res = await api.get<{ categories: Category[] }>(
    `${CATEGORY_ENDPOINTS.BASE}?bases=beauty&perPage=16`,
    { next: { revalidate: 600 } },
  );
  const categories = res.data.categories || [];
  return <ShopByCategoryBeauty categories={categories} />;
};

const AsyncOurProductsBeauty = async ({ locale }: { locale: string }) => {
  const res = await api.get<{ categories: Category[] }>(
    `${CATEGORY_ENDPOINTS.BASE}?bases=beauty&perPage=16`,
    { next: { revalidate: 600 } },
  );
  const categories = res.data.categories || [];
  return <OurProductsBeauty categories={categories} locale={locale} />;
};

const AsyncCategoryFavorites = async () => {
  const res = await api.get<{ categories: Category[] }>(
    `${CATEGORY_ENDPOINTS.BASE}?bases=beauty&perPage=16`,
    { next: { revalidate: 600 } },
  );
  const categories = res.data.categories || [];
  return (
    <CategoryFavorites
      categories={categories.filter((c) => c.isFavorite === true)}
    />
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [heroSlides, productTypes, bestSellingProducts] = await Promise.all([
    getHeroBanners(),
    getHomeProductTypes(),
    getProductsByTypeSlug("best-selling", 10),
  ]);

  const findType = (slug: string) => productTypes.find((t) => t.slug === slug);

  return (
    <main>
      {/* ── CRITICAL: renders on first byte ──────────────────── */}
      <Hero initialSlides={heroSlides} />
      <SupportInfo />

      <BestSellingProducts
        slug="best-selling"
        productType={findType("best-selling")}
        locale={locale}
        products={bestSellingProducts}
      />
      
      <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
        <DeferredTopSelling locale={locale} productTypes={productTypes} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
        <DeferredOurProducts locale={locale} />
      </Suspense>

      <Suspense fallback={null}>
        {/* Promo banners are a visual bonus — no height placeholder needed */}
        <DeferredPromoBanners />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
        <DeferredNewlyLaunched locale={locale} productTypes={productTypes} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[400px]" />}>
        <HotDealsWeek locale={locale} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
        <DeferredBeauty locale={locale} productTypes={productTypes} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[400px]" />}>
        <DeferredLatestBlogs locale={locale} />
      </Suspense>

      {/* ── Former home-2 beauty sections ─────────────────────── */}
      <Suspense fallback={<SectionSkeleton height="h-[300px]" />}>
        <AsyncShopByCategoryBeauty />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[400px]" />}>
        <ProductThreeColumnAdsBanner locale={locale} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[250px]" />}>
        <BeautyTopBrands locale={locale} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[300px]" />}>
        <TwoColumnAdsBanner locale={locale} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
        <NewlyLaunchedProductsBeauty locale={locale} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
        <AsyncOurProductsBeauty locale={locale} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
        <MostLovedProducts slug="most-loved-products" locale={locale} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[250px]" />}>
        <ShopByBrands locale={locale} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
        <AsyncCategoryFavorites />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[450px]" />}>
        <BeautyCareProducts locale={locale} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[450px]" />}>
        <DeferredBeautyLatestBlogs locale={locale} />
      </Suspense>
    </main>
  );
}
