import React from "react";
import Container from "@/components/common/Container";
import { OrderTrackingClient } from "@/components/order-tracking/OrderTrackingClient";
import { getServerSession } from "@/lib/auth";

export const metadata = {
  title: "Order Tracking | Sellzy",
  description:
    "Track your order in real-time. Enter your order ID to see the current status and detailed tracking information for your shipment.",
};

export default async function OrderTrackingPage() {
  const { isLoggedIn } = await getServerSession();

  return (
    <div className="min-h-screen pb-16">
      <Container>
        <OrderTrackingClient isLoggedIn={isLoggedIn} />
      </Container>
    </div>
  );
}
