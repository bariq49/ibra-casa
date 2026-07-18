"use client";
import React from "react";
import Image from "next/image";

interface ShopTopHeroProps {
  layoutType: string;
}

export default function ShopTopHero({ layoutType }: ShopTopHeroProps) {
  // Determine if it's list mode or grid mode from layoutType, or just render a generic banner for now

  return (
    <div className="w-full h-[320px] bg-primary relative overflow-hidden mb-8 lg:mb-12 rounded-none sm:rounded-2xl shadow-sm max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Decorative Elements */}
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

      <div className="relative h-full flex flex-col justify-center px-8 sm:px-16 z-10">
        <span className="text-secondary font-bold text-sm tracking-widest uppercase mb-2 block">
          Exclusive Offer
        </span>
        <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-extrabold max-w-2xl leading-tight">
          Shop the Smart Way — Anytime, Anywhere
        </h1>
        <p className="text-white/80 mt-4 max-w-xl text-lg">
          Discover your favorite brands, latest trends, and exclusive discounts
          in one place.
        </p>
      </div>

      {/* Decorative Image Placeholder matching Figma's rounded rectangle */}
      <div className="absolute top-1/2 right-8 lg:right-24 -translate-y-1/2 w-64 h-64 lg:w-80 lg:h-80 bg-white/20 backdrop-blur-md rounded-[40px] hidden md:block border border-white/30 rotate-12 flex items-center justify-center">
        <span className="text-white/50 font-bold -rotate-12">Banner Image</span>
      </div>
    </div>
  );
}
