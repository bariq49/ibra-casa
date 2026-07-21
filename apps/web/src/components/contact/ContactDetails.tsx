import React from "react";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { APP_DEFAULTS } from "@/constants/app-defaults";

const ContactDetails = () => {
  const { email, phone, address, website } = APP_DEFAULTS.footer;

  const details = [
    {
      label: "Email",
      value: email,
      icon: Mail,
    },
    {
      label: "Phone",
      value: phone,
      icon: Phone,
    },
    {
      label: "Address",
      value: address,
      icon: MapPin,
    },
    {
      label: "Website",
      value: website,
      icon: Globe,
    },
  ];

  return (
    <div className="w-full bg-white rounded-[24px] p-6 sm:p-8 md:p-10 flex flex-col gap-6 md:gap-8 shadow-sm border border-gray-100 h-full">
      <div>
        <p className="text-sm font-bold font-dm-sans tracking-[0.2em] uppercase text-warning mb-2">
          Get in touch
        </p>
        <h2 className="text-2xl md:text-3xl font-bold font-urbanist text-light-primary-text leading-snug mb-3">
          Contact Information
          <span className="text-warning">.</span>
        </h2>
        <p className="text-sm md:text-base text-light-secondary-text font-dm-sans leading-relaxed">
          Reach out anytime — we&apos;re happy to help with orders, products, or
          anything else about Ibra Casa.
        </p>
        <div className="mt-5 h-0.5 w-14 bg-warning rounded-full" />
      </div>

      <div className="flex flex-col gap-6 md:gap-8">
        {details.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-light-primary-text font-urbanist mb-1 uppercase tracking-wide">
                {label}
              </p>
              <p className="text-sm text-light-secondary-text font-dm-sans break-all sm:break-normal">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactDetails;
