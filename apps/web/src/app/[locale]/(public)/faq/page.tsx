import React from "react";
import Breadcrumb from "@/components/product/Breadcrumb";
import FaqHero from "@/components/faq/FaqHero";
import FaqAccordion from "@/components/faq/FaqAccordion";
import ContactFormClient from "@/components/contact/ContactFormClient";
import SupportInfo from "@/components/home/SupportInfo";
import Container from "@/components/common/Container";
import { homeIcon } from "@/images";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
};

const infoData = [
  { icon: Mail, label: "Email", text: "support@example.com" },
  { icon: Phone, label: "Phone", text: "+1 (555) 123-4567" },
  {
    icon: MapPin,
    label: "Address",
    text: "123 Innovation Street, Suite 456, San Francisco, CA",
  },
  { icon: Globe, label: "Website", text: "www.createuiux.com" },
];

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { isLoggedIn } = await getServerSession();

  const breadcrumbItems = [
    { label: "Home", href: "/", icon: homeIcon },
    { label: "FAQ" },
  ];

  return (
    <Container className="w-full bg-white relative pb-0 flex flex-col overflow-x-hidden">
      {/* Breadcrumb Section */}

      <Breadcrumb items={breadcrumbItems} />

      <FaqHero />
      <FaqAccordion />

      {/* Support & Inquiries */}
      <div className="w-full relative mt-16 mb-20 overflow-hidden flex flex-col items-center">
        {/* SVG Background (Desktop Only) */}
        <div className="hidden lg:block absolute inset-0 z-0 overflow-hidden">
          <svg
            className="w-full h-full"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1728 849"
            fill="none"
          >
            <path
              d="M1728 801C1728 827.51 1706.51 849 1680 849H48C21.4904 849 0 827.51 0 801V48C0 21.4903 21.4903 0 48 0H464.229C490.65 0 511.137 22.4607 523.036 46.0506C540.075 79.8315 575.081 103 615.5 103H1112.5C1152.92 103 1187.92 79.8315 1204.96 46.0506C1216.86 22.4607 1237.35 0 1263.77 0H1680C1706.51 0 1728 21.4903 1728 48V801Z"
              fill="#FFEB69"
            />
          </svg>
        </div>

        {/* Solid Background (Mobile/Tablet Only) */}
        <div className="absolute inset-0 z-0 bg-warning-light lg:hidden rounded-3xl mx-4" />

        <div className="relative z-10 w-full pt-10 lg:pt-0 pb-12 lg:pb-20 px-8 md:px-12 lg:px-20 flex flex-col items-center">
          {/* Title & Description sitting neatly within the "gaping" dip of the SVG on desktop, regular top margin on mobile */}
          <div className="text-center mb-10 lg:mb-16 w-full max-w-[500px]">
            <h2 className="text-3xl md:text-4xl font-urbanist font-bold text-light-primary-text mb-2">
              Support & Inquiries
            </h2>
            <p className="text-base text-light-secondary-text font-dm-sans">
              Feel free to send a message if you have any questions
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 w-full mb-4">
            {/* Left Column: Contact Details */}
            <div className="w-full lg:w-[45%] bg-white rounded-[24px] p-6 sm:p-8 md:p-10 flex flex-col gap-6 md:gap-8 shadow-sm justify-center min-h-auto lg:min-h-[400px]">
              {infoData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 sm:gap-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-light-primary-text font-urbanist mb-1 uppercase tracking-wide">
                      {item.label}
                    </p>
                    <p className="text-sm text-light-secondary-text font-dm-sans break-all sm:break-normal">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Contact Form */}
            <div className="w-full lg:w-[55%]">
              <ContactFormClient isLoggedIn={isLoggedIn} source="faq" />
            </div>
          </div>
        </div>
      </div>

      <SupportInfo />
    </Container>
  );
}
