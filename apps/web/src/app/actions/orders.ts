import api from "@/lib/api";
import { ORDER_ENDPOINTS } from "@/constants/endpoints";

// Orders are user-specific and frequently updated (status changes, fulfilment timeline).
// They must never be cached by the Next.js Data Cache.
const NO_CACHE = { cache: "no-store" as const, next: { revalidate: 0 } };

export async function fetchMyOrdersAction() {
  try {
    const res = await api.get("/api/orders", NO_CACHE);

    if (res.data) {
      return {
        success: true,
        orders: res.data,
      };
    }

    return { success: false, message: "Failed to fetch orders" };
  } catch (error: any) {
    console.error("Fetch Orders Error:", error.data || error.message);
    return {
      success: false,
      message: error.data?.message || "Internal server action error",
    };
  }
}

export async function fetchOrderByIdAction(orderId: string) {
  try {
    const res = await api.get(`/api/orders/${orderId}`, NO_CACHE);

    if (res.data) {
      return {
        success: true,
        order: res.data,
      };
    }

    return { success: false, message: "Failed to fetch order details" };
  } catch (error: any) {
    console.error("Fetch Order Error:", error.data || error.message);
    return {
      success: false,
      message: error.data?.message || "Internal server action error",
    };
  }
}

export async function verifyStripeSessionAction(
  orderId: string,
  sessionId: string,
) {
  try {
    const res = await api.post(
      "/api/payments/verify-session",
      { orderId, sessionId },
      NO_CACHE,
    );
    return {
      success: Boolean(res.data?.success),
      order: res.data?.order,
      message: res.data?.message,
    };
  } catch (error: any) {
    console.error("Verify Stripe Session Error:", error.data || error.message);
    return {
      success: false,
      message: error.data?.message || "Failed to verify Stripe session",
    };
  }
}
