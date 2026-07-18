"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../common/products/ProductCard";
import Container from "../common/Container";
import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";
import { ApiProduct } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedProductsProps {
  categoryId?: string;
  currentProductId?: string;
}

const RelatedProducts = ({ categoryId, currentProductId }: RelatedProductsProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
  });

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setIsLoading(true);
      try {
        let url = `${PRODUCT_ENDPOINTS.BASE}?limit=10`;
        if (categoryId) {
          url += `&category=${categoryId}`;
        }
        const response = await api.get<{ products: ApiProduct[]; total: number }>(url);
        
        // Filter out current product if provided
        const filteredProducts = currentProductId
          ? response.data.products.filter(p => p._id !== currentProductId)
          : response.data.products;
          
        setProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categoryId, currentProductId]);

  if (!isLoading && products.length === 0) {
    return null; // hide section if no associated products
  }

  return (
    <section className="py-20">
      <Container>
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-[32px] font-bold text-light-primary-text">
            Relevance Products
          </h3>
          <div className="flex items-center gap-x-4">
            <button
              onClick={scrollPrev}
              className="size-[48px] flex items-center justify-center rounded-full border border-border bg-white text-foreground hover:bg-primary hover:text-white transition-all shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)]"
              aria-label="Previous products"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              onClick={scrollNext}
              className="size-[48px] flex items-center justify-center rounded-full border border-border bg-white text-foreground hover:bg-primary hover:text-white transition-all shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)]"
              aria-label="Next products"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="w-full aspect-square rounded-[16px]" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] xl:flex-[0_0_20%] pl-6"
                >
                  <div className="h-full py-2">
                    <ProductCard  
                      product={{
                        id: product._id,
                        title: product.name,
                        rating: product.numReviews || 0,
                        stars: product.averageRating || 0,
                        currentPrice: parseFloat(
                          (
                            product.price *
                            (1 - (product.discountPercentage || 0) / 100)
                          ).toFixed(2),
                        ),
                        oldPrice: product.price,
                        discount: product.discountPercentage || 0,
                        image: product.image,
                        slug: product.slug,
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
};

export default RelatedProducts;

