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
const CountdownDisplay = ({ endsAt }: { endsAt?: string }) => {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const targetMs = endsAt
      ? new Date(endsAt).getTime()
      : Date.now() + 60 * 60 * 1000;

    if (Number.isNaN(targetMs)) {
      setExpired(true);
      return;
    }

    const tick = () => {
      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setTime({ h: 0, m: 0, s: 0 });
        setExpired(true);
        return false;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTime({ h, m, s });
      setExpired(false);
      return true;
    };

    if (!tick()) return;
    const id = setInterval(() => {
      if (!tick()) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

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
        {expired
          ? "Offer ended"
          : `End in: ${pad(time.h)} : ${pad(time.m)} : ${pad(time.s)}`}
      </span>
    </div>
  );
};

/* ─── Main Component ─── */
interface TodaysTopOfferClientProps {
  products: ApiProduct[];
  title?: string;
  description?: string;
  endsAt?: string;
  bgColor?: string;
}

const TodaysTopOfferClient = ({
  products,
  title = "Today's Top Offer",
  description = "Up to 69% discount for limited time 🔥",
  endsAt,
  bgColor = "#F4F3F5",
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
        <div className="absolute inset-0 z-0 hidden lg:block pointer-events-none overflow-hidden rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1728 823"
            fill="none"
            className="w-full h-full object-cover object-top-left"
            preserveAspectRatio="xMinYMin slice"
          >
            <path
              d="M1728 811C1728 817.627 1722.627 823 1716 823H12C5.373 823 0 817.627 0 811V112C0 105.373 5.373 100 12 100H472.5C512.328 100 546.9 77.5038 564.205 44.5248C576.235 21.6001 596.482 0 622.371 0H1716C1722.627 0 1728 5.373 1728 12V811Z"
              fill={bgColor}
            />
          </svg>
        </div>

        {/* Mobile / tablet solid background — desktop uses the SVG shape above */}
        <div
          className="absolute inset-0 z-0 rounded-xl lg:hidden pointer-events-none"
          style={{ backgroundColor: bgColor }}
          aria-hidden
        />

        <div className="relative z-10 w-full min-h-[500px] overflow-hidden lg:overflow-visible pt-8 lg:pt-0 pb-10">
          <div className="px-4 md:px-8 xl:px-12 w-full h-full">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-[24px] mb-[68px] flex-wrap relative">
              <SectionHeader
                title={title}
                description={description}
                align="left"
              />

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center flex-wrap gap-[24px] shrink-0"
              >
                <CountdownDisplay endsAt={endsAt} />

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
