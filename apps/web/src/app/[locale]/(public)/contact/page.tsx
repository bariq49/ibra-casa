import React from "react";
import Breadcrumb from "@/components/product/Breadcrumb";
import { homeIcon } from "@/images";
import ContactDetails from "@/components/contact/ContactDetails";
import ContactFormClient from "@/components/contact/ContactFormClient";
import Container from "@/components/common/Container";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const breadcrumbItems = [
    { label: "Home", href: "/", icon: homeIcon },
    { label: "Contact us" },
  ];

  return (
    <Container className="w-full bg-white relative pb-0 flex flex-col">
      <Breadcrumb items={breadcrumbItems} />

      <div className="w-full flex flex-col items-center mt-12 mb-20 px-4">

        <div className="flex flex-col lg:flex-row gap-8 w-full container items-stretch">
          {/* Left: Contact Details */}
          <div className="w-full lg:w-[40%]">
            <ContactDetails />
          </div>

          {/* Right: Contact Form */}
          <div className="w-full lg:w-[60%]">
            <ContactFormClient />
          </div>
        </div>
      </div>
    </Container>
  );
}
