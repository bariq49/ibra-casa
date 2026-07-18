"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { useCartStore } from "@/store/useCartStore";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Check,
  User,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
} from "lucide-react";

export function OrderDetailClient({ order }: { order: any }) {
  const router = useRouter();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const { addToCart } = useCartStore();

  // Hide the refresh button once the order reaches a terminal state.
  const isTerminalStatus =
    order.status === "delivered" ||
    order.status === "completed" ||
    order.status === "cancelled";

  const handleRefreshStatus = () => {
    startRefresh(() => {
      // Re-runs the server component (page.tsx) and re-fetches the order.
      router.refresh();
      toast.success("Order status refreshed");
    });
  };

  const handlePayNow = async () => {
    try {
      setIsProcessingPayment(true);
      const { data } = await api.post("/api/payments/create-checkout-session", {
        orderId: order._id,
      });
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to initialize payment",
      );
      setIsProcessingPayment(false);
    }
  };

  const handleOrderAgain = () => {
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

  // Mapping statuses from the backend model:
  // pending -> address_confirmed -> confirmed -> packed -> delivering -> delivered -> completed / cancelled

  const getTimelineStatus = () => {
    const statuses = [
      {
        id: "pending",
        label: "Order Placed",
        desc: "Thank you for your order! We've successfully received it and will begin preparing everything to ensure a smooth and timely delivery.",
        date: order.createdAt,
      },
      {
        id: "confirmed",
        label: "Processing",
        desc: "We're currently reviewing your order details and checking the availability of the items. Hang tight — we'll start packing soon!",
        date: order.status_updates?.order_confirmed?.at,
      },
      {
        id: "paid",
        label: "Payment",
        desc: "Your payment is being securely processed and verified. This may take a few moments. We'll notify you as soon as it's confirmed.",
        condition: order.paymentStatus === "paid",
        date: order.paidAt || order.payment_info?.paidAt,
      },
      {
        id: "packed",
        label: "Packing",
        desc: "Our team is now carefully packing your items to make sure everything arrives in perfect condition. Quality is our priority!",
        date: order.status_updates?.packed?.at,
      },
      {
        id: "delivering",
        label: "Delivering",
        desc: "Your order is on the move! It's currently being delivered to your address. Keep an eye out — it's almost there.",
        date: order.status_updates?.delivering?.at,
      },
      {
        id: "delivered",
        label: "Delivered",
        desc: "Your order has been successfully delivered. We hope everything arrived safely and that you love your purchase. Thank you for choosing us!",
        date:
          order.status_updates?.delivered?.at ||
          order.status_updates?.completed?.at,
      },
    ];
    return statuses;
  };

  const timeline = getTimelineStatus();

  // Calculate pricing breakdown
  const subtotal =
    order.subtotal ||
    order.items.reduce(
      (acc: number, item: any) => acc + (item.price * item.quantity || 0),
      0,
    );
  const total = order.total;
  const tax = order.tax || 0;
  // If order was created before shipping was tracked on the root order document, try to deduce it:
  const displayShipping =
    order.shipping !== undefined
      ? order.shipping
      : Math.max(0, total - subtotal - tax);

  const isCompletedStep = (stepId: string) => {
    const progression = [
      "pending",
      "address_confirmed",
      "confirmed",
      "packed",
      "delivering",
      "delivered",
      "completed",
    ];
    const currentIdx = progression.indexOf(order.status);
    const stepIdx = progression.indexOf(stepId);

    if (stepId === "paid") return order.paymentStatus === "paid";

    return currentIdx >= stepIdx;
  };

  return (
    <div className="flex flex-col gap-[32px] w-full max-w-[1293px]">
      {/* Back Header */}
      <div className="flex gap-[24px] items-center w-full">
        <Link href="/user/orders">
          <button className="border border-light-disabled-text/24 rounded-[80px] w-[48px] h-[48px] flex items-center justify-center hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-[24px] h-[24px] text-light-primary-text" />
          </button>
        </Link>
        <div className="flex items-center gap-[20px] font-urbanist text-[24px] font-bold text-light-primary-text leading-[36px]">
          <span>Order ID</span>
          <span>:</span>
          <span
            className="cursor-pointer hover:text-primary transition-colors active:text-primary/80 group flex items-center gap-2"
            onClick={() => {
              navigator.clipboard.writeText(order._id);
              toast.success("Order ID copied to clipboard!");
            }}
            title="Click to copy Order ID"
          >
            #{order._id}
          </span>
          {!isTerminalStatus && (
            <button
              type="button"
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              title="Refresh order status"
              aria-label="Refresh order status"
              className="ml-2 inline-flex items-center justify-center w-[40px] h-[40px] rounded-full border border-light-disabled-text/24 hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-[18px] h-[18px] text-light-primary-text ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      {order.status !== "cancelled" && (
        <div className="bg-white border border-light-disabled-text/24 rounded-[16px] overflow-hidden flex flex-col w-full">
          <div className="bg-light-bg px-[24px] py-[16px] flex items-center justify-center">
            <h2 className="font-urbanist text-[20px] font-bold text-light-primary-text w-full">
              Timeline
            </h2>
          </div>
          <div className="px-[24px] pt-[40px] pb-[24px] flex flex-col w-full relative">
            {timeline.map((step, index) => {
              const completed = isCompletedStep(step.id);
              const isLast = index === timeline.length - 1;

              return (
                <div
                  key={step.id}
                  className="flex gap-[16px] xl:gap-[24px] w-full items-start relative pb-0 z-10 min-h-[90px]"
                >
                  {/* Time info */}
                  <div className="w-[60px] xl:w-[85px] pt-1 text-right text-[12px] xl:text-[14px] leading-[18px] xl:leading-[22px] text-light-secondary-text">
                    {completed && step.date ? (
                      <>
                        <p className="mb-0">
                          {new Date(step.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p>
                          {new Date(step.date).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </>
                    ) : completed ? (
                      <p>Done</p>
                    ) : (
                      <p>----:-----</p>
                    )}
                  </div>

                  {/* Timeline Graphic */}
                  <div className="flex flex-col items-center shrink-0 self-stretch relative w-[20px] pt-1">
                    {!isLast && (
                      <div className="absolute top-[28px] bottom-[-4px] left-1/2 w-[2px] -ml-px bg-gray-400 -z-10" />
                    )}
                    {!isLast &&
                      completed &&
                      timeline[index + 1] &&
                      isCompletedStep(timeline[index + 1].id) && (
                        <div className="absolute top-[28px] bottom-[-4px] left-1/2 w-[2px] -ml-px bg-primary -z-10" />
                      )}

                    <div
                      className={`w-[20px] h-[20px] rounded-full flex items-center justify-center ${completed ? "bg-primary border-2 border-primary" : "bg-white border-2 border-gray-400"} z-10 shrink-0`}
                    >
                      {completed && (
                        <Check
                          className="w-[12px] h-[12px] text-white shrink-0"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col gap-[4px] xl:gap-[8px] pb-[32px]">
                    <p
                      className={`text-[14px] xl:text-[16px] font-semibold leading-[20px] xl:leading-[24px] ${completed ? "text-light-primary-text" : "text-light-secondary-text"}`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[14px] font-normal leading-[22px] text-light-secondary-text">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shipment Address */}
      <div className="bg-white border border-light-disabled-text/24 rounded-[16px] overflow-hidden flex flex-col w-full">
        <div className="bg-light-bg px-[24px] py-[16px] flex items-center justify-center">
          <h2 className="font-urbanist text-[20px] font-bold text-light-primary-text w-full">
            Shipment Address
          </h2>
        </div>
        <div className="p-[24px] flex flex-col gap-[20px] w-full">
          <div className="flex items-start gap-[10px] w-full">
            <User className="w-[24px] h-[24px] text-[#78662d35869f055d35502df41a2822f89d6af36e] shrink-0" />
            <span className="text-[16px] text-light-primary-text">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </span>
          </div>
          <div className="flex items-start gap-[10px] w-full">
            <Phone className="w-[24px] h-[24px] text-muted-foreground shrink-0" />
            <span className="text-[16px] text-light-primary-text">
              {order.shippingAddress.phoneNumber}
            </span>
          </div>
          <div className="flex items-start gap-[10px] w-full">
            <MapPin className="w-[24px] h-[24px] text-muted-foreground shrink-0" />
            <span className="text-[16px] text-light-primary-text">
              {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.state}, {order.shippingAddress.zipCode},{" "}
              {order.shippingAddress.country}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-light-disabled-text/24 rounded-[16px] overflow-hidden flex flex-col w-full">
        <div className="bg-light-bg px-[24px] py-[16px] flex items-center justify-center">
          <h2 className="font-urbanist text-[20px] font-bold text-light-primary-text w-full">
            Order Items
          </h2>
        </div>
        <div className="p-[24px] flex flex-col gap-[24px] w-full">
          <div className="flex flex-col gap-[16px] w-full">
            {order.items.map((item: any, idx: number) => (
              <div key={item._id || idx}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center w-full min-h-[120px] py-4 gap-4 sm:gap-0">
                  <div className="flex flex-1 gap-[16px] items-start sm:items-center w-full">
                    <div className="w-[120px] h-[120px] shrink-0 bg-muted/20 rounded-[8px] overflow-hidden relative">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted/40" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-[8px]">
                      <span className="text-[16px] font-semibold text-light-primary-text leading-[24px]">
                        {item.name}
                      </span>
                      {/* Subtitle/Category if we had it */}
                      {item.productId?.category && (
                        <span className="text-[14px] text-light-secondary-text">
                          Product
                        </span>
                      )}
                    </div>
                    <div className="flex flex-row sm:flex-col gap-[8px] sm:gap-[16px] items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                      <div className="flex items-center gap-[12px] text-[16px] leading-[24px]">
                        {/* Fake old price, we just use real price */}
                        <span className="font-semibold text-light-primary-text">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-[16px] text-[16px] leading-[24px]">
                        <span className="font-normal text-light-secondary-text">
                          Quantity
                        </span>
                        <span className="font-semibold text-light-primary-text">
                          :
                        </span>
                        <span className="font-normal text-light-primary-text">
                          {item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {idx < order.items.length - 1 && (
                  <div className="h-px bg-light-disabled-text/24 w-full" />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleOrderAgain}
            className="w-full border border-success/48 rounded-[80px] py-[11px] hover:bg-muted/50 transition-colors"
          >
            <span className="text-[16px] font-semibold text-primary leading-[26px]">
              Create another order with these items
            </span>
          </button>
        </div>
      </div>

      {/* Order Information (Totals) */}
      <div className="bg-white border border-light-disabled-text/24 rounded-[16px] overflow-hidden flex flex-col w-full">
        <div className="bg-light-bg px-[24px] py-[16px] flex items-center justify-center">
          <h2 className="font-urbanist text-[20px] font-bold text-light-primary-text w-full">
            Order Information
          </h2>
        </div>
        <div className="p-[24px] flex flex-col w-full">
          <div className="flex flex-col gap-[40px] w-full">
            <div className="flex flex-col gap-[20px] w-full">
              <div className="flex items-center w-full text-[16px] font-normal leading-[24px]">
                <span className="w-[200px] text-light-secondary-text">
                  Order
                </span>
                <span className="flex-1 text-right text-light-primary-text">
                  #{order._id}
                </span>
              </div>
              <div className="flex items-center w-full text-[16px] font-normal leading-[24px]">
                <span className="w-[200px] text-light-secondary-text">
                  Order At
                </span>
                <span className="flex-1 text-right text-light-primary-text">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center w-full text-[16px] font-normal leading-[24px]">
                <span className="w-[200px] text-light-secondary-text">
                  Subtotal (MRP)
                </span>
                <span className="flex-1 text-right text-light-primary-text">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center w-full text-[16px] font-normal leading-[24px]">
                <span className="w-[200px] text-light-secondary-text">
                  Delivery Charge
                </span>
                <span
                  className={`flex-1 text-right ${displayShipping === 0 ? "text-success-dark" : "text-light-primary-text"}`}
                >
                  {displayShipping === 0
                    ? "Free"
                    : `$${displayShipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center w-full text-[16px] font-normal leading-[24px]">
                <span className="w-[200px] text-light-secondary-text">VAT</span>
                <span className="flex-1 text-right text-light-primary-text">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-light-disabled-text/24 w-full" />
              <div className="flex items-center w-full font-urbanist text-[20px] font-bold leading-[30px]">
                <span className="flex-1 text-light-secondary-text">
                  {order.paymentStatus === "pending"
                    ? "Total Payable"
                    : "Total Paid"}
                </span>
                <span className="flex-1 text-right text-light-primary-text">
                  ${order.total.toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-light-disabled-text/24 w-full" />
            </div>

            <div className="flex flex-col sm:flex-row gap-[16px] sm:gap-[40px] w-full">
              {["pending", "address_confirmed"].includes(order.status) && (
                <button
                  onClick={async () => {
                    if (
                      confirm("Are you sure you want to cancel this order?")
                    ) {
                      try {
                        await api.put(`/api/orders/${order._id}/status`, {
                          status: "cancelled",
                        });
                        toast.success("Order cancelled successfully");
                        window.location.reload();
                      } catch (e: any) {
                        toast.error(
                          e.response?.data?.message || "Failed to cancel order",
                        );
                      }
                    }
                  }}
                  className="flex-1 border border-destructive/48 rounded-[80px] py-[11px] flex items-center justify-center hover:bg-muted/50 transition-colors w-full"
                >
                  <span className="text-[16px] font-semibold text-error leading-[26px] text-center w-full">
                    Cancel Order
                  </span>
                </button>
              )}
              {order.paymentStatus !== "paid" &&
                order.paymentMethod === "stripe" && (
                  <button
                    onClick={handlePayNow}
                    disabled={isProcessingPayment}
                    className="flex-1 border border-warning/48 rounded-[80px] py-[11px] flex items-center justify-center bg-warning text-white hover:bg-warning/90 transition-colors w-full disabled:opacity-50"
                  >
                    <span className="text-[16px] font-semibold leading-[26px] text-center w-full">
                      {isProcessingPayment ? "Processing..." : "Pay Now"}
                    </span>
                  </button>
                )}
              <button className="flex-1 border border-success/48 rounded-[80px] py-[11px] flex items-center justify-center hover:bg-muted/50 transition-colors w-full">
                <span className="text-[16px] font-semibold text-primary leading-[26px] text-center w-full">
                  Download your invoice
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
