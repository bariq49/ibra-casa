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
    <Container className="w-full mt-16 mb-20 flex flex-col items-center">
      <div className="w-full pb-16 lg:pb-20 flex flex-col items-center container mx-auto">
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
