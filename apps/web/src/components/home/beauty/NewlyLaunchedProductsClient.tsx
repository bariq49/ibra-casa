"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import Container from "../../common/Container";
import ProductCard from "../../common/products/ProductCard";
import { ApiProduct } from "@/hooks/useProducts";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { SectionHeader } from "../../common/SectionHeader";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

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

/* ─── Main Component ─── */
interface NewlyLaunchedProductsClientProps {
  products: ApiProduct[];
  productType?: any;
  slug: string;
  bgColor?: string;
}

const NewlyLaunchedProductsClient = ({
  products,
  productType,
  slug,
  bgColor = "#FFEB69",
}: NewlyLaunchedProductsClientProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);

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

  if (products.length === 0) return null;

  return (
    <section className="py-10 md:py-14 lg:py-[70px] w-full relative">
      <Container className="relative h-full">
        {/* ── Background SVG matching TodaysTopOffer shape logic ── */}
        <div className="absolute inset-0 z-0 hidden lg:block pointer-events-none overflow-hidden rounded-[32px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1728 833"
            fill="none"
            className="w-full h-full object-cover object-top-left"
            preserveAspectRatio="xMinYMin slice"
          >
            <path
              d="M1728 784.108C1728 810.618 1706.51 832.108 1680 832.108H48C21.4904 832.108 0 810.618 0 784.108V149.106C0 122.597 21.4903 101.106 48 101.106H365.5C405.547 101.106 440.281 78.362 457.49 45.086C469.472 21.9157 489.809 0 515.894 0H1680C1706.51 0 1728 21.4903 1728 48V784.108Z"
              fill={bgColor}
            />
          </svg>
        </div>

        {/* ── Main content block ── */}
        <div className="relative z-10 w-full min-h-[500px] rounded-[24px] overflow-hidden lg:overflow-visible pt-8 lg:pt-0 pb-10">
          <div
            className="absolute inset-0 rounded-[24px] -z-10 lg:hidden pointer-events-none"
            style={{ backgroundColor: bgColor }}
          />
          <div className="px-4 md:px-8 xl:px-12 w-full h-full relative z-10">
            {/* ── Header: title left | arrows right ── */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-[24px] mb-[68px] flex-wrap relative">
              {/* Title Block */}
              <SectionHeader
                title={productType?.title || "Newly Launched Products"}
                description={
                  productType?.description ||
                  "Up to 69% discount for limited time 🔥"
                }
                align="left"
              />

              {/* Right cluster: Carousel Arrows */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center flex-wrap gap-[24px] shrink-0"
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
                  <CarouselContent className="-ml-4 sm:-ml-6">
                    {products.map((product) => (
                      <CarouselItem
                        key={product._id}
                        className="pl-4 sm:pl-6 basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/5"
                      >
                        <motion.div
                          className="w-full flex h-full"
                          variants={itemVariants}
                        >
                          <div className="w-full h-full">
                            <ProductCard product={product} />
                          </div>
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </motion.div>
            </div>

            {/* ── View All Bottom Right ── */}
            <div className="flex justify-end w-full">
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

export default NewlyLaunchedProductsClient;
