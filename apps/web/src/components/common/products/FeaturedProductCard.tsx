import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ApiProduct } from "@/hooks/useProducts";
import { Product } from "./ProductCard";

interface FeaturedProductCardProps {
  product: Product | ApiProduct;
}

const FeaturedProductCard = ({
  product: rawProduct,
}: FeaturedProductCardProps) => {
  // Normalize product data using same logic as ProductCard
  const isApiProduct = (p: any): p is ApiProduct => "_id" in p;
  const product: Product = isApiProduct(rawProduct)
    ? {
        id: rawProduct._id,
        title: rawProduct.name,
        rating: rawProduct.numReviews || 0,
        stars: rawProduct.averageRating || 0,
        currentPrice: parseFloat(
          (
            rawProduct.price *
            (1 - (rawProduct.discountPercentage || 0) / 100)
          ).toFixed(2),
        ),
        oldPrice: rawProduct.price,
        discount: rawProduct.discountPercentage || 0,
        image: rawProduct.image,
        bg: rawProduct.bg,
        slug: rawProduct.slug,
        category:
          rawProduct.category?.name ||
          rawProduct.productType?.name ||
          "General",
        brand: rawProduct.brand?.name || undefined,
        description: rawProduct.description,
        available: rawProduct.stock ?? 0,
      }
    : rawProduct;

  return (
    <div className="bg-white flex flex-col items-center justify-between overflow-hidden p-6 relative rounded-4xl w-full h-full border border-gray-100 group shadow-sm hover:shadow-md transition-shadow">
      {/* Image Area (takes top portion behind text) */}
      <div className="relative w-full rounded-3xl overflow-hidden flex items-center justify-center p-6 flex-1 min-h-62.5 sm:min-h-75 xl:min-h-0">
        <Link
          href={`/product/${product.slug}`}
          className="w-full h-full relative block"
        >
          <Image
            src={product.image || "/images/placeholder.png"}
            alt={product.title || "Featured Product"}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="group-hover:scale-110 transition-transform duration-700 ease-in-out object-contain"
          />
        </Link>
      </div>

      {/* Title & Description section (pinned to bottom inside container) */}
      <div className="flex flex-col gap-[16px] items-center relative z-10 w-full mt-[32px] shrink-0">
        <Link
          href={`/product/${product.slug}`}
          className="px-10 line-clamp-1 font-semibold text-2xl"
        >
          {product.title || "Product"}
        </Link>
        <p className="leading-[24px] relative shrink-0 font-light px-5 text-base text-center line-clamp-2">
          {`Discover ${product.category} — All in One Place.`}
        </p>

        {/* Explore Button */}
        <Link
          href={`/product/${product.slug}`}
          className="bg-primary hover:bg-[#066f67] transition-transform active:scale-95 flex gap-[6px] items-center justify-center pl-[24px] pr-[10px] py-[8px] mt-[8px] relative rounded-[100px] shadow-color-primary shrink-0 z-10 hoverEffect"
        >
          <p className="font-['DM_Sans',sans-serif] font-semibold leading-[26px] relative shrink-0 text-[16px] text-center text-white mr-1">
            Explore Item
          </p>
          <div className="bg-white flex items-center justify-center rounded-full size-[32px] shrink-0 transition-transform group-hover:rotate-45 hoverEffect">
            <ArrowUpRight
              className="size-[18px] text-primary rotate-12 group-hover:rotate-0 hoverEffect"
              strokeWidth={2.5}
            />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default FeaturedProductCard;
