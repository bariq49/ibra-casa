import React from "react";
import Image from "next/image";
import Container from "@/components/common/Container";
import {
  freeShippingIcon,
  supportIcon,
  deliveryReturnIcon,
  securePayment,
} from "@/images";

const SUPPORT_ITEMS = [
  {
    icon: freeShippingIcon,
    title: "Free Shipping",
    description: "Enjoy the Convenience of Free Shipping on Every Order",
  },
  {
    icon: supportIcon,
    title: "24x7 Support",
    description: "Round-the-Clock Assistance, Anytime You Need It",
  },
  {
    icon: deliveryReturnIcon,
    title: "30 Days Return",
    description:
      "Your Satisfaction is Our Priority: Return Any Product Within 30 Days",
  },
  {
    icon: securePayment,
    title: "Secure Payment",
    description: "Seamless Shopping Backed by Safe and Secure Payment Options",
  },
];

const QualityPriority = () => {
  return (
    <section className="relative w-full mt-10">
      {/* Full width SVG background spanning behind the section */}
      <div className="absolute top-0 left-0 w-full h-[450px] z-0 overflow-hidden rounded-2xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1728 450"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full object-cover"
        >
          <path
            d="M1728 434C1728 442.837 1720.837 450 1712 450H16C7.163 450 0 442.837 0 434V16C0 7.163 7.163 0 16 0H464.229C490.65 0 511.137 22.4607 523.036 46.0506C540.075 79.8315 575.081 103 615.5 103H1112.5C1152.92 103 1187.92 79.8315 1204.96 46.0506C1216.86 22.4607 1237.35 0 1263.77 0H1712C1719.837 0 1728 7.163 1728 16V434Z"
            fill="#F4F3F5"
          />
        </svg>
      </div>

      <Container className="relative z-10 pt-[70px] pb-[82px] min-h-[450px]">
        <div className="text-center absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[426px] z-0">
          <h2 className="font-urbanist font-bold text-[32px] leading-[48px] text-light-primary-text">
            Quality is our priority
          </h2>
          <p className="font-dm-sans text-[16px] leading-[24px] text-light-secondary-text mt-2">
            Because you deserve nothing less than the best.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-[100px]">
          {SUPPORT_ITEMS.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-[16px] p-6 lg:p-8 flex flex-col items-center text-center shadow-[0px_12px_24px_rgba(0,0,0,0.03)] border border-gray-100/50 hover:shadow-[0px_16px_32px_rgba(0,0,0,0.06)] transition-shadow duration-300"
            >
              <div className="size-[56px] rounded-[50px] bg-warning-lighter flex items-center justify-center mb-6 shrink-0 aspect-square">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h3 className="font-urbanist font-bold text-[20px] leading-[30px] text-light-primary-text mb-3">
                {item.title}
              </h3>
              <p className="font-dm-sans text-[16px] leading-[24px] text-light-secondary-text">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default QualityPriority;
