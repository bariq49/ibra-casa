"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import Container from "../common/Container";
import { Link, usePathname } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useBanners } from "@/hooks/useBanners";

// Helper to get styles based on index or random
const getStyles = (index: number) => {
  const styles = [
    {
      bgColor: "#A0E2E0",
      hoverShadow: "hover:shadow-[#A0E2E0]/20",
      buttonBg: "bg-white",
      buttonText: "text-black",
      iconBg: "bg-primary",
      iconColor: "text-white",
    },
    {
      bgColor: "#FFEB69",
      hoverShadow: "hover:shadow-[#FFEB69]/20",
      buttonBg: "bg-primary",
      buttonText: "text-white",
      iconBg: "bg-white",
      iconColor: "text-primary",
    },
    {
      bgColor: "#D4E9FF",
      hoverShadow: "hover:shadow-[#D4E9FF]/20",
      buttonBg: "bg-white",
      buttonText: "text-black",
      iconBg: "bg-primary",
      iconColor: "text-white",
    },
  ];
  return styles[index % styles.length];
};

const BannerContent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { getBannersByTypeAndPage, isLoading } = useBanners();
  const pathname = usePathname();

  // Map pathname to bannerPage slug
  const homeVersion =
    pathname === "/" || pathname === ""
      ? "home-1"
      : pathname.replace(/^\//, "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const banners = getBannersByTypeAndPage("grid", homeVersion);

  if (isLoading) {
    return (
      <section className="pb-[70px]">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-[300px] bg-gray-100 rounded-3xl animate-pulse" />
            <div className="h-[300px] bg-gray-100 rounded-3xl animate-pulse" />
          </div>
        </Container>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="pb-[70px]" ref={sectionRef}>
      <Container>
        <div
          className={`transition-all duration-700 ${isVisible ? "animate-fadeInUp" : "opacity-0 translate-y-10"}`}
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full relative group"
          >
            <CarouselContent className="-ml-4">
              {banners.map((banner, index) => {
                const styles = getStyles(index);
                return (
                  <CarouselItem
                    key={banner._id}
                    className="pl-4 md:basis-1/2 lg:basis-1/2"
                  >
                    <div
                      className="md:items-center flex flex-col md:flex-row md:gap-x-4 py-8 px-10 rounded-3xl transition-all duration-500 hover:shadow-2xl min-h-[300px] relative overflow-hidden group/item"
                      style={{
                        backgroundColor: styles.bgColor,
                      }}
                    >
                      <div className="order-2 md:order-1 flex-1 relative z-10">
                        <div className="flex items-center gap-x-2 mb-2">
                          <p className="font-bold text-primary text-sm uppercase tracking-wider">
                            {banner.name}
                          </p>
                          {banner.discount && (
                            <span className="bg-warning text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md animate-pulse">
                              {banner.discount}
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                          {banner.title}
                        </h3>
                        <p className="font-semibold text-primary/80 mb-6 italic">
                          {banner.description}
                        </p>
                        <Link
                          href={banner.buttonHref || "#"}
                          className={`inline-flex items-center gap-x-3 ${styles.buttonBg} ${styles.buttonText} font-bold py-2.5 pl-6 pr-2 rounded-full group/btn hover:bg-primary-dark transition-all duration-300`}
                        >
                          {banner.buttonTitle || "Shop Now"}
                          <span
                            className={`size-8 ${styles.iconBg} ${styles.iconColor} inline-flex items-center justify-center rounded-full transition-transform duration-300  shadow-sm`}
                          >
                            <ChevronRight className="size-5" />
                          </span>
                        </Link>
                      </div>
                      <div className="order-1 md:order-2 w-full md:w-[280px] flex justify-center items-center transition-transform duration-700 group-hover/item:scale-110">
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="max-w-full h-auto drop-shadow-2xl"
                        />
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {/* Navigation Arrows - Permanently Visible */}
            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 size-10 bg-white hover:bg-primary text-primary hover:text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-none" />
            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 size-10 bg-white hover:bg-primary text-primary hover:text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-none" />
          </Carousel>
        </div>
      </Container>
    </section>
  );
};

const Banner = () => {
  return (
    <Suspense
      fallback={
        <section className="pb-[70px]">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-[300px] bg-gray-100 rounded-3xl animate-pulse" />
              <div className="h-[300px] bg-gray-100 rounded-3xl animate-pulse" />
            </div>
          </Container>
        </section>
      }
    >
      <BannerContent />
    </Suspense>
  );
};

export default Banner;
