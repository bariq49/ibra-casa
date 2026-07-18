"use client";

import React, { useState } from "react";
import { motion, Variants } from "motion/react";
import Link from "next/link";
import Container from "../../common/Container";
import { ApiProduct } from "@/hooks/useProducts";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "../../common/SectionHeader";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import ProductCard from "../../common/products/ProductCard";

/* ─── Animation variants ─── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

interface BeautyCareProductsClientProps {
  products: ApiProduct[];
  productType?: any;
  slug: string;
}

const BeautyCareProductsClient = ({
  products,
  productType,
  slug,
}: BeautyCareProductsClientProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  React.useEffect(() => {
    if (!api) return;
    const update = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  // Fallback to #AEE1DF (cyan) exactly matching the Figma design for this section
  const bgColor =
    productType?.productBasesBg?.beauty || productType?.bgColor || "#AEE1DF";

  if (products.length === 0) return null;

  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div className="relative px-0 pt-8 md:pt-6 lg:pt-8 pb-12 min-h-[500px]">
          {/* Mobile Solid Background with rounded corners */}
          <div
            className="absolute inset-0 z-0 pointer-events-none md:hidden rounded-[24px] md:rounded-[48px]"
            style={{ backgroundColor: bgColor }}
          />

          {/* Desktop SVG Background Cutout from Figma */}
          <div className="absolute inset-0 z-0 pointer-events-none hidden md:flex justify-start items-start w-full h-full overflow-hidden rounded-[24px] md:rounded-[48px]">
            <div
              className="absolute inset-0 rounded-[24px] md:rounded-[48px]"
              style={{ backgroundColor: bgColor }}
            />
            {/* We subtract the white notch from the top-left area instead of drawing the whole 1728px SVG. */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 516 150"
              fill="none"
              className="absolute top-0 left-0 w-[516px] h-[150px]"
              preserveAspectRatio="xMinYMin meet"
            >
              <path
                d="M515.894 0 H0 V149.106 C0 122.597 21.4903 101.106 48 101.106 H365.5 C405.547 101.106 440.281 78.362 457.49 45.086 C469.472 21.9157 489.809 0 515.894 0 Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          {/* Header Row Content */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-14 lg:mb-16 relative z-10 w-full px-6 sm:px-10 lg:px-14">
            <div className="relative max-w-max w-full flex flex-col items-start gap-1 md:-mt-8">
              <SectionHeader
                title={productType?.title || "Beauty Care Products"}
                description={
                  productType?.description ||
                  "Up to 69% discount for limited time 🔥"
                }
                align="left"
              />
            </div>

            {/* Navigation Arrows (Top Right) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="hidden sm:flex items-center gap-[12px] shrink-0 xl:mt-[32px] md:-mt-8"
            >
              <div className="hidden sm:flex items-center gap-4">
                <button
                  onClick={() => api?.scrollPrev()}
                  disabled={!canScrollPrev}
                  aria-label="Previous products"
                  className={`size-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                    canScrollPrev
                      ? "bg-white/70 hover:bg-white text-light-primary-text shadow-sm"
                      : "bg-white/30 text-light-secondary-text cursor-not-allowed"
                  }`}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={() => api?.scrollNext()}
                  disabled={!canScrollNext}
                  aria-label="Next products"
                  className={`size-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                    canScrollNext
                      ? "bg-white hover:bg-white/90 text-light-primary-text shadow-sm"
                      : "bg-white/30 text-light-secondary-text cursor-not-allowed"
                  }`}
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </motion.div>
          </div>

          <div className="px-4 sm:px-6 lg:px-10 relative z-10 w-full py-2">
            
            {/* ── Product carousel ── */}
            <div className="relative w-full overflow-hidden mb-10">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <Carousel
                  setApi={setApi}
                  opts={{ align: "start" }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-3 sm:-ml-4">
                    {products.map((product) => (
                      <CarouselItem
                        key={product._id}
                        className="pl-3 sm:pl-4 basis-[80%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                      >
                        <motion.div
                          className="w-full h-full flex flex-col items-stretch"
                          variants={itemVariants}
                        >
                          <div className="w-full h-full flex flex-col flex-1 pb-4">
                            <ProductCard product={product as any} />
                          </div>
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </motion.div>
            </div>

            {/* ── View All Bottom Right ── */}
            <div className="flex justify-end w-full pr-0 sm:pr-2 lg:pr-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link
                  href={`/shop?type=${productType?.slug || slug}`}
                  className="bg-white hover:bg-white/90 transition-colors duration-300 inline-flex items-center gap-[6px] py-[8px] pl-[20px] pr-[10px] rounded-[59px] group/btn shadow-sm"
                >
                  <span className="font-['DM_Sans',sans-serif] font-semibold leading-[26px] text-primary text-[16px] whitespace-nowrap">
                    View All Products
                  </span>
                  <div className="bg-primary flex items-center justify-center rounded-full size-[32px] ml-1">
                    <ArrowUpRight className="size-4 text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                  </div>
                </Link>
              </motion.div>
            </div>
            
          </div>
        </div>
      </Container>
    </section>
  );
};

export default BeautyCareProductsClient;
