"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "motion/react";
import Container from "../common/Container";
import ProductCard from "../common/products/ProductCard";
import { ApiProduct } from "@/hooks/useProducts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "../common/SectionHeader";
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

/* ─── Countdown Timer ─── */
const CountdownDisplay = () => {
  const [time, setTime] = useState({ h: 0, m: 51, s: 4 });

  useEffect(() => {
    const target = new Date();
    target.setHours(
      target.getHours() + time.h,
      target.getMinutes() + time.m,
      target.getSeconds() + time.s,
    );

    const tick = setInterval(() => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        clearInterval(tick);
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTime({ h, m, s });
    }, 1000);

    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className="flex items-center justify-center h-[48px] px-[24px] py-[8px] rounded-[50px] bg-success-lighter shrink-0"
      aria-label="Offer countdown timer"
    >
      <span
        className="font-bold text-light-primary-text text-[20px] leading-[30px] whitespace-nowrap"
        style={{ fontFamily: "'Urbanist', sans-serif" }}
      >
        End in: {pad(time.h)} : {pad(time.m)} : {pad(time.s)}
      </span>
    </div>
  );
};

/* ─── Main Component ─── */
interface TodaysTopOfferClientProps {
  products: ApiProduct[];
  productType?: any;
  slug: string;
}

const TodaysTopOfferClient = ({
  products,
  productType,
  slug,
}: TodaysTopOfferClientProps) => {
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
        <div className="absolute inset-0 z-0 hidden lg:block pointer-events-none overflow-hidden rounded-[32px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1728 823"
            fill="none"
            className="w-full h-full object-cover object-top-left"
            preserveAspectRatio="xMinYMin slice"
          >
            <path
              d="M1728 775C1728 801.51 1706.51 823 1680 823H48C21.4904 823 0 801.51 0 775V148C0 121.49 21.4903 100 48 100H472.5C512.328 100 546.9 77.5038 564.205 44.5248C576.235 21.6001 596.482 0 622.371 0H1680C1706.51 0 1728 21.4903 1728 48V775Z"
              fill="#FFD6EF"
            />
          </svg>
        </div>

        {/* ── Main content block ── */}
        <div className="relative z-10 w-full min-h-[500px] rounded-[24px] bg-primary-lighter lg:bg-transparent overflow-hidden lg:overflow-visible pt-8 lg:pt-0 pb-10">
          <div className="px-4 md:px-8 xl:px-12 w-full h-full">
            {/* ── Header: title left | timer + arrows right ── */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-[24px] mb-[68px] flex-wrap relative">
              {/* Title Block */}
              <SectionHeader
                title={productType?.title || "Today’s Top Offer"}
                description={
                  productType?.description ||
                  "Up to 69% discount for limited time 🔥"
                }
                align="left"
              />

              {/* Right cluster: countdown + arrows */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center flex-wrap gap-[24px] shrink-0"
              >
                <CountdownDisplay />

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
            <div className="relative w-full overflow-hidden">
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
                          <div className="bg-white rounded-[16px] overflow-hidden w-full h-full shadow-sm hover:shadow-md transition-shadow duration-300">
                            <ProductCard product={product} variant="beauty" />
                          </div>
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TodaysTopOfferClient;
