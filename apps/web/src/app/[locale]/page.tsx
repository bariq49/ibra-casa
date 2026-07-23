import Hero from "@/components/home/Hero";
import SupportInfo from "@/components/home/SupportInfo";
import OurProducts from "@/components/home/OurProducts";
import LatestBlogs from "@/components/home/LatestBlogs";
import TopSellingProducts from "@/components/home/TopSellingProducts";
import TodaysTopOffer from "@/components/home/TodaysTopOffer";
import MostLovedProducts from "@/components/home/beauty/MostLovedProducts";
import NewlyLaunchedProductsBeauty from "@/components/home/beauty/NewlyLaunchedProducts";
import CategoryFavorites from "@/components/home/beauty/CategoryFavorites";
import AboutTestimonials from "@/components/about/AboutTestimonials";
import {
  getHeroBanners,
  getHomeProductTypes,
  getProductsByTypeSlug,
  getOurProducts,
  getParentCategories,
  getLatestBlogs,
  getCategoriesByBase,
  getApprovedTestimonials,
} from "@/lib/homeDataFetcher";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";
import { ProductType } from "@/hooks/useProductTypes";

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

/** Fetches latest blogs then renders the section */
const DeferredLatestBlogs = async ({ locale }: { locale: string }) => {
  const blogs = await getLatestBlogs();
  return <LatestBlogs locale={locale} blogs={blogs} />;
};

const AsyncCategoryFavorites = async () => {
  const categories = await getCategoriesByBase("home-decor", 16);
  const favorites = categories.filter((c) => c.isFavorite === true);
  return (
    <CategoryFavorites
      categories={favorites.length ? favorites.slice(0, 4) : categories.slice(0, 4)}
    />
  );
};

/** Fetches approved reviews then renders testimonials */
const DeferredTestimonials = async () => {
  const reviews = await getApprovedTestimonials();
  return <AboutTestimonials reviews={reviews} />;
};

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [heroSlides, productTypes] = await Promise.all([
    getHeroBanners(),
    getHomeProductTypes(),
  ]);

  return (
    <main>
      <Hero initialSlides={heroSlides} />
      {/* <SupportInfo /> */}

      <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
        <DeferredTopSelling locale={locale} productTypes={productTypes} />
      </Suspense>

      {/* <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
        <DeferredOurProducts locale={locale} />
      </Suspense> */}
      <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
        <AsyncCategoryFavorites />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
        <TodaysTopOffer locale={locale} />
      </Suspense>

      {/* <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
        <NewlyLaunchedProductsBeauty locale={locale} />
      </Suspense> */}
      {/* <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
        <MostLovedProducts slug="most-loved-products" locale={locale} />
      </Suspense> */}
            <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
        <DeferredTestimonials />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-[400px]" />}>
        <DeferredLatestBlogs locale={locale} />
      </Suspense>


    </main>
  );
}
