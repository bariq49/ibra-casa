"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Link, useRouter } from "@/i18n/routing";
import { Calendar, Package, Truck, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { useCartStore } from "@/store/useCartStore";
import api from "@/lib/api";
import { toast } from "sonner";

type OrderStatus =
  | "pending"
  | "address_confirmed"
  | "confirmed"
  | "packed"
  | "delivering"
  | "delivered"
  | "completed"
  | "cancelled";

const TAB_FILTERS = [
  { id: "all", label: "All" },
  { id: "processing", label: "Processing" },
  { id: "delivering", label: "Delivering" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export function OrdersListClient({ initialOrders }: { initialOrders: any[] }) {
  const [activeTab, setActiveTab] = useState("all");
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);
  const router = useRouter();
  const { addToCart } = useCartStore();

  const handlePayNow = async (orderId: string) => {
    try {
      setIsProcessingPayment(orderId);
      const { data } = await api.post("/api/payments/create-checkout-session", { orderId });
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to initialize payment");
      setIsProcessingPayment(null);
    }
  };

  const handleOrderAgain = (order: any) => {
    if (order.items && order.items.length > 0) {
      order.items.forEach((item: any) => {
        addToCart(
          {
            id: item.productId?._id || item.productId || item._id,
            title: item.name,
            currentPrice: item.price,
            oldPrice: item.price,
            image: item.image || "",
            category: item.productId?.category?.name || "Product",
            available: item.productId?.stock || 10,
            rating: item.productId?.numReviews || 0,
            stars: item.productId?.averageRating || 0,
          } as any,
          item.quantity,
        );
      });
      router.push("/cart");
    }
  };

  const filteredOrders = initialOrders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "processing") {
      return ["pending", "address_confirmed", "confirmed", "packed"].includes(
        order.status,
      );
    }
    if (activeTab === "delivering") {
      return ["delivering", "delivered"].includes(order.status);
    }
    if (activeTab === "completed") {
      return order.status === "completed";
    }
    if (activeTab === "cancelled") {
      return order.status === "cancelled";
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
      case "address_confirmed":
      case "confirmed":
      case "packed":
        return (
          <div className="bg-warning/16 h-[32px] px-[8px] rounded-[90px] flex items-center justify-center shrink-0">
            <span className="text-warning-dark text-[12px] font-normal leading-[18px]">
              Processing
            </span>
          </div>
        );
      case "delivering":
      case "delivered":
        return (
          <div className="bg-info/16 h-[32px] px-[8px] rounded-[90px] flex items-center justify-center shrink-0">
            <span className="text-info-dark text-[12px] font-normal leading-[18px]">
              Delivering
            </span>
          </div>
        );
      case "completed":
        return (
          <div className="bg-success/16 h-[32px] px-[8px] rounded-[90px] flex items-center justify-center shrink-0">
            <span className="text-success-dark text-[12px] font-normal leading-[18px]">
              Completed
            </span>
          </div>
        );
      case "cancelled":
        return (
          <div className="bg-destructive/16 h-[32px] px-[8px] rounded-[90px] flex items-center justify-center shrink-0">
            <span className="text-error-dark text-[12px] font-normal leading-[18px]">
              Cancelled
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-[24px] w-full items-start justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-light-primary-text font-urbanist text-[32px] font-bold leading-[48px]">
        Orders History
      </h1>

      <div className="bg-white rounded-[8px] flex gap-[8px] sm:gap-[16px] items-start shrink-0 p-1 w-full overflow-x-auto scrollbar-hide pb-2">
        {TAB_FILTERS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center px-[12px] sm:px-[16px] py-[8px] rounded-[8px] transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-success/8 text-primary"
                : "text-light-primary-text hover:bg-muted/50"
            }`}
          >
            <span className="text-[13px] sm:text-[14px] font-medium leading-[22px]">
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-[24px] w-full">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-[16px] text-center text-muted-foreground border border-light-divider">
            No orders found.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const productCount = order.items?.length || 0;
            // Assuming free shipping means it is calculated as 0
            const isFreeDelivery =
              order.total >
              (order.items?.reduce(
                (acc: number, item: any) => acc + item.price * item.quantity,
                0,
              ) || 0)
                ? false
                : true;

            return (
              <div key={order._id} className="flex flex-col w-full relative">
                {/* Header */}
                <div className="bg-white rounded-t-[16px] border border-light-divider border-b-0 w-full">
                  <div className="px-[24px] py-[16px] border-b border-light-disabled-text/24 flex items-center justify-between">
                    <div className="flex items-center gap-[8px]">
                      <span className="text-light-primary-text text-[16px] font-semibold leading-[24px]">
                        Order ID : #{order._id.substring(order._id.length - 5)}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="bg-white border-l border-r border-light-divider px-[24px] py-[16px] flex flex-col gap-[16px] w-full">
                  {/* Date */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 sm:gap-0">
                    <div className="flex items-center gap-[16px]">
                      <Calendar className="w-[24px] h-[24px] text-muted-foreground" />
                      <span className="text-light-primary-text text-[16px] font-normal leading-[24px]">
                        Order Date:
                      </span>
                    </div>
                    <span className="text-light-primary-text text-[16px] font-semibold leading-[24px] text-right">
                      {format(
                        new Date(order.createdAt),
                        "hh:mm a, dd MMMM, yyyy",
                      )}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 sm:gap-0">
                    <div className="flex items-center gap-[16px] sm:w-auto flex-1">
                      <Package className="w-[24px] h-[24px] text-muted-foreground" />
                      <span className="text-light-primary-text text-[16px] font-normal leading-[24px]">
                        Order Items
                      </span>
                    </div>
                    <span className="text-light-primary-text text-[16px] font-semibold leading-[24px] text-right">
                      {productCount} Products
                    </span>
                  </div>

                  {/* Delivery */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 sm:gap-0">
                    <div className="flex items-center gap-[16px] sm:w-auto flex-1">
                      <Truck className="w-[24px] h-[24px] text-muted-foreground" />
                      <span className="text-light-primary-text text-[16px] font-normal leading-[24px]">
                        Delivery Method
                      </span>
                    </div>
                    <span className="text-light-primary-text text-[16px] font-semibold leading-[24px] text-right">
                      {isFreeDelivery ? "Free Delivery" : "Standard Delivery"}
                    </span>
                  </div>

                  {/* Amount Payable */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 sm:gap-0">
                    <div className="flex items-center gap-[16px] sm:w-auto flex-1">
                      <CreditCard className="w-[24px] h-[24px] text-muted-foreground" />
                      <span className="text-light-primary-text text-[16px] font-normal leading-[24px]">
                        Amount Payable
                      </span>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-light-primary-text text-[16px] font-semibold leading-[24px]">
                        ${order.total.toFixed(2)}{" "}
                      </span>
                      <span className="text-primary text-[16px] font-semibold leading-[24px]">
                        ({order.paymentStatus === "paid" ? "Paid" : "Unpaid"})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="bg-white border rounded-b-[16px] border-light-divider p-[16px] flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 w-full">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Link href={`/user/orders/${order._id}`} className="w-full sm:w-auto">
                      <button className="flex items-center justify-center w-full sm:w-[140px] px-[16px] py-[6px] rounded-[80px] border border-light-disabled-text/32 hover:bg-muted/50 transition-colors">
                        <span className="text-light-primary-text text-[14px] font-semibold leading-[24px]">
                          View Details
                        </span>
                      </button>
                    </Link>
                    {order.paymentStatus !== "paid" && order.paymentMethod === "stripe" && (
                      <button
                        onClick={() => handlePayNow(order._id)}
                        disabled={isProcessingPayment === order._id}
                        className="flex items-center justify-center w-full sm:w-[140px] px-[16px] py-[6px] rounded-[80px] bg-warning text-white shadow-color-warning hover:bg-warning/90 transition-colors disabled:opacity-50"
                      >
                        <span className="text-white text-[14px] font-semibold leading-[24px]">
                          {isProcessingPayment === order._id ? "Processing..." : "Pay Now"}
                        </span>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleOrderAgain(order)}
                    className="flex items-center justify-center w-full sm:w-[140px] px-[16px] py-[6px] rounded-[80px] bg-primary shadow-color-primary hover:bg-primary/90 transition-colors"
                  >
                    <span className="text-white text-[14px] font-semibold leading-[24px]">
                      Order Again
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
