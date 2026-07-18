"use client";
import Image from "next/image";
import { vendorPartnerImage } from "@/images";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Plus, Minus } from "lucide-react";

const faqData = [
  {
    id: "item-1",
    title: "1. Submit your application",
    content:
      "We're always here to help you. Whether you have a question, need support, or just want to learn more about our services, our team is ready to assist you every step of the way.",
  },
  {
    id: "item-2",
    title: "2. Get verified",
    content:
      "Our team will review your application and verify your details to ensure a safe and trustworthy marketplace for everyone.",
  },
  {
    id: "item-3",
    title: "3. Set up your shop",
    content:
      "Once approved, customize your storefront, add your products, and set your policies to start attracting customers.",
  },
  {
    id: "item-4",
    title: "4. Start selling and growing",
    content:
      "Launch your products to our large customer base. Utilize our marketing tools and analytics to scale your business efficiently.",
  },
];

export default function HowItWorks() {
  return (
    <div className="flex flex-col xl:flex-row items-center justify-between w-full gap-[40px] xl:gap-[113px] px-[24px] lg:px-0">
      {/* Left: image */}
      <div className="h-[300px] lg:h-[580px] relative rounded-[24px] lg:rounded-[48px] shrink-0 w-full lg:w-[715px] overflow-hidden">
        <Image
          src={vendorPartnerImage}
          alt="How it works"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Right: content */}
      <div className="flex flex-col gap-[40px] items-start justify-center flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-col gap-[12px] w-full">
          {/* Label badge */}
          <div className="bg-[rgba(0,171,85,0.08)] flex gap-[10px] items-center justify-center px-[12px] py-[6px] rounded-[100px] w-fit">
            <div className="relative shrink-0 w-[15px] h-[15px]">
              <div className="absolute inset-0 bg-primary rounded-full" />
            </div>
            <p className="font-public-sans font-semibold text-primary text-[16px] leading-[24px] whitespace-nowrap">
              Partner Process
            </p>
          </div>

          <h2 className="font-urbanist font-bold text-light-primary-text text-[28px] leading-[36px] lg:text-[32px] lg:leading-[48px]">
            How It Works
          </h2>
          <p className="font-public-sans text-light-secondary-text text-[16px] leading-[24px]">
            Getting started is simple. Apply to become a vendor, set up your
            store, and start selling. We&apos;ll guide you through every step,
            so you can focus on growing your business.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="flex flex-col w-full">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-1"
          >
            {faqData.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-b border-gray-300 py-[16px] last:border-b-0"
              >
                <AccordionTrigger className="hover:no-underline py-0 outline-none flex items-center justify-between [&>svg]:hidden group">
                  <span className="font-public-sans font-semibold text-light-primary-text text-[16px] leading-[24px] text-left">
                    {item.title}
                  </span>
                  <div className="w-[24px] h-[24px] shrink-0 text-light-primary-text ml-[28px] relative">
                    <Plus className="w-full h-full absolute inset-0 transition-opacity duration-200 group-data-[state=open]:opacity-0 opacity-100" />
                    <Minus className="w-full h-full absolute inset-0 transition-opacity duration-200 group-data-[state=open]:opacity-100 opacity-0" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0 pt-[16px]">
                  <p className="font-public-sans text-light-secondary-text text-[16px] leading-[24px]">
                    {item.content}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
