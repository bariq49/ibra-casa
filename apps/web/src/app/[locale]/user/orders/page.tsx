import React from "react";
import { fetchMyOrdersAction } from "@/app/actions/orders";
import { OrdersListClient } from "@/components/user/OrdersListClient";
import type { Metadata } from "next";

// User's order list is per-user and changes as new orders/status updates arrive.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Orders",
};

export default async function OrderHistoryPage() {
  const result = await fetchMyOrdersAction();
  const initialOrders = result.success ? result.orders : [];

  return (
    <div className="flex flex-col w-full h-full">
      <OrdersListClient initialOrders={initialOrders} />
    </div>
  );
}
