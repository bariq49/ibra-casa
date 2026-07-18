import Image from "next/image";
import Container from "@/components/common/Container";
import { freeShippingIcon, supportIcon, deliveryReturnIcon } from "@/images";

const qualityFeatures = [
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
];

const QualityPriority = () => {
  return (
    <Container className="w-full relative mt-16 mb-20 overflow-hidden flex flex-col items-center">
      {/* SVG Background (Desktop Only) */}
      <div className="hidden lg:block absolute inset-0 z-0 overflow-hidden">
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1728 450"
          fill="none"
        >
          <path
            d="M1728 402C1728 428.51 1706.51 450 1680 450H48C21.4904 450 0 428.51 0 402V48C0 21.4903 21.4903 0 48 0H464.229C490.65 0 511.137 22.4607 523.036 46.0506C540.075 79.8315 575.081 103 615.5 103H1112.5C1152.92 103 1187.92 79.8315 1204.96 46.0506C1216.86 22.4607 1237.35 0 1263.77 0H1680C1706.51 0 1728 21.4903 1728 48V402Z"
            fill="#FFD6EF"
          />
        </svg>
      </div>

      {/* Solid Background (Mobile/Tablet Only) */}
      <div className="absolute inset-0 z-0 bg-primary-lighter lg:hidden rounded-3xl mx-4" />

      <div className="relative z-10 w-full pb-16 lg:pb-20 flex flex-col items-center max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-16">
          <h2 className="text-3xl md:text-4xl font-urbanist font-bold text-light-primary-text mb-2 lg:mb-4">
            Quality is our priority
          </h2>
          <p className="text-base font-dm-sans text-light-secondary-text">
            Because you deserve nothing less than the best.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch justify-center w-full gap-6">
          {qualityFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex-1 bg-white rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-warning-lighter rounded-full mb-6 flex items-center justify-center shrink-0">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <h3 className="text-xl font-urbanist font-bold text-light-primary-text mb-2">
                {feature.title}
              </h3>
              <p className="text-sm font-dm-sans text-light-secondary-text leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default QualityPriority;
