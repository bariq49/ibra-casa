"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import api, { ApiError } from "@/lib/api";
import PriceFormatter from "@/components/common/products/PriceFormatter";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
  Check,
  PackageCheck,
  ShoppingBag,
  Phone,
} from "lucide-react";

const STATUS_PROGRESSION = [
  "pending",
  "address_confirmed",
  "confirmed",
  "processing",
  "packed",
  "delivering",
  "delivered",
  "completed",
] as const;

const KNOWN_STATUSES = new Set<string>([
  ...STATUS_PROGRESSION,
  "cancelled",
]);

const KNOWN_PAYMENT_STATUSES = new Set([
  "pending",
  "paid",
  "failed",
  "refunded",
  "cod_collected",
]);

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  address_confirmed: <MapPin className="w-4 h-4" />,
  confirmed: <CheckCircle2 className="w-4 h-4" />,
  processing: <Loader2 className="w-4 h-4" />,
  packed: <PackageCheck className="w-4 h-4" />,
  delivering: <Truck className="w-4 h-4" />,
  delivered: <Package className="w-4 h-4" />,
  completed: <CheckCircle2 className="w-4 h-4" />,
  cancelled: <AlertCircle className="w-4 h-4" />,
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/15 text-warning-dark border-warning/30",
  address_confirmed: "bg-info/15 text-info-dark border-info/30",
  confirmed: "bg-primary/15 text-primary-dark border-primary/30",
  processing: "bg-primary/15 text-primary-dark border-primary/30",
  packed: "bg-info/15 text-info-dark border-info/30",
  delivering: "bg-secondary/15 text-secondary border-secondary/30",
  delivered: "bg-success/15 text-success-dark border-success/30",
  completed: "bg-success/15 text-success-dark border-success/30",
  cancelled: "bg-error/15 text-error-dark border-error/30",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-warning/15 text-warning-dark",
  paid: "bg-success/15 text-success-dark",
  failed: "bg-error/15 text-error-dark",
  refunded: "bg-info/15 text-info-dark",
  cod_collected: "bg-success/15 text-success-dark",
};

function resolveStatus(status: unknown): string {
  return typeof status === "string" && KNOWN_STATUSES.has(status)
    ? status
    : "pending";
}

function resolvePaymentStatus(status: unknown): string {
  return typeof status === "string" && KNOWN_PAYMENT_STATUSES.has(status)
    ? status
    : "pending";
}

function stepDate(order: any, status: string): string | undefined {
  if (status === "pending") return order.createdAt;
  if (status === "confirmed")
    return (
      order.status_updates?.order_confirmed?.at ||
      order.status_updates?.confirmed?.at
    );
  if (status === "address_confirmed")
    return order.status_updates?.address_confirmed?.at;
  return order.status_updates?.[status]?.at;
}

interface OrderTrackingClientProps {
  isLoggedIn?: boolean;
}

