"use client";

import React from "react";
import { Truck, Headset, RefreshCcw, ShieldCheck } from "lucide-react";
import { motion, Variants } from "motion/react";
import Container from "../common/Container";

const SUPPORT_ITEMS = [
  {
    id: 1,
    icon: Truck,
    title: "Free Shipping",
    description: "Enjoy the Convenience of free shipping on every order",
  },
  {
    id: 2,
    icon: Headset,
    title: "24/7 Support",
    description: "Round-the-Clock Assistance, Anytime You Need It",
  },
  {
    id: 3,
    icon: RefreshCcw,
    title: "30 Days Return",
    description:
      "Your Satisfaction is Our Priority: Return Any Product Within 30 Days",
  },
  {
    id: 4,
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "Seamless Shopping Backed by Safe and Secure Payment Options",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const SupportInfo = () => {
  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {SUPPORT_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center justify-center gap-3 lg:gap-4 bg-white border border-gray-300 rounded-[16px] p-6 lg:p-4 xl:p-[24px] w-full"
              variants={itemVariants}
            >
              <span className="inline-flex shrink-0 items-center justify-center size-[52px] lg:size-[44px] xl:size-[56px] bg-warning-lighter rounded-full">
                <item.icon className="size-[26px] lg:size-[22px] xl:size-[32px] text-light-primary-text/80" />
              </span>
              <div className="flex flex-col gap-1.5 lg:gap-1 xl:gap-2 items-center text-center w-full">
                <h5 className="font-['Urbanist',sans-serif] text-[18px] lg:text-[16px] xl:text-[20px] font-bold leading-tight xl:leading-[30px] text-light-primary-text w-full">
                  {item.title}
                </h5>
                <p className="font-['DM_Sans',sans-serif] text-[15px] lg:text-[13px] xl:text-[16px] font-normal leading-snug xl:leading-[24px] text-light-secondary-text w-full">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};

export default SupportInfo;
