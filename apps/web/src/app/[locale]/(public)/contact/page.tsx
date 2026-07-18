import React from "react";
import Breadcrumb from "@/components/product/Breadcrumb";
import { homeIcon } from "@/images";
import ContactDetails from "@/components/contact/ContactDetails";
import ContactFormClient from "@/components/contact/ContactFormClient";
import Container from "@/components/common/Container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getServerSession } from "@/lib/auth";
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

  const { isLoggedIn } = await getServerSession();

  const breadcrumbItems = [
    { label: "Home", href: "/", icon: homeIcon },
    { label: "Contact us" },
  ];

  let contactConfig = {
    title: "We are happy to assist you",
    subtitle: "Here to help, anytime you need us.",
    faqs: [
      {
        q: "1. What payment methods do you accept?",
        a: "We accept all major credit/debit cards, PayPal, and bank transfers. Your payment information is encrypted and processed securely.",
      },
      {
        q: "2. How can I track my order?",
        a: "Once your order is dispatched you will receive a tracking link via email. You can also track it from the 'My Orders' section of your account.",
      },
    ],
  };

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/contact-page`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const parsed = await res.json();
      if (parsed?.success && parsed.data) {
        // Fallback to static text only if API fields are missing
        contactConfig.title = parsed.data.title || contactConfig.title;
        contactConfig.subtitle = parsed.data.subtitle || contactConfig.subtitle;
        contactConfig.faqs = parsed.data.faqs?.length ? parsed.data.faqs : contactConfig.faqs;
      }
    }
  } catch (error) {
    console.error("Failed to fetch contact page config", error);
  }

  return (
    <Container className="w-full bg-white relative pb-0 flex flex-col overflow-x-hidden">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero Section */}
      <div className="w-full flex flex-col items-center mt-12 px-4">
        <div className="text-center max-w-[600px] mb-12">
          <h1 className="text-3xl md:text-4xl font-urbanist font-bold text-light-primary-text mb-3">
            {contactConfig.title}
          </h1>
          <p className="text-base text-light-secondary-text font-dm-sans">
            {contactConfig.subtitle}
          </p>
        </div>

        {/* Contact Info Cards */}
        <ContactDetails />
      </div>

      {/* Contact Form Section */}
      <div className="w-full relative mt-16 mb-20 overflow-hidden flex flex-col items-center">
        {/* SVG Background (Desktop Only) */}
        <div className="hidden lg:block absolute inset-0 z-0 overflow-hidden">
          <svg
            className="w-full h-full"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1728 779"
            fill="none"
          >
            <path
              d="M1728 731C1728 757.51 1706.51 779 1680 779H48C21.4904 779 0 757.51 0 731V48C0 21.4903 21.4903 0 48 0H464.229C490.65 0 511.137 22.4607 523.036 46.0506C540.075 79.8315 575.081 103 615.5 103H1112.5C1152.92 103 1187.92 79.8315 1204.96 46.0506C1216.86 22.4607 1237.35 0 1263.77 0H1680C1706.51 0 1728 21.4903 1728 48V731Z"
              fill="#9EE872"
            />
          </svg>
        </div>

        {/* Solid Background (Mobile/Tablet Only) */}
        <div className="absolute inset-0 z-0 bg-success-light lg:hidden rounded-3xl mx-4" />

        <div className="relative z-10 w-full pt-10 lg:pt-5 pb-16 lg:pb-20 px-8 flex flex-col items-center">
          <div className="text-center mb-10 lg:mb-16 w-full max-w-[500px]">
            <h2 className="text-3xl md:text-4xl font-urbanist font-bold text-light-primary-text mb-2 lg:mb-3">
              Contact Us
            </h2>
            <p className="text-base text-light-secondary-text font-dm-sans">
              We&apos;d love to hear from you!
            </p>
          </div>

          <div className="w-full max-w-[800px]">
            {/* ← Client component: only the interactive form */}
            <ContactFormClient isLoggedIn={isLoggedIn} source="contact" />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="w-full max-w-[800px] mx-auto py-20 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-urbanist font-bold text-light-primary-text mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-light-secondary-text font-dm-sans">
            Find quick answers to common questions.
          </p>
        </div>

        <div className="w-full border-t border-gray-200">
          <Accordion type="single" collapsible defaultValue="item-0">
            {contactConfig.faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="py-2 border-b border-border"
              >
                <AccordionTrigger className="hover:no-underline px-4">
                  <h3 className="text-lg font-urbanist font-bold text-light-primary-text text-left">
                    {faq.q}
                  </h3>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="text-base text-light-secondary-text font-dm-sans pr-10">
                    {faq.a}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </Container>
  );
}
