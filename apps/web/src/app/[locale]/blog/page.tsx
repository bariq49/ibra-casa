import { redirect } from "next/navigation";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Blog",
};


export default async function BlogRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/blogs`);
}