export function OrderTrackingClient({}: OrderTrackingClientProps) {
  const t = useTranslations("OrderTracking");

  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trackOrder = useCallback(async () => {
    const trimmedId = orderId.trim().replace(/^#/, "");
    if (!trimmedId) {
      setError(t("noOrderId"));
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const { data } = await api.get(
        `/api/orders/track/${encodeURIComponent(trimmedId)}`,
      );
      if (data && typeof data === "object" && !Array.isArray(data) && data._id) {
        setOrder(data);
      } else {
        setError(t("orderNotFound"));
      }
    } catch (err: unknown) {
      const status =
        err instanceof ApiError
          ? err.status
          : (err as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 403 || status === 401) {
        setError(t("orderNotFound"));
      } else {
        setError(t("errorFetching"));
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, t]);

  const displayOrder = order;
  const orderStatus = resolveStatus(displayOrder?.status);
  const paymentStatus = resolvePaymentStatus(displayOrder?.paymentStatus);

  const isCompletedStep = (stepId: string) => {
    if (!displayOrder) return false;
    const currentIdx = STATUS_PROGRESSION.indexOf(
      orderStatus as (typeof STATUS_PROGRESSION)[number],
    );
    const stepIdx = STATUS_PROGRESSION.indexOf(
      stepId as (typeof STATUS_PROGRESSION)[number],
    );
    if (currentIdx === -1 || stepIdx === -1) return false;
    return currentIdx >= stepIdx;
  };

  return (
    <div className="flex flex-col gap-8 pt-10 pb-12 animate-in fade-in duration-500">
      {/* Header + search */}
      <div className="max-w-3xl mx-auto w-full text-center space-y-5">
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-urbanist text-3xl md:text-4xl font-bold text-light-primary-text tracking-tight">
            {t("title")}
          </h1>
          <p className="text-light-secondary-text text-[15px] md:text-base leading-relaxed max-w-xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="relative group w-full text-left">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary-light/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white border border-light-disabled-text/24 rounded-2xl shadow-sm group-focus-within:shadow-lg group-focus-within:border-primary/30 transition-all duration-300 overflow-hidden">
            <div className="flex items-center">
              <div className="pl-5">
                <Search className="w-5 h-5 text-light-disabled-text group-focus-within:text-primary transition-colors duration-300" />
              </div>
              <input
                id="order-tracking-input"
                type="text"
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && trackOrder()}
                placeholder={t("orderIdPlaceholder")}
                className="flex-1 px-4 py-4 text-[15px] bg-transparent border-none outline-none text-light-primary-text placeholder:text-light-disabled-text"
              />
              <button
                id="track-order-button"
                onClick={trackOrder}
                disabled={loading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 m-1.5 rounded-xl font-semibold text-sm hover:bg-primary-dark disabled:opacity-50 transition-all duration-300 shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">{t("tracking")}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("trackButton")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-error/10 border border-error/20 text-error-dark px-5 py-3.5 rounded-xl animate-in slide-in-from-top-2 fade-in duration-300 text-left">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Results — side by side on desktop */}
      {displayOrder && (
        <div className="max-w-6xl mx-auto w-full animate-in slide-in-from-bottom-4 fade-in duration-500 space-y-6">
          {/* Status overview strip */}
          <div className="bg-white border border-light-disabled-text/24 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-primary-light/5 px-5 py-5 md:px-8 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${STATUS_COLORS[orderStatus] || "bg-muted text-muted-foreground"}`}
                >
                  {STATUS_ICONS[orderStatus] || <Package className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm text-light-secondary-text">
                    {t("orderStatus")}
                  </p>
                  <p className="font-urbanist text-xl font-bold text-light-primary-text capitalize">
                    {t(`statuses.${orderStatus}`)}
                  </p>
                </div>
              </div>
              <div
                className={`inline-flex self-start sm:self-auto items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${STATUS_COLORS[orderStatus] || "bg-muted"}`}
              >
                {STATUS_ICONS[orderStatus]}
                {t(`statuses.${orderStatus}`)}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-light-disabled-text/16">
              <div className="px-5 py-4 md:px-6 md:py-5">
                <p className="text-xs text-light-disabled-text uppercase tracking-wider mb-1">
                  {t("orderId")}
                </p>
                <p className="text-sm font-bold text-light-primary-text font-mono">
                  #
                  {String(displayOrder._id)
                    .substring(String(displayOrder._id).length - 8)
                    .toUpperCase()}
                </p>
              </div>
              <div className="px-5 py-4 md:px-6 md:py-5">
                <p className="text-xs text-light-disabled-text uppercase tracking-wider mb-1">
                  {t("orderDate")}
                </p>
                <p className="text-sm font-semibold text-light-primary-text">
                  {new Date(displayOrder.createdAt).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
              <div className="px-5 py-4 md:px-6 md:py-5">
                <p className="text-xs text-light-disabled-text uppercase tracking-wider mb-1">
                  {t("totalAmount")}
                </p>
                <p className="text-sm font-bold text-light-primary-text">
                  <PriceFormatter amount={displayOrder.total} />
                </p>
              </div>
              <div className="px-5 py-4 md:px-6 md:py-5">
                <p className="text-xs text-light-disabled-text uppercase tracking-wider mb-1">
                  {t("paymentStatus")}
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${PAYMENT_COLORS[paymentStatus] || "bg-muted text-muted-foreground"}`}
                >
                  {(paymentStatus === "paid" ||
                    paymentStatus === "cod_collected") && (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  {t(`paymentStatuses.${paymentStatus}`)}
                </span>
              </div>
            </div>
          </div>

          {/* Two-column: timeline | items + address */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Timeline */}
            <div className="lg:col-span-5">
              {orderStatus === "cancelled" ? (
                <div className="bg-error/5 border border-error/20 rounded-2xl p-6 flex items-center gap-4 h-full">
                  <div className="w-12 h-12 rounded-xl bg-error/15 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6 text-error" />
                  </div>
                  <div>
                    <p className="font-urbanist text-lg font-bold text-error">
                      {t("statuses.cancelled")}
                    </p>
                    <p className="text-sm text-error-dark/70 mt-0.5">
                      {displayOrder.status_updates?.cancelled?.at
                        ? new Date(
                            displayOrder.status_updates.cancelled.at,
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-light-disabled-text/24 rounded-2xl overflow-hidden lg:sticky lg:top-24">
                  <div className="px-5 py-4 md:px-6 border-b border-light-disabled-text/16">
                    <h2 className="font-urbanist text-lg font-bold text-light-primary-text">
                      {t("timeline")}
                    </h2>
                  </div>
                  <div className="px-5 md:px-6 py-5">
                    <div className="flex flex-col">
                      {STATUS_PROGRESSION.map((status, index) => {
                        const completed = isCompletedStep(status);
                        const isCurrent = orderStatus === status;
                        const isLast =
                          index === STATUS_PROGRESSION.length - 1;
                        const date = stepDate(displayOrder, status);
                        const nextDone =
                          !isLast &&
                          isCompletedStep(STATUS_PROGRESSION[index + 1]);

                        return (
                          <div
                            key={status}
                            className="flex items-start gap-3 relative"
                          >
                            {!isLast && (
                              <div className="absolute left-[15px] top-[32px] bottom-0 w-0.5">
                                <div
                                  className={`w-full h-full ${completed && nextDone ? "bg-primary" : "bg-light-disabled-text/24"}`}
                                />
                              </div>
                            )}

                            <div
                              className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                                completed
                                  ? isCurrent
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "bg-primary/15 text-primary"
                                  : "bg-muted text-light-disabled-text"
                              }`}
                            >
                              {completed ? (
                                isCurrent ? (
                                  STATUS_ICONS[status]
                                ) : (
                                  <Check
                                    className="w-3.5 h-3.5"
                                    strokeWidth={3}
                                  />
                                )
                              ) : (
                                STATUS_ICONS[status]
                              )}
                            </div>

                            <div
                              className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-5"}`}
                            >
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-sm font-semibold ${completed ? "text-light-primary-text" : "text-light-disabled-text"}`}
                                >
                                  {t(`statuses.${status}`)}
                                </p>
                                {isCurrent && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                                  </span>
                                )}
                              </div>
                              {completed && date && (
                                <p className="text-xs text-light-secondary-text mt-0.5">
                                  {new Date(date).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}{" "}
                                  at{" "}
                                  {new Date(date).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Items + shipping */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-white border border-light-disabled-text/24 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 md:px-6 border-b border-light-disabled-text/16">
                  <h2 className="font-urbanist text-lg font-bold text-light-primary-text">
                    {t("items")} ({displayOrder.items?.length || 0})
                  </h2>
                </div>
                <div className="divide-y divide-light-disabled-text/16">
                  {displayOrder.items?.map((item: any, idx: number) => (
                    <div
                      key={item._id || idx}
                      className="flex items-center gap-4 px-5 py-4 md:px-6"
                    >
                      <div className="w-16 h-16 rounded-xl bg-muted/40 overflow-hidden shrink-0 relative">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-light-disabled-text" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-light-primary-text truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-light-secondary-text mt-0.5">
                          {t("quantity")}: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-light-primary-text shrink-0">
                        <PriceFormatter
                          amount={item.price * item.quantity}
                        />
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {displayOrder.shippingAddress && (
                <div className="bg-white border border-light-disabled-text/24 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 md:px-6 border-b border-light-disabled-text/16">
                    <h2 className="font-urbanist text-lg font-bold text-light-primary-text">
                      {t("shippingAddress")}
                    </h2>
                  </div>
                  <div className="px-5 py-5 md:px-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-sm text-light-primary-text leading-relaxed min-w-0">
                        <p className="font-semibold">
                          {displayOrder.shippingAddress.firstName}{" "}
                          {displayOrder.shippingAddress.lastName}
                        </p>
                        <p className="text-light-secondary-text mt-1">
                          {[
                            displayOrder.shippingAddress.address ||
                              displayOrder.shippingAddress.street ||
                              displayOrder.shippingAddress.apartment,
                            displayOrder.shippingAddress.city,
                            displayOrder.shippingAddress.state,
                            displayOrder.shippingAddress.zipCode ||
                              displayOrder.shippingAddress.postalCode,
                            displayOrder.shippingAddress.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {displayOrder.shippingAddress.phoneNumber && (
                          <p className="text-light-secondary-text mt-2 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            {displayOrder.shippingAddress.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
