import CheckoutClient from "@/components/checkout/CheckoutClient";
import { getServerSession } from "@/lib/auth";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Checkout",
};


export default async function CheckoutPage() {
  const { isLoggedIn } = await getServerSession();

  return (
    <div className="bg-background min-h-screen">
      <CheckoutClient isLoggedIn={isLoggedIn} />
    </div>
  );
}
