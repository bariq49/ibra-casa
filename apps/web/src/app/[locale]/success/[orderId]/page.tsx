import { Link } from "@/i18n/routing";
import Image from "next/image";
import {
  ChevronRight,
  Home,
  CreditCard,
  Package,
  Truck,
  ArrowRight,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import PriceFormatter from "@/components/common/products/PriceFormatter";
import Container from "@/components/common/Container";
import QualityPriority from "@/components/common/QualityPriority";
import { fetchOrderByIdAction, verifyStripeSessionAction } from "@/app/actions/orders";
import { getServerSession } from "@/lib/auth";
import { successIcon } from "@/images";
import type { Metadata } from "next";


export async function generateMetadata({ params }: { params: Promise<{ orderId: string }> }): Promise<Metadata> {
  return {
    title: "Order Success Details"
  };
}


export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string; locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const unwrappedParams = await params;
  const orderId = unwrappedParams.orderId;
  const { session_id: sessionId } = await searchParams;

  // Check if user is logged in
  const { isLoggedIn } = await getServerSession();

  // If Stripe redirected with session_id, verify payment even when webhook was missed
  if (sessionId) {
    await verifyStripeSessionAction(orderId, sessionId);
  }

  // Server-side fetch (guest orders are publicly readable by ID)
  const orderResponse = await fetchOrderByIdAction(orderId);
  const order = orderResponse?.success ? orderResponse.order : null;

  if (!order) {
    return (
      <Container className="container py-24 flex justify-center items-center flex-col min-h-[50vh]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="font-urbanist font-bold text-2xl mb-2">
          Order Not Found
        </h2>
        <p className="font-dm-sans text-slate-500 mb-6 text-center max-w-md">
          We couldn't find the order you're looking for. This order may not
          exist, or you may not have permission to view it.
        </p>
        <div className="flex gap-4">
          {isLoggedIn ? (
            <Link href="/user/orders">
              <button className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary-dark transition-colors">
                View My Orders
              </button>
            </Link>
          ) : null}
          <Link href="/">
            <button className="bg-slate-200 text-slate-700 font-bold px-8 py-3 rounded-full hover:bg-slate-300 transition-colors">
              Return Home
            </button>
          </Link>
        </div>
      </Container>
    );
  }
  const isPaymentPending = order.paymentStatus === "pending";

  const computedSubtotal =
    order.subtotal ||
    order.items?.reduce(
      (sum: number, item: any) => sum + item.price * (item.quantity || 1),
      0,
    ) ||
    0;
  const displayTax = Number(order.tax) || 0;
  const displayShipping =
    order.shipping !== undefined
      ? order.shipping
      : Math.max(0, order.total - computedSubtotal - displayTax);

  // Prefer rate saved on the order; fall back to tax ÷ subtotal for older orders
  const rawTaxRate =
    typeof order.taxRate === "number" && order.taxRate > 0
      ? order.taxRate
      : computedSubtotal > 0 && displayTax > 0
        ? displayTax / computedSubtotal
        : 0;
  const vatPercentage = Math.round(rawTaxRate * 10000) / 100; // e.g. 2 or 2.5
  const vatLabel =
    vatPercentage % 1 === 0
      ? String(vatPercentage)
      : vatPercentage.toFixed(2).replace(/\.?0+$/, "");

  return (
    <div className="min-h-screen pb-16">
      <Container className="container pt-8 pb-12">
        <div className="breadcrumb hidden md:block">
          <div className="flex items-center gap-1 sm:gap-2 text-sm text-muted-foreground pb-4 mb-4">
            <Link href="/" className="hover:text-primary transition-colors">
              <Home className="size-4" />
            </Link>
            <ChevronRight className="size-4" />
            <span className="font-medium">Pages</span>
            <ChevronRight className="size-4" />
            <span className="font-medium text-primary">Order Success</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          {/* Main Success Content */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white rounded-[24px] p-8 md:p-10 flex flex-col items-center justify-center text-center shadow-sm border border-border">
              <div className="mb-6 flex justify-center items-center">
                <Image
                  src={successIcon}
                  alt="Order Success Icon"
                  className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] object-contain"
                  priority
                />
              </div>
              <h1 className="font-urbanist font-bold text-3xl md:text-4xl text-light-primary-text mb-3">
                Thanks For Your Order
              </h1>
              <p className="font-dm-sans text-light-secondary-text text-[16px] max-w-lg mx-auto mb-6">
                We're excited to let you know that we've received your order and
                it's now being processed.
              </p>

              <Link href="/">
                <button className="h-[48px] px-8 bg-primary hover:bg-primary-dark text-white font-dm-sans font-bold text-[16px] rounded-[80px] shadow-sm transition-all">
                  Back to Home
                </button>
              </Link>

              {isPaymentPending && (
                <div className="w-full max-w-sm bg-warning-lighter border border-warning-light rounded-2xl p-6 flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-2 text-warning-dark font-bold">
                    <CreditCard className="w-5 h-5" />
                    <span>Payment Pending</span>
                  </div>
                  <p className="text-sm text-warning-dark text-left">
                    Your order is confirmed, but we are awaiting payment to
                    begin shipping.
                  </p>
                  <Link href={`/checkout/payment/${orderId}`}>
                    <button className="w-full h-[48px] bg-primary hover:bg-primary-dark text-white font-dm-sans font-bold text-[16px] rounded-[80px] shadow-sm transition-all">
                      Pay Now
                    </button>
                  </Link>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Order Details card */}
              <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-border flex flex-col gap-6">
                <h3 className="font-urbanist font-bold text-[20px] text-light-primary-text border-b border-border pb-4">
                  Order Details
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between font-dm-sans text-[15px]">
                    <span className="text-light-secondary-text">Order ID:</span>
                    <span className="text-light-primary-text font-medium">
                      #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between font-dm-sans text-[15px]">
                    <span className="text-light-secondary-text">
                      Order status:
                    </span>
                    <span className="text-warning font-medium capitalize">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between font-dm-sans text-[15px]">
                    <span className="text-light-secondary-text">
                      Amount Payable:
                    </span>
                    <span className="text-light-primary-text font-medium whitespace-nowrap">
                      <PriceFormatter amount={order.total} />{" "}
                      {isPaymentPending ? "(Pending)" : "(Paid)"}
                    </span>
                  </div>
                  <div className="flex justify-between font-dm-sans text-[15px]">
                    <span className="text-light-secondary-text">
                      Order Date:
                    </span>
                    <span className="text-light-primary-text font-medium">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipment Address card */}
              <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-border flex flex-col gap-6">
                <h3 className="font-urbanist font-bold text-[20px] text-light-primary-text border-b border-border pb-4">
                  Shipment Address
                </h3>
                <div className="font-dm-sans text-[15px] flex flex-col gap-3">
                  <p className="flex items-center gap-3 text-light-primary-text font-medium">
                    <User className="size-4 text-light-secondary-text" />
                    {order.shippingAddress?.firstName}{" "}
                    {order.shippingAddress?.lastName}
                  </p>
                  <p className="flex items-center gap-3 text-light-secondary-text">
                    <Phone className="size-4" />
                    {order.shippingAddress?.phoneNumber || "N/A"}
                  </p>
                  <p className="flex items-center gap-3 text-light-secondary-text">
                    <Mail className="size-4" />
                    {order.shippingAddress?.emailAddress || "N/A"}
                  </p>
                  <p className="flex items-start gap-3 justify-start text-light-secondary-text leading-relaxed">
                    <MapPin className="size-4 shrink-0 mt-1" />
                    <span>
                      {order.shippingAddress?.street
                        ? `${order.shippingAddress.street}, `
                        : ""}
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state}{" "}
                      {order.shippingAddress?.postalCode ||
                        order.shippingAddress?.zipCode}{" "}
                      <br />
                      {order.shippingAddress?.country}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-border">
              <h3 className="font-urbanist font-bold text-[24px] text-light-primary-text mb-6">
                Give us a feedback
              </h3>
              <form className="flex flex-col gap-4">
                <textarea
                  placeholder="Share your experience*"
                  className="w-full h-[120px] rounded-[16px] border border-border p-4 font-dm-sans text-[15px] outline-none focus:border-primary resize-none placeholder:text-light-disabled-text"
                ></textarea>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name *"
                    className="h-[52px] rounded-[80px] border border-border px-6 font-dm-sans text-[15px] outline-none focus:border-primary placeholder:text-light-disabled-text"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    className="h-[52px] rounded-[80px] border border-border px-6 font-dm-sans text-[15px] outline-none focus:border-primary placeholder:text-light-disabled-text"
                  />
                </div>
                <button
                  type="button"
                  className="h-[52px] mt-2 px-10 bg-primary-light hover:brightness-95 text-foreground font-dm-sans font-bold text-[16px] rounded-[80px] shadow-sm transition-all w-fit"
                >
                  Send Now
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-border flex flex-col gap-6 sticky top-24">
              <div className="flex items-center gap-3">
                <div className="bg-muted p-3 rounded-full">
                  <Package className="w-6 h-6 text-slate-700" />
                </div>
                <h3 className="font-urbanist font-bold text-2xl text-light-primary-text">
                  Order Items
                </h3>
              </div>

              <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-2">
                {order.items?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-4 items-center p-3 border border-border rounded-[16px]"
                  >
                    <div className="relative size-[72px] bg-muted rounded-[8px] overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <Image
                        src={item.image || "/placeholder.jpg"}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 gap-1">
                      <span className="font-dm-sans font-bold text-[16px] leading-[22px] text-light-primary-text line-clamp-1">
                        {item.name}
                      </span>
                      <span className="font-dm-sans text-[14px] leading-[20px] text-light-secondary-text">
                        Qty: {item.quantity}
                      </span>
                    </div>
                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className="font-urbanist font-bold text-[16px] text-light-primary-text">
                        <PriceFormatter amount={item.price * item.quantity} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-border w-full my-2"></div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center font-dm-sans text-[15px] text-light-secondary-text">
                  <span>Sub-Total</span>
                  <span className="text-light-primary-text font-medium border-b border-transparent">
                    <PriceFormatter amount={computedSubtotal} />
                  </span>
                </div>
                {displayTax > 0 && (
                  <div className="flex justify-between items-center font-dm-sans text-[15px] text-light-secondary-text">
                    <span>VAT ({vatLabel}%)</span>
                    <span className="text-light-primary-text font-medium">
                      <PriceFormatter amount={displayTax} />
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center font-dm-sans text-[15px] text-light-secondary-text">
                  <span>Shipment</span>
                  <span className="text-light-primary-text font-medium">
                    <PriceFormatter amount={displayShipping} />
                  </span>
                </div>

                <div className="flex justify-between items-center font-urbanist font-bold text-[20px] text-primary mt-2 pt-4 border-t border-border">
                  <span>
                    {isPaymentPending ? "Total Payable" : "Total Paid"}
                  </span>
                  <span>
                    <PriceFormatter amount={order.total} />
                  </span>
                </div>
              </div>

              {/* <div className="flex flex-col gap-3 mt-4">
                <Link href={`/user/orders/${order._id}`} className="w-full">
                  <button className="w-full h-[52px] bg-primary hover:bg-primary-dark text-white font-dm-sans font-bold text-[16px] rounded-[80px] transition-all flex items-center justify-center gap-2">
                    Track Order
                  </button>
                </Link>
                <Link href="/user/orders" className="w-full">
                  <button className="w-full h-[52px] bg-slate-900 hover:bg-slate-800 text-white font-dm-sans font-bold text-[16px] rounded-[80px] transition-all flex items-center justify-center gap-2">
                    View All Orders <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </Container>

      {/* Features Banner representing Free Shipping, 24x7 Support, etc. extracted from Figma Layout */}
      {/* <QualityPriority /> */}
    </div>
  );
}
