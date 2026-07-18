"use client";
import Image from "next/image";
import {
  featureLowestCost,
  featureHighGrowth,
  featureDedicatedPickup,
  featureApproachable,
} from "@/images";

const features = [
  {
    title: "Lowest cost",
    description: "Contrary to popular belief, Lorem Ipsum is not simply random text.",
    icon: featureLowestCost,
  },
  {
    title: "High growth rate",
    description: "Contrary to popular belief, Lorem Ipsum is not simply random text.",
    icon: featureHighGrowth,
  },
  {
    title: "Dedicated pickup",
    description: "Contrary to popular belief, Lorem Ipsum is not simply random text.",
    icon: featureDedicatedPickup,
  },
  {
    title: "Most approachable",
    description: "Contrary to popular belief, Lorem Ipsum is not simply random text.",
    icon: featureApproachable,
  },
];

export default function VendorFeatures() {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-[40px]">
      {/* Section header */}
      <div className="flex flex-col gap-[12px] items-center text-center max-w-[734px] w-full px-[24px] lg:px-0">
        <p className="font-public-sans font-semibold text-light-secondary-text text-[16px] leading-[24px] w-full">
          Why Chose Us
        </p>
        <h2 className="font-urbanist font-bold text-light-primary-text text-[28px] leading-[36px] lg:text-[32px] lg:leading-[48px] w-full">
          Why Sell On Our Company?
        </h2>
        <p className="font-public-sans text-light-secondary-text text-[16px] leading-[24px] w-full">
          Grow faster with a platform built for your success. Get instant access
          to thousands of customers, powerful tools to manage your store, and a
          team that&apos;s always ready to help you win.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 w-full px-[24px] lg:px-0">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white border border-[rgba(145,158,171,0.24)] p-10 rounded-[12px] flex flex-col items-center gap-[16px] hover:shadow-md transition-shadow"
          >
            <div className="bg-warning-lighter w-[72px] h-[72px] rounded-[50px] flex items-center justify-center shrink-0">
              <Image
                src={feature.icon}
                alt={feature.title}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-[8px] text-center w-full">
              <h3 className="font-urbanist font-bold text-light-primary-text text-[20px] leading-[30px]">
                {feature.title}
              </h3>
              <p className="font-public-sans text-light-secondary-text text-[16px] leading-[24px]">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
