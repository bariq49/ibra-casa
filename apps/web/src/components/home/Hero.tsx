"use client";

import React, { useEffect, useState, Suspense } from "react";
import { MoveRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { useBanners } from "@/hooks/useBanners";
import type { HeroBanner } from "@/types/banner";
import { useHeaderStore } from "@/store/useHeaderStore";
import {
  heroBandGradient,
  HERO_BAND_SIZE,
  BOTTOM_HEADER_OFFSET,
} from "@/lib/colorUtils";

interface HeroContentProps {
  compact?: boolean;
  initialSlides?: HeroBanner[];
}

const HeroContent = ({
  compact = false,
  initialSlides = [],
}: HeroContentProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { getBannersByType, isLoading } = useBanners();
  const setHeroBgColor = useHeaderStore((s) => s.setHeroBgColor);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const slides =
    initialSlides.length > 0
      ? initialSlides
      : getBannersByType("hero-banner");

  const activeBg =
    slides.length > 0 ? slides[current]?.bgColor || "#05535c" : null;

  useEffect(() => {
    setHeroBgColor(activeBg);
    return () => setHeroBgColor(null);
  }, [activeBg, setHeroBgColor]);

  if (isLoading && initialSlides.length === 0) {
    return (
      <section className="w-full px-4 pt-3 rounded-2xl">
        <div className="w-full h-[420px] md:h-[600px] rounded-2xl bg-gray-100 animate-pulse" />
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const solidBg = activeBg || "#05535c";
  const bandGradient = heroBandGradient(solidBg);
  const bandStyle: React.CSSProperties = {
    backgroundColor: solidBg,
    backgroundImage: bandGradient,
    backgroundSize: HERO_BAND_SIZE,
    backgroundPosition: `0 -${BOTTOM_HEADER_OFFSET}px`,
    backgroundRepeat: "no-repeat",
  };

  return (
    <section
      className={`relative w-full overflow-x-hidden transition-[background] duration-700 ${compact ? "pt-3 pb-6" : "pt-3 md:pt-4 pb-6 md:pb-8"}`}
      style={bandStyle}
    >
      <div className="relative z-10 w-full px-4">
        <Carousel
          setApi={setApi}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
            }),
            Fade(),
          ]}
          opts={{
            loop: true,
            duration: 30,
          }}
          className="relative group w-full rounded-2xl overflow-hidden transition-colors duration-700"
          style={{ backgroundColor: solidBg }}
        >
          <CarouselContent className="ml-0">
            {slides.map((slide: HeroBanner) => {
              const slideBg = slide.bgColor || solidBg;
              return (
                <CarouselItem
                  key={slide._id}
                  className={`pl-0 relative w-full ${compact ? "h-[320px] md:h-[470px]" : "h-[420px] sm:h-[480px] md:h-[600px]"}`}
                  style={{ backgroundColor: slideBg }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: slide.image
                        ? `url(${slide.image})`
                        : undefined,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent md:from-black/25 md:via-transparent pointer-events-none z-[1]" />

                  <div className="relative h-full z-10 xl:pl-[100px] lg:pl-[56px] md:pl-[40px] px-5 sm:px-8 flex flex-col justify-center pb-10 w-full max-w-[92%] sm:max-w-[540px] md:max-w-[620px] lg:max-w-[720px] xl:max-w-[820px]">
                    <div className="flex items-center gap-x-2 md:gap-x-3 mb-3 md:mb-4 animate-fadeInUp delay-300">
                      <h6
                        className="font-semibold tracking-wide text-xs sm:text-sm md:text-base"
                        style={{ color: slide.textColor || "#ffffff" }}
                      >
                        {slide.name}
                      </h6>
                      {slide.discount && (
                        <span className="bg-warning text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full uppercase tracking-wider shadow-lg animate-pulse">
                          {slide.discount}
                        </span>
                      )}
                    </div>

                    <h2
                      className={`${compact ? "text-2xl md:text-3xl xl:text-4xl" : "text-2xl sm:text-3xl md:text-4xl lg:text-[44px] xl:text-[52px]"} font-bold leading-[1.15] md:leading-[1.2] mb-3 md:mb-5 animate-fadeInUp delay-500`}
                      style={{ color: slide.textColor || "#ffffff" }}
                    >
                      {slide.title}
                    </h2>

                    <p
                      className={`text-[13px] sm:text-sm md:text-base lg:text-[17px] font-normal ${compact ? "mb-5" : "mb-6 md:mb-10"} w-full max-w-[95%] sm:max-w-[520px] md:max-w-[560px] leading-relaxed animate-fadeInUp delay-700`}
                      style={{
                        color: slide.textColor
                          ? `${slide.textColor}E6`
                          : "#ffffffe6",
                      }}
                    >
                      {slide.description}
                    </p>

                    <div className="animate-fadeInUp delay-900">
                      <Link
                        href={slide.buttonHref || "#"}
                        className="inline-flex group items-center gap-x-2.5 bg-primary-light text-foreground font-semibold text-sm sm:text-base py-2 pl-5 pr-1.5 rounded-full hover:brightness-95 transition-all duration-300 shadow-md shadow-black/10"
                      >
                        {slide.buttonTitle || "Shop Now"}
                        <span className="size-8 shrink-0 inline-flex items-center justify-center rounded-full bg-foreground text-primary-light transition-transform duration-300 group-hover:scale-105">
                          <MoveRight
                            size={16}
                            className="shrink-0 text-primary-light -rotate-45 group-hover:rotate-0 transition-transform duration-500 ease-in-out"
                          />
                        </span>
                      </Link>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <div
            className="hidden md:block absolute left-1/2 -translate-x-1/2 bottom-0 z-10 w-[160px] h-[60px] bg-white transition-all duration-500"
            style={{
              ["--shape-bg" as any]: slides[current]?.bgColor || "#05535c",
            }}
          >
            <div className="absolute -left-[86px] top-0 z-10 w-[86px] h-full bg-[url('/images/banner-left-shape.png')] bg-no-repeat transition-colors duration-500"></div>
            <div className="absolute -right-[86px] top-0 z-10 bg-[url('/images/banner-right-shape.png')] bg-no-repeat w-[86px] h-full transition-colors duration-500"></div>
          </div>

          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-x-2.5 sm:gap-x-3 items-center justify-center">
            {slides.map((s, index) => {
              const isActive = current === index;
              const slideColor = s.bgColor || "#0A1F2D";
              return (
                <button
                  key={s._id}
                  onClick={() => api?.scrollTo(index)}
                  className="group relative flex items-center justify-center p-1"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <div
                    className={`transition-all duration-500 ease-in-out rounded-full ${
                      isActive
                        ? "w-[56px] sm:w-[78px] h-3 sm:h-3.5"
                        : "w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-40 group-hover:opacity-70"
                    }`}
                    style={{ backgroundColor: slideColor }}
                  />
                </button>
              );
            })}
          </div>
        </Carousel>
      </div>
    </section>
  );
};

interface HeroProps {
  compact?: boolean;
  initialSlides?: HeroBanner[];
}

const Hero = ({ compact = false, initialSlides = [] }: HeroProps) => {
  return (
    <Suspense
      fallback={
        <section className="w-full px-4 pt-3 md:pt-4 pb-6 md:pb-8">
          <div
            className={`w-full rounded-2xl bg-gray-100 animate-pulse ${compact ? "h-[320px] md:h-[360px]" : "h-[420px] md:h-[600px]"}`}
          />
        </section>
      }
    >
      <HeroContent compact={compact} initialSlides={initialSlides} />
    </Suspense>
  );
};

export default Hero;
