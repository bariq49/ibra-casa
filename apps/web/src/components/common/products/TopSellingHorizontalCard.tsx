import React from "react";
import Link from "next/link";
import Image from "next/image";
import Ratings from "./Ratings";
import PriceFormatter from "./PriceFormatter";
import { ApiProduct } from "@/hooks/useProducts";
import { Product } from "./ProductCard";
import AddToCartBtn from "./AddToCartBtn";

interface TopSellingHorizontalCardProps {
  product: Product | ApiProduct;
}

const TopSellingHorizontalCard = ({
  product: rawProduct,
}: TopSellingHorizontalCardProps) => {
  // Normalize product data
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
    <div className="bg-white flex flex-row gap-4 h-40 items-start overflow-hidden p-4 relative rounded-2xl shrink-0 w-full group border border-transparent hover:border-gray-100 hover:shadow-sm transition-all duration-300">
      <div
        className="relative rounded-2xl shrink-0 size-32 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: product.bg || "#FAFAFB" }}
      >
        <Link
          href={`/product/${product.slug}`}
          className="w-full h-full p-2 relative flex items-center justify-center"
        >
          <Image
            src={product.image || "/images/placeholder.png"}
            alt={product.title || "Product"}
            fill
            sizes="128px"
            className="object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>
      </div>

      <div className="flex flex-[1_0_0] flex-col gap-3 items-start justify-center h-full relative py-1 min-w-0 sm:pr-22.5">
        <Link
          href={`/product/${product.slug}`}
          className="font-semibold line-clamp-1 md:line-clamp-2 leading-5.5 text-light-primary-text text-[15px] hover:text-primary transition-colors pr-2"
        >
          {product.title || "Product"}
        </Link>

        <div className="hidden sm:flex items-center relative shrink-0 gap-1.5 align-middle">
          <Ratings rating={product.stars || 0} totalReviews={0} />
        </div>

        <div className="flex gap-2 items-center leading-6 relative shrink-0 w-full mt-auto">
          <PriceFormatter amount={product.currentPrice || 0} />

          {(product.discount || 0) > 0 && (
            <span className="text-sm leading-5.5 font-normal text-muted-foreground line-through">
              <PriceFormatter amount={product.oldPrice || 0} className="" />{" "}
            </span>
          )}
        </div>

        <div className="sm:absolute bottom-0 right-0 flex justify-end min-w-25">
          <AddToCartBtn product={product} className="py-2" />
        </div>
      </div>
    </div>
  );
};

export default TopSellingHorizontalCard;
