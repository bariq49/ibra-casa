"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
}

const ProductGallery = ({ images }: ProductGalleryProps) => {
  const galleryImages = useMemo(
    () =>
      (images || []).filter(
        (src): src is string => typeof src === "string" && src.trim().length > 0,
      ),
    [images],
  );

  const hasImages = galleryImages.length > 0;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mainViewportRef, emblaMainApi] = useEmblaCarousel({ loop: true });
  const [thumbViewportRef, emblaThumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  const scrollPrev = useCallback(
    () => emblaMainApi && emblaMainApi.scrollPrev(),
    [emblaMainApi],
  );
  const scrollNext = useCallback(
    () => emblaMainApi && emblaMainApi.scrollNext(),
    [emblaMainApi],
  );

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[500px]">
      {hasImages && (
        <div className="xl:w-[114px] w-full order-2 xl:order-1 shrink-0">
          <div className="overflow-hidden xl:h-full" ref={thumbViewportRef}>
            <div className="flex xl:flex-col flex-row gap-4">
              {galleryImages.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => onThumbClick(index)}
                  className={cn(
                    "relative flex-none xl:h-[114px] xl:w-[114px] h-20 w-20 overflow-hidden border-[1.5px] transition-all shrink-0 rounded-[12px]",
                    selectedIndex === index
                      ? "border-primary shadow-sm"
                      : "border-transparent opacity-60 hover:opacity-100",
                  )}
                >
                  <div className="relative aspect-square w-full h-full bg-light-bg rounded-[6px] overflow-hidden">
                    <Image
                      src={src}
                      alt={`Product thumb ${index + 1}`}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="xl:flex-1 order-1 xl:order-2 min-w-0">
        <div className="relative rounded-2xl border border-border overflow-hidden bg-light-bg group aspect-square xl:aspect-auto xl:h-full">
          {!hasImages ? (
            <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center gap-3 text-light-secondary-text">
              <ImageOff className="size-12 opacity-40" />
              <p className="font-dm-sans text-sm">No product images yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden h-full" ref={mainViewportRef}>
                <div className="flex h-full">
                  {galleryImages.map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center"
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={src}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover drop-shadow-sm mix-blend-multiply transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
                          priority={index === 0}
                          sizes="(max-width: 1280px) 100vw, 800px"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={scrollPrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 size-[48px] flex items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)] text-light-primary-text hover:bg-white hover:text-primary transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 size-[48px] flex items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)] text-light-primary-text hover:bg-white hover:text-primary transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
