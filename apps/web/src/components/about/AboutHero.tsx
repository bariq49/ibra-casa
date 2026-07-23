"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Container from "@/components/common/Container";

const AnimatedCounter = ({ value }: { value: string }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const match = value.match(/^([\D]*)([\d.,]+)([\D]*)$/);
    if (!match || !ref.current) return;

    const prefix = match[1] || "";
    const numStr = match[2].replace(/,/g, "");
    const isFloat = numStr.includes(".");
    const target = parseFloat(numStr);
    const suffix = match[3] || "";

    const element = ref.current;

    // Set initial text slightly faded to avoid flash before intersection
    element.style.opacity = "0.2";

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          element.style.opacity = "1";

          let startTimestamp: number | null = null;
          const duration = 2000; // Counter duration 2 seconds

          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min(
              (timestamp - startTimestamp) / duration,
              1,
            );

            // easeOutQuart
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const currentVal = target * easeProgress;

            const formattedNum = isFloat
              ? currentVal.toFixed(1)
              : Math.max(0, Math.floor(currentVal)).toLocaleString();

            if (element) {
              element.innerHTML = `${prefix}${formattedNum}${suffix}`;
            }

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              if (element) element.innerHTML = value; // Snap to absolute exact value
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="transition-opacity duration-300">
      {value}
    </span>
  );
};

interface AboutPageConfig {
  title: string;
  mission: string;
  vision: string;
  stats: { value: string; label: string }[];
  heroImage?: string;
  heroImageSmall?: string;
}

interface AboutHeroProps {
  data?: AboutPageConfig | null;
}

const AboutHero = ({ data }: AboutHeroProps) => {
  if (!data) return null;

  const title = data.title;
  const mission = data.mission;
  const vision = data.vision;
  const displayStats = data.stats?.length ? data.stats : [];
  const heroImage = data.heroImage || "";
  const heroImageSmall = data.heroImageSmall || "";

  return (
    <section className="pb-16">
      <Container>
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-8">
          {/* Left Column: Text & Stats */}
          <div className="w-full lg:w-[60%] flex flex-col gap-10">
            {/* Title */}
            {title && (
              <h1 className="text-4xl md:text-5xl font-bold text-light-primary-text leading-tight max-w-138">
                {title}
              </h1>
            )}

            {/* Mission & Vision */}
            <div className="flex flex-col gap-6 max-w-161">
              {mission && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-light-primary-text">
                    Our Mission
                  </h3>
                  <p className="text-light-secondary-text leading-relaxed whitespace-pre-line">
                    {mission}
                  </p>
                </div>
              )}
              {vision && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-light-primary-text">
                    Our Vision
                  </h3>
                  <p className="text-light-secondary-text leading-relaxed whitespace-pre-line">
                    {vision}
                  </p>
                </div>
              )}
            </div>

            {/* Statistics — empty when no stats from API */}
            {displayStats.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-8 sm:gap-0 mt-4 w-full shadow-sm">
                {displayStats.map((stat, index) => (
                  <React.Fragment key={index}>
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-4 min-w-[30%] sm:min-w-0">
                      <span className="text-[32px] md:text-[40px] font-urbanist font-bold text-light-primary-text mb-1 lg:mb-2 leading-none">
                        <AnimatedCounter value={stat.value} />
                      </span>
                      <span className="text-sm font-dm-sans text-light-secondary-text leading-snug">
                        {stat.label}
                      </span>
                    </div>
                    {index < displayStats.length - 1 && (
                      <div className="hidden sm:block w-px h-16 bg-gray-200" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Images — only when provided, no fallbacks */}
          {(heroImage || heroImageSmall) && (
            <div className="w-full lg:w-[40%] flex justify-end mt-12 lg:mt-0">
              <div className="relative w-full max-w-[526px] z-10">
                {heroImage && (
                  <div className="relative w-full aspect-3/4 rounded-[16px] overflow-hidden shrink-0 z-0">
                    <Image
                      src={heroImage}
                      alt="Hero Image"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}

                {heroImageSmall && (
                  <div className="hidden xl:block absolute top-[25%] -left-[140px] 2xl:-left-[180px] w-[255px] h-[340px] rounded-[16px] overflow-hidden shadow-2xl z-10 border-[6px] border-background">
                    <Image
                      src={heroImageSmall}
                      alt="Hero Image Small"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default AboutHero;
