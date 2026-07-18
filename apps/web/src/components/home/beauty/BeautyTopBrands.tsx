import Image from "next/image";
import { Link } from "@/i18n/routing";
import api from "@/lib/api";
import { BRAND_ENDPOINTS } from "@/constants/endpoints";
import Container from "@/components/common/Container";

import { setRequestLocale } from "next-intl/server";

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productBase?: any;
  isFeatured?: boolean;
}

export default async function BeautyTopBrands({ locale }: { locale: string }) {
  setRequestLocale(locale);
  let brands: Brand[] = [];

  try {
    // Fetch brands
    const res = await api.get<Brand[]>(`${BRAND_ENDPOINTS.BASE}?perPage=50`);

    // Filter by beauty product base
    brands = (res.data || []).filter((brand) => {
      // Depending on how productBase is returned (object or string ID)
      if (!brand.productBase) return false;
      const baseInfo = brand.productBase;

      // Exclude the featured brand
      if (brand.isFeatured) return false;

      // Check for 'beauty' in title, name, or specific ID
      return (
        baseInfo.title?.toLowerCase() === "beauty" ||
        baseInfo.name?.toLowerCase() === "beauty" ||
        baseInfo === "69a663a850f68158c5623580" ||
        baseInfo._id === "69a663a850f68158c5623580"
      );
    });
  } catch (error) {
    console.error("Failed to fetch beauty brands list", error);
  }

  if (!brands || brands.length === 0) return null;

  return (
    <Container className="pb-10 pt-20">
      {/* Logos Container */}
      <div className="flex items-center md:justify-between flex-wrap gap-10">
        {brands.map((brand) => (
          <Link
            key={brand._id}
            href={`/shop?brand=${brand.slug}`}
            className="group"
          >
            <div className="relative size-[80px] md:size-[100px] flex items-center justify-center grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 hoverEffect">
              {brand.image ? (
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                />
              ) : (
                <span className="inline-flex items-center justify-center px-3 py-3 min-w-44 bg-warning-light text-light-primary-text text-[12px] md:text-[14px] font-semibold rounded-full tracking-wider text-center w-full shadow-sm">
                  {brand.name}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
