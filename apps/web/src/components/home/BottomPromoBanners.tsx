import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Container from "../common/Container";
import type { AdsBanner } from "@/types/banner";

interface BottomPromoBannersProps {
  banners?: AdsBanner[];
}

const BottomPromoBanners = ({ banners }: BottomPromoBannersProps) => {
  if (!banners || banners.length === 0) return null;

  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div
              key={banner._id}
              style={{ backgroundColor: banner.bgColor || "#f3f4f6" }}
              className="flex flex-col justify-start md:px-[33px] md:py-[49px] px-6 py-8 rounded-[24px] relative overflow-hidden min-h-[340px] group"
            >
              <div className="relative z-20 flex flex-col items-start gap-4">
                <p className="font-['DM_Sans',sans-serif] font-semibold leading-[24px] text-light-primary-text text-[16px]">
                  {banner.name}
                </p>
                <h3 className="font-['Urbanist',sans-serif] font-bold leading-tight lg:leading-[48px] text-light-primary-text text-[28px] md:text-[32px] max-w-[345px]">
                  {banner.title}
                </h3>
                {banner.description && (
                  <p className="font-['DM_Sans',sans-serif] font-semibold leading-[24px] text-light-primary-text text-[16px]">
                    {banner.description}
                  </p>
                )}
                <Link
                  href={banner.buttonHref || "/shop"}
                  className="bg-primary hover:bg-primary-dark transition-colors duration-300 inline-flex items-center gap-[6px] px-[12px] py-[8px] rounded-[59px] mt-2 group/btn border border-primary/20"
                >
                  <span className="font-['DM_Sans',sans-serif] font-semibold leading-[26px] text-white text-[16px] pl-3">
                    {banner.buttonTitle || "Shop Now"}
                  </span>
                  <div className="bg-white flex items-center justify-center rounded-full size-[32px] ml-1 shadow-sm">
                    <ArrowUpRight className="size-4 text-black group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                  </div>
                </Link>
              </div>

              {banner.image && (
                <div className="absolute top-1/2 -translate-y-1/2 right-0 md:right-4 lg:right-6 w-[240px] md:w-[320px] h-auto z-10 transition-transform duration-700 group-hover:scale-105">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    width={320}
                    height={294}
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

export default BottomPromoBanners;
