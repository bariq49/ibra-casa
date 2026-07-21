import React from "react";
import Breadcrumb from "@/components/product/Breadcrumb";
import FaqAccordion from "@/components/faq/FaqAccordion";
import SupportInfo from "@/components/home/SupportInfo";
import Container from "@/components/common/Container";
import { homeIcon } from "@/images";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
};

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const breadcrumbItems = [
    { label: "Home", href: "/", icon: homeIcon },
    { label: "FAQ" },
  ];

  return (
    <Container className="w-full bg-white relative pb-0 flex flex-col">
      <Breadcrumb items={breadcrumbItems} />
      <FaqAccordion />
      <SupportInfo />
    </Container>
  );
}
