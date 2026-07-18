import { redirect } from "@/i18n/routing";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Product",
};


export default async function ProductIndexPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  redirect({ href: "/shop", locale });
}
