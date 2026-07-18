"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "motion/react";
import Container from "../common/Container";
import ProductCard from "../common/products/ProductCard";
import { ApiProduct } from "@/hooks/useProducts";
import { Link } from "@/i18n/routing";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const CountdownTimer = () => {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
    setMounted(true);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const TimerBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center bg-white rounded-[8px] px-[16px] py-[12px] w-[70px] sm:w-[90px] shadow-[0px_12px_24px_0px_rgba(145,158,171,0.12)] shrink-0 text-center">
      <span className="font-['Urbanist',sans-serif] text-[18px] sm:text-[20px] font-bold leading-[28px] sm:leading-[30px] text-error">
        {mounted ? value.toString().padStart(2, "0") : "00"}
      </span>
      <span className="font-['DM_Sans',sans-serif] text-[14px] sm:text-[16px] font-normal leading-[22px] sm:leading-[24px] text-light-secondary-text">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex gap-[8px] sm:gap-[12px] items-center w-full overflow-x-auto pb-4 sm:pb-0 hide-scrollbar">
      <TimerBox value={timeLeft.days} label="Day" />
      <div className="flex flex-col justify-center font-['DM_Sans',sans-serif] text-[16px] leading-[24px] font-semibold text-light-secondary-text whitespace-nowrap">
        <p className="mb-0">.</p>
        <p>.</p>
      </div>
      <TimerBox value={timeLeft.hours} label="Hours" />
      <div className="flex flex-col justify-center font-['DM_Sans',sans-serif] text-[16px] leading-[24px] font-semibold text-light-secondary-text whitespace-nowrap">
        <p className="mb-0">.</p>
        <p>.</p>
      </div>
      <TimerBox value={timeLeft.mins} label="Mins" />
      <div className="flex flex-col justify-center font-['DM_Sans',sans-serif] text-[16px] leading-[24px] font-semibold text-light-secondary-text whitespace-nowrap">
        <p className="mb-0">.</p>
        <p>.</p>
      </div>
      <TimerBox value={timeLeft.secs} label="Secs" />
    </div>
  );
};

interface HotDealsWeekClientProps {
  products: ApiProduct[];
  slug: string;
}

const HotDealsWeekClient = ({ products, slug }: HotDealsWeekClientProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);
  const [scrollProgress, setScrollProgress] = React.useState(0);

  const onSelect = React.useCallback(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, [api]);

  const onScroll = React.useCallback(() => {
    if (!api) return;
    const progress = Math.max(0, Math.min(1, api.scrollProgress()));
    setScrollProgress(progress);
  }, [api]);

  React.useEffect(() => {
    if (!api) return;

    onSelect();
    setScrollSnaps(api.scrollSnapList());
    onScroll();

    api.on("select", onSelect);
    api.on("scroll", onScroll);
    api.on("reInit", () => {
      onSelect();
      setScrollSnaps(api.scrollSnapList());
      onScroll();
    });

    return () => {
      api.off("select", onSelect);
      api.off("scroll", onScroll);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect, onScroll]);

  return (
    <section className="py-10 md:py-14 lg:py-[70px] w-full relative">
      <Container className="relative h-full">
        <div className="relative z-10 w-full rounded-[24px] pt-8 lg:pt-0 pb-10">
          <div className="flex flex-col lg:flex-row w-full gap-10 xl:gap-14">
            
            {/* Left Sidebar: Titles, Text, Timer, Button */}
            <div className="w-full lg:w-[35%] xl:w-[380px] shrink-0 flex flex-col items-start lg:pt-4">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col w-full"
              >
                <h4 className="font-['Urbanist',sans-serif] text-[20px] font-bold leading-[30px] text-primary mb-2">
                  Limited Time Offer
                </h4>
                <h3 className="font-['Urbanist',sans-serif] text-[32px] md:text-[40px] lg:text-[48px] font-bold text-light-primary-text mb-4 leading-tight lg:leading-[1.1]">
                  Hot Deals This Week
                </h3>
                <p className="font-['DM_Sans',sans-serif] text-[16px] font-normal leading-[24px] text-light-primary-text mb-8">
                  Weekly deals are back and better than ever, bringing fresh new offers. Shop your daily routine and elevate your beauty experience.
                </p>

                {/* Timer block without breaking constraints */}
                <div className="mb-10 lg:pr-4 w-full">
                  <CountdownTimer />
                </div>

                <div className="flex items-center gap-6">
                  <Link
                    href={`/products?type=${slug}`}
                    className="inline-flex gap-[6px] items-center justify-center bg-primary text-white font-['DM_Sans',sans-serif] font-semibold text-[16px] leading-[26px] py-[8px] px-[12px] h-[48px] rounded-[59px] hover:bg-primary-dark transition-all duration-300 shadow-color-primary w-max pr-2 group"
                  >
                    <span className="pl-3">View All Products</span>
                    <div className="bg-white rounded-full size-[32px] flex items-center justify-center shrink-0 ml-1 transition-transform group-hover:rotate-12">
                      <ArrowUpRight className="size-5 text-primary" />
                    </div>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right Side: Product Carousel */}
            <div className="flex-1 min-w-0 w-full relative">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="w-full relative"
              >
                <Carousel
                  setApi={setApi}
                  opts={{ align: "start", dragFree: true }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4 sm:-ml-6">
                    {products.map((product) => (
                      <CarouselItem
                        key={product._id}
                        className="pl-4 sm:pl-6 basis-[85%] sm:basis-1/2 md:basis-[45%] lg:basis-[45%] xl:basis-1/4"
                      >
                        <motion.div
                          className="w-full h-full flex"
                          variants={itemVariants}
                        >
                          <div className="bg-white rounded-[16px] overflow-hidden w-full h-full shadow-[0px_4px_24px_-4px_rgba(18,25,38,0.06)] hover:shadow-[0px_10px_32px_-4px_rgba(18,25,38,0.08)] transition-all duration-300">
                            <ProductCard product={product} />
                          </div>
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </motion.div>

              {/* Scroll Progress Bar */}
              <div className="mt-8 md:mt-10 h-[6px] w-full bg-light-divider rounded-full overflow-hidden relative">
                <div
                  className="absolute inset-y-0 left-0 bg-primary rounded-full transition-transform duration-150 ease-out"
                  style={{
                    width: `${
                      scrollSnaps.length > 0 ? 100 / scrollSnaps.length : 100
                    }%`,
                    transform: `translate3d(${
                      scrollProgress *
                      (scrollSnaps.length > 1
                        ? (scrollSnaps.length - 1) * 100
                        : 0)
                    }%, 0, 0)`,
                  }}
                  aria-label="Scroll progress"
                />
              </div>
            </div>
            
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HotDealsWeekClient;
