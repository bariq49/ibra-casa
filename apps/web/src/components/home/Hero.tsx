"use client";

import React, { useEffect, useState, Suspense } from "react";
import { MoveRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Container from "../common/Container";
import { Link } from "@/i18n/routing";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { useBanners } from "@/hooks/useBanners";
import type { HeroBanner } from "@/types/banner";

interface HeroContentProps {
  homeVersionSlug?: string;
  compact?: boolean;
  initialSlides?: HeroBanner[];
}

const HeroContent = ({
  homeVersionSlug,
  compact = false,
  initialSlides = [],
}: HeroContentProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { getBannersByTypeAndPage, isLoading } = useBanners();
  const pathname = usePathname();

  // If homeVersionSlug provided, use it. Otherwise map pathname to bannerPage slug
  // If pathname is "/" or empty (after stripping locale), it's home-1
  // Otherwise use the slug from the path (e.g., /home-2 -> home-2)
  // Remove locale prefix from pathname (e.g., /en/home-2 -> home-2)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, "");
  const homeVersion = homeVersionSlug
    ? homeVersionSlug
    : pathWithoutLocale === "/" || pathWithoutLocale === ""
      ? "home-1"
      : pathWithoutLocale.replace(/^\//, "");

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
      : getBannersByTypeAndPage("hero-banner", homeVersion);

  if (isLoading && initialSlides.length === 0) {
    return (
      <section className="pt-6 pb-12 overflow-hidden">
        <Container>
          <div className="w-full h-[450px] md:h-[600px] rounded-3xl bg-gray-100 animate-pulse" />
        </Container>
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section
      className={`overflow-hidden ${compact ? "pt-0 pb-6" : "pt-6 pb-12"}`}
    >
      <Container className={compact ? "px-0 sm:px-0 lg:px-0" : ""}>
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
          className="relative group w-full rounded-3xl overflow-hidden transition-colors duration-700"
          style={{ backgroundColor: slides[current]?.bgColor || "#05535c" }}
        >
          <CarouselContent className="ml-0">
            {slides.map((slide: any) => (
              <CarouselItem
                key={slide._id}
                className={`pl-0 relative w-full ${compact ? "h-[300px] md:h-[470px]" : "h-[450px] md:h-[600px]"}`}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                {/* Overlay for mobile readability */}
                <div className="absolute inset-0 bg-black/20 md:bg-transparent" />

                {/* Left Radial Glow (Figma requirement) */}
                {homeVersion === "home-1" && (
                  <div className="hidden md:block absolute left-[5%] top-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-success/30 blur-[100px] rounded-full pointer-events-none" />
                )}

                <div className="relative h-full z-10 xl:pl-[120px] lg:pl-[60px] md:pl-[40px] px-6 sm:px-8 flex flex-col justify-center w-full max-w-full md:max-w-[450px] lg:max-w-[550px] xl:max-w-[800px]">
                  <div
                    className={
                      "flex items-center gap-x-2 md:gap-x-3 mb-3 md:mb-4 animate-fadeInUp delay-300"
                    }
                  >
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
                    className={`${compact ? "text-2xl md:text-3xl xl:text-4xl" : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[54px]"} font-bold leading-[1.2] md:leading-[1.3] mb-4 md:mb-6 animate-fadeInUp delay-500`}
                    style={{ color: slide.textColor || "#ffffff" }}
                  >
                    {slide.title}
                  </h2>

                  <p
                    className={`text-[13px] sm:text-sm md:text-base font-normal ${compact ? "mb-6" : "mb-8 md:mb-10"} w-full max-w-full sm:max-w-[500px] leading-relaxed animate-fadeInUp delay-700`}
                    style={{
                      color: slide.textColor
                        ? `${slide.textColor}E6`
                        : "#ffffffe6",
                    }} // Apply 90% opacity (E6 in hex)
                  >
                    {slide.description}
                  </p>

                  <div className="animate-fadeInUp delay-900">
                    <Link
                      href={slide.buttonHref || "#"}
                      className="inline-flex group items-center gap-x-4 bg-primary-light text-foreground font-bold py-3 pl-8 pr-3 rounded-full hover:bg-primary-dark hover:text-white transition-all duration-300 group/btn shadow-xl shadow-primary/20"
                    >
                      {slide.buttonTitle || "Shop Now"}
                      <span className="size-10 bg-white text-primary-darker inline-flex items-center justify-center rounded-full transition-transform duration-300 shadow-inner">
                        <MoveRight
                          size={20}
                          className="text-primary-light -rotate-45 group-hover:rotate-0 transition-all duration-500 ease-in-out hoverEffect"
                        />
                      </span>
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Arrows */}
          <CarouselPrevious className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 size-12 bg-white/10 hover:bg-primary-light text-primary-foreground hover:text-primary rounded-full items-center justify-center border border-white/20 border-none hoverEffect" />
          <CarouselNext className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 size-12 bg-white/10 hover:bg-primary-light text-primary-foreground hover:text-primary rounded-full items-center justify-center border border-white/20 border-none hoverEffect" />

          {/* Dots Background Shape - Visible md and up */}
          <div
            className="hidden md:block absolute left-1/2 -translate-x-1/2 bottom-0 z-10 w-[160px] h-[60px] bg-white transition-all duration-500"
            style={{
              ["--shape-bg" as any]: slides[current]?.bgColor || "#05535c",
            }}
          >
            <div className="absolute -left-[86px] top-0 z-10 w-[86px] h-full bg-[url('/images/banner-left-shape.png')] bg-no-repeat transition-colors duration-500"></div>
            <div className="absolute -right-[86px] top-0 z-10 bg-[url('/images/banner-right-shape.png')] bg-no-repeat w-[86px] h-full transition-colors duration-500"></div>
          </div>

          {/* Dot Navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-x-4 items-center justify-center">
            {slides.map((s: any, index: number) => (
              <button
                key={s._id}
                onClick={() => api?.scrollTo(index)}
                className="group relative flex items-center justify-center p-1"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div
                  className={`transition-all duration-500 ease-in-out rounded-full ${
                    current === index
                      ? "w-[78px] h-3.5"
                      : "w-3.5 h-3.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                  style={{
                    backgroundColor:
                      current === index ? s.bgColor || "#0A1F2D" : undefined,
                  }}
                />
              </button>
            ))}
          </div>
        </Carousel>
      </Container>
    </section>
  );
};

interface HeroProps {
  homeVersionSlug?: string;
  compact?: boolean;
  initialSlides?: HeroBanner[];
}

const Hero = ({
  homeVersionSlug,
  compact = false,
  initialSlides = [],
}: HeroProps) => {
  return (
    <Suspense
      fallback={
        <section
          className={`overflow-hidden ${compact ? "pt-0 pb-6" : "pt-6 pb-12"}`}
        >
          <Container className={compact ? "px-0 sm:px-0 lg:px-0" : ""}>
            <div
              className={`w-full rounded-3xl bg-gray-100 animate-pulse ${compact ? "h-[300px] md:h-[360px]" : "h-[450px] md:h-[600px]"}`}
            />
          </Container>
        </section>
      }
    >
      <HeroContent
        homeVersionSlug={homeVersionSlug}
        compact={compact}
        initialSlides={initialSlides}
      />
    </Suspense>
  );
};

export default Hero;
