"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MoveUpRight } from "lucide-react";
import Container from "../common/Container";
import type { AdsBanner } from "@/types/banner";

interface HomePromoBannersProps {
  banners?: AdsBanner[];
}

const HomePromoBanners = ({ banners = [] }: HomePromoBannersProps) => {
  if (!banners || banners.length === 0) return null;

  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div
          className={`grid grid-cols-1 gap-6 ${banners.length <= 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}
        >
          {banners.map((banner) => (
            <div
              key={banner._id}
              style={{ backgroundColor: banner.bgColor || "#f3f4f6" }}
              className="relative overflow-hidden rounded-[24px] p-8 min-h-[250px] flex flex-col justify-between group"
            >
              <div className="relative z-20 max-w-[60%]">
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  {banner.name}
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  {banner.title}
                </h3>
                {banner.description && (
                  <p className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed">
                    {banner.description}
                  </p>
                )}
                <Link
                  href={banner.buttonHref || "/shop"}
                  className="inline-flex w-fit items-center gap-2 bg-white hover:bg-gray-50 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 text-gray-900 shadow-sm"
                >
                  {banner.buttonTitle || "Shop Now"}
                  <MoveUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </Link>
              </div>

              {banner.image && (
                <div className="absolute bottom-4 right-4 w-[140px] md:w-[180px] h-auto z-10 transition-transform duration-700 group-hover:scale-105">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    width={200}
                    height={200}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default HomePromoBanners;
