import React from "react";
import { fetchOrderByIdAction } from "@/app/actions/orders";
import { OrderDetailClient } from "@/components/user/OrderDetailClient";
import type { Metadata } from "next";

// Order detail is user-specific and live-updated (status timeline). Never cache.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderId: string }>;
}): Promise<Metadata> {
  return {
    title: "Orders Details",
  };
}

export default async function OrderSinglePage(props: {
  params: Promise<{
    orderId: string;
    locale: string;
  }>;
}) {
  const params = await props.params;
  const result = await fetchOrderByIdAction(params.orderId);

  if (!result.success || !result.order) {
    return (
      <div className="flex flex-col w-full h-full p-8 text-center text-muted-foreground">
        <p>Order not found or you do not have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <OrderDetailClient order={result.order} />
    </div>
  );
}
