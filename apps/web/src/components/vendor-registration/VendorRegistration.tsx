import VendorHero from "./sections/VendorHero";
import VendorFeatures from "./sections/VendorFeatures";
import CustomerSatisfaction from "./sections/CustomerSatisfaction";
import HowItWorks from "./sections/HowItWorks";
import Breadcrumb from "@/components/product/Breadcrumb";
import { homeIcon } from "@/images";

type VendorState =
  | "loading"
  | "not_applied"
  | "pending"
  | "approved"
  | "rejected";

interface VendorRegistrationProps {
  initialVendorState?: VendorState;
}

export default function VendorRegistration({
  initialVendorState,
}: VendorRegistrationProps) {
  const breadcrumbItems = [
    { label: "Home", href: "/", icon: homeIcon },
    { label: "Vendor Page" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="w-full h-full flex flex-col space-y-10 md:space-y-16 relative pb-10">
        <VendorHero initialVendorState={initialVendorState} />
        <VendorFeatures />
        <CustomerSatisfaction />
        <HowItWorks />
      </div>
    </>
  );
}
