"use client";
import React from "react";
import { motion } from "motion/react";

interface SectionHeaderProps {
  title?: string;
  description?: string;
  align?: "left" | "center";
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  align = "left",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col gap-[8px] w-full max-w-[426px] ${align === "center" ? "mx-auto text-center items-center" : "xl:mt-0"}`}
    >
      <h3 className="font-bold text-light-primary-text text-[32px] leading-[48px] m-0">
        {title}
      </h3>
      {description && (
        <p className="font-normal text-light-secondary-text text-[16px] leading-[24px] m-0">
          {description}
        </p>
      )}
    </motion.div>
  );
};
