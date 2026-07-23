"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import api, { ApiError } from "@/lib/api";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  AlertCircle,
  LogIn,
  Loader2,
  Check,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import { useHeaderStore } from "@/store/useHeaderStore";

// ——— Status helpers ———
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
  pending: <Clock className="w-5 h-5" />,
  address_confirmed: <MapPin className="w-5 h-5" />,
  confirmed: <CheckCircle2 className="w-5 h-5" />,
  processing: <Loader2 className="w-5 h-5" />,
  packed: <PackageCheck className="w-5 h-5" />,
  delivering: <Truck className="w-5 h-5" />,
  delivered: <Package className="w-5 h-5" />,
  completed: <CheckCircle2 className="w-5 h-5" />,
  cancelled: <AlertCircle className="w-5 h-5" />,
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

interface OrderTrackingClientProps {
  isLoggedIn: boolean;
}

export function OrderTrackingClient({
  isLoggedIn: serverIsLoggedIn,
}: OrderTrackingClientProps) {
  const t = useTranslations("OrderTracking");
  const { onAuthOpen } = useHeaderStore();

  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isLoggedIn = serverIsLoggedIn;

  const trackOrder = useCallback(async () => {
    // UI shows short IDs like "#76BD64" — strip # so it isn't treated as a URL fragment
    const trimmedId = orderId.trim().replace(/^#/, "");
    if (!trimmedId) {
      setError(t("noOrderId"));
      return;
    }

    if (!isLoggedIn) {
      setError(t("loginRequired"));
      onAuthOpen("login");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      let found: any = null;
      const isFullObjectId = /^[0-9a-fA-F]{24}$/.test(trimmedId);

      if (isFullObjectId) {
        const { data } = await api.get(`/api/orders/${trimmedId}`);
        if (data && typeof data === "object" && !Array.isArray(data) && data._id) {
          found = data;
        }
      } else {
        // Short display ID (last 5–8 hex chars) — match against the user's orders
        const { data } = await api.get(`/api/orders`);
        const orders = Array.isArray(data) ? data : [];
        const needle = trimmedId.toUpperCase();
        found =
          orders.find((o: any) =>
            String(o?._id ?? "")
              .toUpperCase()
              .endsWith(needle),
          ) ?? null;
      }

      if (found?._id) {
        setOrder(found);
      } else {
        setError(t("orderNotFound"));
      }
    } catch (err: unknown) {
      const status =
        err instanceof ApiError
          ? err.status
          : (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setError(t("loginRequired"));
        onAuthOpen("login");
      } else if (status === 403 || status === 404) {
        setError(t("orderNotFound"));
      } else {
        setError(t("errorFetching"));
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, t, isLoggedIn, onAuthOpen]);

  const displayOrder = order;
  const orderStatus = resolveStatus(displayOrder?.status);
  const paymentStatus = resolvePaymentStatus(displayOrder?.paymentStatus);

  const isCompletedStep = (stepId: string) => {
    if (!displayOrder) return false;
    if (stepId === "paid") return paymentStatus === "paid";
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
    <div className="flex flex-col gap-8 pt-10 pb-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h1 className="font-urbanist text-3xl md:text-4xl font-bold text-light-primary-text tracking-tight">
          {t("title")}
        </h1>
        <p className="text-light-secondary-text text-[15px] md:text-base leading-relaxed">
          {t("description")}
        </p>
        {!isLoggedIn && (
          <button
            onClick={() => onAuthOpen("login")}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-primary-dark transition-all duration-300"
          >
            <LogIn className="w-4 h-4" />
            {t("loginButton")}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="relative group">
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

        {/* Error Message */}
        {error && (
          <div className="mt-4 flex items-center gap-3 bg-error/10 border border-error/20 text-error-dark px-5 py-3.5 rounded-xl animate-in slide-in-from-top-2 fade-in duration-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Order Result */}
      {displayOrder && (
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
          {/* Status Badge — Hero */}
          <div className="bg-white border border-light-disabled-text/24 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-primary-light/5 px-6 py-5 md:px-8 md:py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${STATUS_COLORS[orderStatus] || "bg-muted text-muted-foreground"}`}
                  >
                    {STATUS_ICONS[orderStatus] || (
                      <Package className="w-6 h-6" />
                    )}
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
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${STATUS_COLORS[orderStatus] || "bg-muted"}`}
                >
                  {STATUS_ICONS[orderStatus]}
                  {t(`statuses.${orderStatus}`)}
                </div>
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-light-disabled-text/16">
              <div className="px-6 py-5">
                <p className="text-xs text-light-disabled-text uppercase tracking-wider mb-1">
                  {t("orderId")}
                </p>
                <p className="text-sm font-bold text-light-primary-text font-mono">
                  #
                  {displayOrder._id
                    .substring(displayOrder._id.length - 8)
                    .toUpperCase()}
                </p>
              </div>
              <div className="px-6 py-5">
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
              <div className="px-6 py-5">
                <p className="text-xs text-light-disabled-text uppercase tracking-wider mb-1">
                  {t("totalAmount")}
                </p>
                <p className="text-sm font-bold text-light-primary-text">
                  ${displayOrder.total?.toFixed(2)}
                </p>
              </div>
              <div className="px-6 py-5">
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

          {/* Timeline */}
          {orderStatus !== "cancelled" && (
            <div className="bg-white border border-light-disabled-text/24 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 md:px-8 border-b border-light-disabled-text/16">
                <h2 className="font-urbanist text-lg font-bold text-light-primary-text">
                  {t("timeline")}
                </h2>
              </div>
              <div className="px-6 md:px-8 py-6">
                <div className="flex flex-col gap-0">
                  {STATUS_PROGRESSION.map((status, index) => {
                    const completed = isCompletedStep(status);
                    const isCurrent =
                      orderStatus === status ||
                      (status === "completed" &&
                        orderStatus === "delivered" &&
                        paymentStatus === "paid");
                    const isLast = index === STATUS_PROGRESSION.length - 1;

                    // Get date from status_updates
                    let date: string | undefined;
                    if (status === "pending") date = displayOrder.createdAt;
                    else if (status === "confirmed")
                      date =
                        displayOrder.status_updates?.order_confirmed?.at ||
                        displayOrder.status_updates?.confirmed?.at;
                    else if (status === "address_confirmed")
                      date = displayOrder.status_updates?.address_confirmed?.at;
                    else date = displayOrder.status_updates?.[status]?.at;

                    return (
                      <div
                        key={status}
                        className="flex items-start gap-4 relative"
                      >
                        {/* Timeline Line */}
                        {!isLast && (
                          <div className="absolute left-[19px] top-[40px] bottom-0 w-0.5">
                            <div
                              className={`w-full h-full ${completed && isCompletedStep(STATUS_PROGRESSION[index + 1]) ? "bg-primary" : "bg-light-disabled-text/24"}`}
                            />
                          </div>
                        )}

                        {/* Icon */}
                        <div
                          className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                            completed
                              ? isCurrent
                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                : "bg-primary/15 text-primary"
                              : "bg-muted text-light-disabled-text"
                          }`}
                        >
                          {completed ? (
                            isCurrent ? (
                              STATUS_ICONS[status]
                            ) : (
                              <Check className="w-4 h-4" strokeWidth={3} />
                            )
                          ) : (
                            STATUS_ICONS[status]
                          )}
                        </div>

                        {/* Content */}
                        <div className={`flex-1 pb-8 ${isLast ? "pb-0" : ""}`}>
                          <div className="flex items-center gap-3">
                            <p
                              className={`text-[15px] font-semibold ${completed ? "text-light-primary-text" : "text-light-disabled-text"}`}
                            >
                              {t(`statuses.${status}`)}
                            </p>
                            {isCurrent && (
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                              </span>
                            )}
                          </div>
                          {completed && date && (
                            <p className="text-xs text-light-secondary-text mt-1">
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

          {/* Cancelled Banner */}
          {orderStatus === "cancelled" && (
            <div className="bg-error/5 border border-error/20 rounded-2xl p-6 flex items-center gap-4">
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
          )}

          {/* Order Items */}
          <div className="bg-white border border-light-disabled-text/24 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 md:px-8 border-b border-light-disabled-text/16">
              <h2 className="font-urbanist text-lg font-bold text-light-primary-text">
                {t("items")} ({displayOrder.items?.length || 0})
              </h2>
            </div>
            <div className="divide-y divide-light-disabled-text/16">
              {displayOrder.items?.map((item: any, idx: number) => (
                <div
                  key={item._id || idx}
                  className="flex items-center gap-4 px-6 py-4 md:px-8 hover:bg-muted/30 transition-colors duration-200"
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
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {displayOrder.shippingAddress && (
            <div className="bg-white border border-light-disabled-text/24 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 md:px-8 border-b border-light-disabled-text/16">
                <h2 className="font-urbanist text-lg font-bold text-light-primary-text">
                  {t("shippingAddress")}
                </h2>
              </div>
              <div className="px-6 py-5 md:px-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-sm text-light-primary-text leading-relaxed">
                    <p className="font-semibold">
                      {displayOrder.shippingAddress.firstName}{" "}
                      {displayOrder.shippingAddress.lastName}
                    </p>
                    <p className="text-light-secondary-text mt-1">
                      {[
                        displayOrder.shippingAddress.address,
                        displayOrder.shippingAddress.city,
                        displayOrder.shippingAddress.state,
                        displayOrder.shippingAddress.zipCode,
                        displayOrder.shippingAddress.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {displayOrder.shippingAddress.phoneNumber && (
                      <p className="text-light-secondary-text mt-1">
                        📞 {displayOrder.shippingAddress.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Link
              href={`/user/orders/${displayOrder._id}`}
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold text-sm transition-colors duration-200 group"
            >
              {t("viewDetails")}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
