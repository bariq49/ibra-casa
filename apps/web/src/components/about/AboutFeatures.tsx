import React from "react";
import Image from "next/image";
import Container from "@/components/common/Container";
import {
  fastDeliveryImageOne,
  fastDeliveryImageTwo,
  featuresImage,
} from "@/images";

const AboutFeatures = ({ features }: { features?: any[] }) => {
  return (
    <section className="py-20 md:py-32 bg-background flex flex-col gap-24 overflow-hidden">
      <Container>
        {/* Feature 1: Faster Free Delivery */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start gap-10">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full w-max">
                <span className="w-3.5 h-3.5 rounded-full bg-primary" />
                <span className="text-primary font-semibold text-sm">
                  Features
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-light-primary-text leading-tight">
                Faster Free Delivery
              </h2>
            </div>

            <div className="flex flex-col gap-6 text-light-secondary-text leading-relaxed">
              <p>
                Experience the ultimate convenience with our Faster Free
                Delivery service—designed to bring your orders to your doorstep
                quickly and without any extra cost. Whether you’re ordering
                essentials or gifts, we make sure you get them faster than ever.
                Why You&apos;ll Love It:
              </p>

              <ul className="flex flex-col gap-4">
                {[
                  "Absolutely Free: No delivery fees, no hidden charges—just fast, reliable service.",
                  "Real-Time Tracking: Stay updated every step of the way with live order tracking.",
                  "Reliable Delivery Partners: We’ve partnered with trusted couriers to ensure your packages",
                  "Weekend & Evening Delivery: Get your items when it's most convenient for you.",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-4">
                    {/* Check icon matching Figma */}
                    <svg
                      className="w-6 h-6 text-primary shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                      <path
                        d="M16.707 9.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L10 14.586l5.293-5.293a1 1 0 011.414 0z"
                        fill="white"
                      />
                    </svg>
                    <span className="pt-0.5">{item}</span>
                  </li>
                ))}
              </ul>

              <p>
                Say goodbye to long waits and shipping fees. With Faster Free
                Delivery, we’re raising the standard—fast, seamless, and 100%
                free.
              </p>
            </div>
          </div>

          {/* Images Layout */}
          <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end gap-4 lg:gap-[24px] mt-8 lg:mt-0">
            <div className="relative w-[57.7%] aspect-450/570 rounded-[16px] overflow-hidden shrink-0">
              <Image
                src={fastDeliveryImageTwo}
                alt="Faster Delivery"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative w-[39.2%] aspect-306/414 rounded-[16px] overflow-hidden shrink-0">
              <Image
                src={fastDeliveryImageOne}
                alt="Happy Customers Delivery"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
      <Container>
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full lg:w-1/2 relative bg-primary/20 rounded-[24px] overflow-hidden aspect-video shrink-0 group cursor-pointer shadow-lg border-4 border-white">
            <Image
              src={featuresImage}
              alt="Video Placeholder"
              fill
              className="object-cover mix-blend-multiply"
            />
          </div>

          {/* Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start gap-10">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full w-max">
                <span className="w-3.5 h-3.5 rounded-full bg-primary" />
                <span className="text-primary font-semibold text-sm">
                  Features
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-light-primary-text leading-tight">
                Focus on Customer Satisfaction
              </h2>
            </div>

            <div className="flex flex-col gap-6 text-light-secondary-text leading-relaxed">
              <p>
                Experience the ultimate convenience with our Faster Free
                Delivery service—designed to bring your orders to your doorstep
                quickly and without any extra cost. Whether you’re ordering
                essentials or gifts, we make sure you get them faster than ever.
                Why You&apos;ll Love It:
              </p>

              <ul className="flex flex-col gap-4">
                {[
                  "Absolutely Free: No delivery fees, no hidden charges—just fast, reliable service.",
                  "Real-Time Tracking: Stay updated every step of the way with live order tracking.",
                  "Reliable Delivery Partners: We’ve partnered with trusted couriers to ensure your packages",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-4">
                    {/* Check icon */}
                    <svg
                      className="w-6 h-6 text-primary shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                      <path
                        d="M16.707 9.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L10 14.586l5.293-5.293a1 1 0 011.414 0z"
                        fill="white"
                      />
                    </svg>
                    <span className="pt-0.5">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default AboutFeatures;
