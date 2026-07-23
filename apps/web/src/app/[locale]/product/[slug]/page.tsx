import Container from "@/components/common/Container";
import Breadcrumb from "@/components/product/Breadcrumb";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
import RelatedProducts from "@/components/product/RelatedProducts";
import SupportInfo from "@/components/home/SupportInfo";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";
import { FullProduct } from "@/hooks/useProductBySlug";
import api from "@/lib/api";
import ProductReviews from "@/components/product/ProductReviews";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return {
    title: "Product Details"
  };
}


const SingleProudctPage = async ({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) => {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let product: FullProduct | null = null;
  let error = false;

  try {
    const response = await api.get<FullProduct>(PRODUCT_ENDPOINTS.BY_ID(slug), {
      cache: "no-store",
      next: { revalidate: 0 },
    });
    product = response.data;
  } catch (err) {
    console.error("Failed to fetch product server-side:", err);
    error = true;
  }

  if (error || !product) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">
          Product Not Found
        </h2>
        <p className="text-muted-foreground">
          The product you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  const imagesToMap = [
    ...(product.images || []),
    product.image,
  ].filter(
    (src): src is string => typeof src === "string" && src.trim().length > 0,
  );
  // Dedupe while preserving order
  const uniqueImages = [...new Set(imagesToMap)];

  return (
    <main className="bg-white">
      <Breadcrumb />

      <Container>
        <section className="pb-10">
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7">
                <ProductGallery images={uniqueImages} />
              </div>

              <div className="lg:col-span-5">
                <ProductInfo product={product} />
              </div>
            </div>
          </div>
        </section>
        <ProductTabs product={product} />
        <ProductReviews product={product} />
        <RelatedProducts
          categoryId={product.category?._id}
          currentProductId={product._id}
        />
      </Container>
    </main>
  );
};

export default SingleProudctPage;
