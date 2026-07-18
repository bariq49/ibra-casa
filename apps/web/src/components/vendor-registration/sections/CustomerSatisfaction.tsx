"use client";
import Image from "next/image";
import { vendorFeaturesImage, vendorPartnerImage } from "@/images";
import { CheckCircle2 } from "lucide-react";

export default function CustomerSatisfaction() {
  return (
    <div className="bg-warning-light flex flex-col lg:flex-row rounded-[24px] lg:rounded-[48px] w-full items-center px-[24px] lg:px-[114px] py-[40px] lg:py-[100px] gap-[40px] lg:gap-[120px]">
      {/* Left: Text content */}
      <div className="flex-1 min-w-0 flex flex-col gap-[40px]">
        {/* Title block */}
        <div className="flex flex-col gap-[12px]">
          {/* Label badge */}
          <div className="bg-[rgba(0,171,85,0.08)] flex gap-[10px] items-center justify-center px-[12px] py-[6px] rounded-[100px] w-fit">
            <div className="relative shrink-0 w-[15px] h-[15px]">
              <div className="absolute inset-0 bg-primary rounded-full" />
            </div>
            <p className="font-public-sans font-semibold text-primary text-[16px] leading-[24px] whitespace-nowrap">
              Features
            </p>
          </div>

          <h2 className="font-urbanist font-bold text-light-primary-text text-[28px] leading-[36px] lg:text-[32px] lg:leading-[48px]">
            Focus on Customer Satisfaction
          </h2>

          <div className="font-public-sans text-light-secondary-text text-[16px] leading-[24px]">
            <p>
              Experience the ultimate convenience with our Faster Free Delivery
              service—designed to bring your orders to your doorstep quickly and
              without any extra cost. Whether you&apos;re ordering essentials or
              gifts, we make sure you get them faster than ever.
            </p>
            <p className="mt-4">Why You&apos;ll Love It:</p>
          </div>
        </div>

        {/* Feature list + closing text */}
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[16px]">
            <div className="flex gap-[16px] items-start">
              <CheckCircle2 className="w-[24px] h-[24px] text-primary shrink-0" />
              <p className="flex-1 font-public-sans text-light-secondary-text text-[16px] leading-[24px]">
                Absolutely Free: No delivery fees, no hidden charges—just fast,
                reliable service.
              </p>
            </div>
            <div className="flex gap-[16px] items-start">
              <CheckCircle2 className="w-[24px] h-[24px] text-primary shrink-0" />
              <p className="flex-1 font-public-sans text-light-secondary-text text-[16px] leading-[24px]">
                Real-Time Tracking: Stay updated every step of the way with live
                order tracking.
              </p>
            </div>
            <div className="flex gap-[16px] items-start">
              <CheckCircle2 className="w-[24px] h-[24px] text-primary shrink-0" />
              <p className="flex-1 font-public-sans text-light-secondary-text text-[16px] leading-[24px]">
                Reliable Delivery Partners: We&apos;ve partnered with trusted
                couriers to ensure your packages arrive safely and on time.
              </p>
            </div>
          </div>

          <p className="font-public-sans text-light-secondary-text text-[16px] leading-[24px]">
            Say goodbye to long waits and shipping fees. With Faster Free
            Delivery, we&apos;re raising the standard—fast, seamless, and 100%
            free.
          </p>
        </div>
      </div>

      {/* Right: Image */}
      <div className="flex-1 w-full lg:min-w-0 h-[300px] lg:h-[505px] relative">
        <Image
          src={vendorFeaturesImage}
          alt="Partner with us"
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
}
