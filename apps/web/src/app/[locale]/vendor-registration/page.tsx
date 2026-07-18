import Container from "@/components/common/Container";
import VendorRegistration from "@/components/vendor-registration/VendorRegistration";
import { setRequestLocale } from "next-intl/server";
import api from "@/lib/api";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Vendor Registration",
};


type VendorState = "loading" | "not_applied" | "pending" | "approved" | "rejected";

export default async function VendorRegistrationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // SSR fetch for initial vendor state
  let initialVendorState: VendorState = "not_applied";
  try {
    const res = await api.get("/api/vendors/me", { cache: "no-store" });
    if (res.data?.data) {
      initialVendorState = res.data.data.status;
    }
  } catch (error) {
    // Usually means unauthenticated or not applied
    initialVendorState = "not_applied";
  }

  return (
    <Container>
      <VendorRegistration initialVendorState={initialVendorState} />
    </Container>
  );
}
