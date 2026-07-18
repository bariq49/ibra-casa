import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Brand } from "./ShopByBrands";
import Container from "@/components/common/Container";
import { SectionHeader } from "@/components/common/SectionHeader";

export default function ShopByBrandsClient({ brands }: { brands: Brand[] }) {
  return (
    <Container className="py-12 md:py-16">
      {/* Header Centered */}
      <div className="flex flex-col items-center justify-center mb-[40px] md:mb-[60px]">
        <SectionHeader title="Shop by Brands" description="" align="center" />
      </div>

      {/* Grid for Brands: 2 rows, 5 cols on large screens */}
      <div className="w-full relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {brands.map((brand) => (
            <div key={brand._id} className="w-full">
              <Link
                href={`/shop?brand=${brand.slug}`}
                className="block group h-full"
              >
                {/* Brand Card - Grey Background Square/Rectangle */}
                <div className="w-full border border-input rounded-md flex items-center justify-center py-1 group overflow-hidden">
                  {brand.image ? (
                    <Image
                      src={brand.image}
                      alt={brand.name}
                      width={150}
                      height={150}
                      className="object-cover group-hover:scale-105 hoverEffect"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  ) : (
                    <span className="font-bold text-gray-800 text-center uppercase tracking-wide">
                      {brand.name}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
