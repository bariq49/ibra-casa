"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "motion/react";
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
import Container from "../common/Container";

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

const CountdownDisplay = ({ endsAt }: { endsAt?: string }) => {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
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
        setTime({ d: 0, h: 0, m: 0, s: 0 });
        setExpired(true);
        return false;
      }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTime({ d, h, m, s });
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

  const parts = [
    ...(time.d > 0 ? [{ value: String(time.d), unit: "d" }] : []),
    { value: pad(time.h), unit: "h" },
    { value: pad(time.m), unit: "m" },
    { value: pad(time.s), unit: "s" },
  ];

  return (
    <div
      className="flex items-center justify-center gap-2 h-[48px] px-[20px] sm:px-[24px] py-[8px] rounded-[50px] bg-success-lighter shrink-0"
      aria-label={
        expired
          ? "Offer ended"
          : `Ends in ${parts.map((p) => `${p.value}${p.unit}`).join(" ")}`
      }
    >
      {expired ? (
        <span
          className="font-bold text-light-primary-text text-[18px] sm:text-[20px] leading-[30px] whitespace-nowrap"
          style={{ fontFamily: "'Urbanist', sans-serif" }}
        >
          Offer ended
        </span>
      ) : (
        <>
          <span
            className="font-semibold text-light-primary-text text-[14px] sm:text-[16px] leading-[24px] whitespace-nowrap"
            style={{ fontFamily: "'Urbanist', sans-serif" }}
          >
            Ends in
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {parts.map((part, index) => (
              <React.Fragment key={part.unit}>
                {index > 0 && (
                  <span
                    className="font-bold text-light-secondary-text text-[16px] sm:text-[18px] leading-none"
                    aria-hidden
                  >
                    :
                  </span>
                )}
                <span
                  className="inline-flex items-baseline font-bold text-light-primary-text text-[18px] sm:text-[20px] leading-[30px] tabular-nums"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  {part.value}
                  <span className="ml-0.5 text-[12px] sm:text-[13px] font-semibold text-light-secondary-text uppercase">
                    {part.unit}
                  </span>
                </span>
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface TodaysTopOfferClientProps {
  products: ApiProduct[];
  title?: string;
  description?: string;
  endsAt?: string;
}

const TodaysTopOfferClient = ({
  products,
  title = "Today's Top Offer",
  description = "Up to 69% discount for limited time 🔥",
  endsAt,
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
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div className="relative w-full">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8 md:mb-10">
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
              className="flex items-center flex-wrap gap-4 sm:gap-6 shrink-0"
            >
              <CountdownDisplay endsAt={endsAt} />

              <div className="hidden sm:flex items-center gap-4">
                <button
                  onClick={() => api?.scrollPrev()}
                  disabled={!canScrollPrev}
                  aria-label="Previous products"
                  className={`size-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 border border-light-divider ${
                    canScrollPrev
                      ? "bg-white hover:bg-gray-50 text-light-primary-text shadow-sm"
                      : "bg-white text-light-secondary-text cursor-not-allowed opacity-50"
                  }`}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={() => api?.scrollNext()}
                  disabled={!canScrollNext}
                  aria-label="Next products"
                  className={`size-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 border border-light-divider ${
                    canScrollNext
                      ? "bg-white hover:bg-gray-50 text-light-primary-text shadow-sm"
                      : "bg-white text-light-secondary-text cursor-not-allowed opacity-50"
                  }`}
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </motion.div>
          </div>

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
                        <ProductCard product={product} variant="beauty" />
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default TodaysTopOfferClient;
