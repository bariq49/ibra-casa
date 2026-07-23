"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useCartStore, CartItem } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useHeaderStore } from "@/store/useHeaderStore";
import { ChevronRight, Home } from "lucide-react";
import PriceFormatter from "@/components/common/products/PriceFormatter";
import ShipmentAddressForm from "./ShipmentAddressForm";
import SelectedAddressCard from "./SelectedAddressCard";
import AddressSidebar from "./AddressSidebar";
import Container from "../common/Container";
import api from "@/lib/api";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import OrderProcessingModal, { OrderStep } from "./OrderProcessingModal";
import { calculateProductPrice, calculateVariantPrice } from "@/lib/priceUtils";
import {
  useCartTotalsFromStore,
} from "@/hooks/useStorePricing";

interface CheckoutClientProps {
  isLoggedIn: boolean;
}

export interface Address {
  _id: string;
  isDefault?: boolean;
  [key: string]: any; // Allow fallback for other generic fields
}

const CheckoutClient = ({
  isLoggedIn: serverIsLoggedIn,
}: CheckoutClientProps) => {
  const { cartItems } = useCartStore();
  const { isAuthenticated: clientIsAuth, user } = useAuthStore();
  const { onAuthOpen } = useHeaderStore();

  const [mounted, setMounted] = useState(false);
  const [hasValidAddress, setHasValidAddress] = useState(false);
  const [addressSidebarOpen, setAddressSidebarOpen] = useState(false);
  const [addressSidebarMode, setAddressSidebarMode] = useState<"list" | "add">(
    "list",
  );
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderStatus, setOrderStatus] = useState<{
    step: OrderStep;
    message: string;
  } | null>(null);
  const [checkoutSnapshot, setCheckoutSnapshot] = useState<CartItem[] | null>(null);
  const [guestAddress, setGuestAddress] = useState<Record<string, any> | null>(
    null,
  );
  const router = useRouter();

  const isLoggedIn = serverIsLoggedIn || clientIsAuth;
  const activeCartItems = checkoutSnapshot || cartItems;
  const {
    subtotalDiscounted,
    totalDiscount,
    vatPercentage,
    taxAmount,
    shippingCost,
    totalPayable,
  } = useCartTotalsFromStore(activeCartItems);

  // Auto-detect if user has a default address or fallback to first
  const existingAddresses: Address[] = user?.addresses || [];
  const defaultAddress =
    existingAddresses.find((a) => a.isDefault) || existingAddresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddress ? defaultAddress._id : null,
  );

  // Keep `hasValidAddress` in sync if they have *any* address selected
  useEffect(() => {
    if (isLoggedIn && selectedAddressId) {
      setHasValidAddress(true);
    } else if (isLoggedIn && !selectedAddressId) {
      setHasValidAddress(false);
    }
  }, [selectedAddressId, isLoggedIn]);

  // Ensure whenever the user explicitly modifies their address list, the active index tracks gracefully
  useEffect(() => {
    if (!selectedAddressId && defaultAddress) {
      setSelectedAddressId(defaultAddress._id);
    }
  }, [defaultAddress, selectedAddressId]);

  const activeAddressObj = existingAddresses.find(
    (a) => a._id === selectedAddressId,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to cart if empty
  useEffect(() => {
    if (
      mounted &&
      cartItems.length === 0 &&
      !isPlacingOrder &&
      !checkoutSnapshot
    ) {
      toast.error("Your cart is empty. Please add items to checkout.");
      router.push("/cart");
    }
  }, [mounted, cartItems.length, isPlacingOrder, checkoutSnapshot, router]);

  if (!mounted) return null;

  const resolveShippingAddress = (
    override?: Record<string, any> | null,
  ): {
    street: string;
    postalCode: string;
    emailAddress?: string;
    [key: string]: any;
  } | null => {
    if (override) {
      return {
        ...override,
        street: override.apartment || override.city || "N/A",
        postalCode: override.zipCode,
        emailAddress: override.emailAddress,
      };
    }
    if (isLoggedIn && activeAddressObj) {
      return {
        ...activeAddressObj,
        street: activeAddressObj.apartment || activeAddressObj.city || "N/A",
        postalCode: activeAddressObj.zipCode,
        emailAddress:
          activeAddressObj.emailAddress || user?.email || undefined,
      };
    }
    if (guestAddress) {
      return {
        ...guestAddress,
        street: guestAddress.apartment || guestAddress.city || "N/A",
        postalCode: guestAddress.zipCode,
        emailAddress: guestAddress.emailAddress,
      };
    }
    return null;
  };

  const handlePlaceOrder = async (addressOverride?: Record<string, any>) => {
    const shippingAddress = resolveShippingAddress(addressOverride || null);
    if (!shippingAddress) {
      toast.error("Please fill in your shipping address");
      return;
    }

    if (!isLoggedIn && !shippingAddress.emailAddress) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setIsPlacingOrder(true);
      setCheckoutSnapshot([...cartItems]);
      setOrderStatus({ step: "preparing", message: "Preparing your order..." });

      const itemsPayload = cartItems
        .filter((item: CartItem) => item?.product)
        .map((item: CartItem) => {
          const product = item.product as any;
          const basePrice =
            Number(product.price) ||
            Number(product.oldPrice) ||
            Number(product.currentPrice) ||
            0;
          const discountPercentage =
            Number(product.discountPercentage) ||
            Number(product.discount) ||
            0;
          const hasModifiers =
            item.size?.priceModifier != null ||
            item.color?.priceModifier != null ||
            (item as any).weight?.priceModifier != null;
          const { discountedPrice } = hasModifiers
            ? calculateVariantPrice(basePrice, discountPercentage, {
                size: item.size,
                color: item.color,
                weight: (item as any).weight,
              })
            : calculateProductPrice(product);

          return {
            _id: product._id || product.id,
            name: product.title || product.name || "Product",
            price: discountedPrice,
            quantity: item.quantity,
            image: product.image || product.images?.[0] || "",
          };
        });

      let newOrder;

      setOrderStatus({
        step: "securing",
        message: "Placing order securely...",
      });
      const payload = {
        items: itemsPayload,
        shippingAddress,
        paymentMethod: "stripe",
        ...(!isLoggedIn
          ? { guestEmail: shippingAddress.emailAddress }
          : {}),
      };
      const response = await api.post("/api/orders", payload);
      newOrder = response.data?.order;

      if (newOrder?._id) {
        setOrderStatus({
          step: "gateway",
          message: "Initializing payment gateway...",
        });
        const sessionResponse = await api.post(
          "/api/payments/create-checkout-session",
          { orderId: newOrder._id },
        );
        if (sessionResponse.data?.url) {
          setOrderStatus({
            step: "success",
            message: "Ready to Checkout. Redirecting to payment...",
          });
          await new Promise((resolve) => setTimeout(resolve, 1500));
          useCartStore.getState().clearCart();
          window.location.href = sessionResponse.data.url;
          return;
        } else {
          throw new Error("Failed to initialize Stripe checkout.");
        }
      }

      if (newOrder?._id) {
        setOrderStatus({
          step: "success",
          message: "Order placed successfully! Redirecting...",
        });
        await new Promise((resolve) => setTimeout(resolve, 1500));
        useCartStore.getState().clearCart();
        toast.success("Order placed successfully!");
        router.push(`/success/${newOrder._id}`);
      } else {
        throw new Error("Failed to retrieve order ID");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to place order.";
      setOrderStatus({
        step: "error",
        message: `Error: ${errorMessage}. Please refresh or go back.`,
      });
      toast.error(errorMessage);
      setTimeout(() => {
        setIsPlacingOrder(false);
        setCheckoutSnapshot(null);
      }, 3000);
    }
  };
  return (
    <>
      {isPlacingOrder && <OrderProcessingModal status={orderStatus} />}
      <Container className="container py-8 md:py-12">
        <div className="breadcrumb hidden md:block">
          <div className="flex items-center gap-1 sm:gap-2 text-sm text-muted-foreground pb-4 mb-6 md:mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              <Home className="size-4" />
            </Link>
            <ChevronRight className="size-4" />
            <span className="text-foreground font-medium">Pages</span>
            <ChevronRight className="size-4" />
            <span className="text-foreground font-medium">Checkout Form</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start relative w-full">
          {/* Left Column */}
          <div className="w-full xl:flex-[1_0_0] flex flex-col gap-8 md:gap-12 lg:min-w-[60%]">
            {!isLoggedIn ? (
              <div className="w-full flex flex-col bg-background border border-border rounded-[16px] overflow-hidden">
                <div className="bg-muted px-6 md:px-8 py-5 border-b border-border">
                  <h3 className="font-urbanist font-bold text-[20px] text-light-primary-text">
                    Checkout as guest
                  </h3>
                </div>
                <div className="p-6 md:p-8 flex flex-col gap-4">
                  <p className="font-dm-sans text-[15px] text-light-secondary-text">
                    You can complete your purchase without an account. Prefer a
                    saved address and order history?{" "}
                    <button
                      type="button"
                      onClick={() => onAuthOpen("login")}
                      className="text-primary font-bold hover:underline"
                    >
                      Log in
                    </button>{" "}
                    or{" "}
                    <button
                      type="button"
                      onClick={() => onAuthOpen("register")}
                      className="text-primary font-bold hover:underline"
                    >
                      create an account
                    </button>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-muted rounded-[16px] p-6 lg:p-8 flex flex-col justify-center overflow-hidden">
                <h3 className="font-urbanist font-bold text-[24px] text-light-primary-text">
                  Welcome back{user?.name ? `, ${user.name}` : ""}!
                </h3>
                <p className="font-dm-sans text-light-secondary-text text-[15px] mt-1">
                  You are securely checked into your account. Manage or add
                  shipping addresses anytime from your{" "}
                  <Link
                    href="/user/addresses"
                    className="text-primary font-semibold hover:underline"
                  >
                    dashboard
                  </Link>
                  .
                </p>
              </div>
            )}

            {/* Shipment Address Form / Card Rendering Logic */}
            {isLoggedIn && existingAddresses.length > 0 && activeAddressObj ? (
              <SelectedAddressCard
                address={activeAddressObj}
                onChangeClick={() => {
                  setAddressSidebarMode("list");
                  setAddressSidebarOpen(true);
                }}
                onAddNewClick={() => {
                  router.push("/user/addresses");
                }}
                hasMultipleAddresses={existingAddresses.length > 1}
              />
            ) : (
              <ShipmentAddressForm
                onAddressValid={setHasValidAddress}
                onGuestAddressChange={setGuestAddress}
                onProcessToPay={handlePlaceOrder}
                isProcessingPay={isPlacingOrder}
              />
            )}
            <AddressSidebar
              isOpen={addressSidebarOpen}
              onOpenChange={setAddressSidebarOpen}
              onAddressSelect={(id) => setSelectedAddressId(id)}
              selectedAddressId={selectedAddressId}
              mode={addressSidebarMode}
              onModeChange={setAddressSidebarMode}
            />
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[400px] xl:w-[420px] shrink-0 sticky top-24">
            <div className="bg-background border border-border rounded-[16px] overflow-hidden flex flex-col p-6 gap-6">
              {/* Cart Items Heading */}
              <h3 className="font-urbanist font-bold text-[24px] text-light-primary-text">
                Cart Items
              </h3>

              {/* Items List */}
              <div className="flex flex-col gap-4 w-full max-h-[380px] overflow-y-auto pr-1">
                {activeCartItems
                  .filter((item: CartItem) => item?.product)
                  .map((item: CartItem, idx: number) => {
                    const product = item.product;
                    const { originalPrice, discountedPrice } =
                      calculateProductPrice(product);

                    return (
                      <div
                        key={idx}
                        className="flex gap-4 items-center p-3 border border-border rounded-[16px]"
                      >
                        <div className="relative size-[72px] bg-muted rounded-[8px] overflow-hidden shrink-0 flex items-center justify-center p-1">
                          <Image
                            src={
                              product.image ||
                              product.images?.[0] ||
                              "/images/placeholder.png"
                            }
                            alt={product.title || product.name || "Product"}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1 gap-1">
                          <span className="font-dm-sans font-bold text-[16px] leading-[22px] text-light-primary-text line-clamp-1">
                            {product.title || product.name || "Product"}
                          </span>
                          <span className="font-dm-sans text-[14px] leading-[20px] text-light-secondary-text">
                            {item.quantity} x{" "}
                            {item.quantity === 1 ? "Pack" : "Packs"}
                          </span>
                        </div>
                        <div className="flex flex-col items-end shrink-0 pl-2">
                          {originalPrice > discountedPrice && (
                            <span className="font-urbanist text-[14px] text-light-disabled-text line-through">
                              <PriceFormatter
                                amount={originalPrice * item.quantity}
                              />
                            </span>
                          )}
                          <span className="font-urbanist font-bold text-[16px] text-success">
                            <PriceFormatter
                              amount={discountedPrice * item.quantity}
                            />
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {activeCartItems.length === 0 && (
                  <div className="text-center text-muted-foreground w-full py-6">
                    Your cart is empty.
                  </div>
                )}
              </div>

              {/* Order Summary Form */}
              <div className="bg-muted rounded-[16px] p-6 lg:p-8 flex flex-col gap-6">
                <h3 className="font-urbanist font-bold text-[20px] text-light-primary-text">
                  Order Summary
                </h3>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center font-dm-sans text-[15px] text-light-secondary-text">
                    <span>Sub-Total</span>
                    <span className="text-foreground">
                      <PriceFormatter amount={subtotalDiscounted} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-dm-sans text-[15px] text-light-secondary-text">
                    <span>Discount</span>
                    <span className="text-error">
                      {totalDiscount > 0 ? (
                        <>
                          -<PriceFormatter amount={totalDiscount} />
                        </>
                      ) : (
                        <PriceFormatter amount={0} />
                      )}
                    </span>
                  </div>
                  {vatPercentage > 0 && (
                    <div className="flex justify-between items-center font-dm-sans text-[15px] text-light-secondary-text">
                      <span>Tax ({vatPercentage}%)</span>
                      <span className="text-foreground">
                        <PriceFormatter amount={taxAmount} />
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-dm-sans text-[15px] text-light-secondary-text">
                    <span>Shipping</span>
                    <span className="text-foreground">
                      {shippingCost === 0 ? (
                        <span className="text-primary font-semibold">Free</span>
                      ) : (
                        <PriceFormatter amount={shippingCost} />
                      )}
                    </span>
                  </div>

                  <div className="h-px w-full bg-light-divider my-1" />

                  <div className="flex justify-between items-center font-urbanist font-bold text-[18px] text-light-primary-text">
                    <span>Total</span>
                    <span className="text-foreground">
                      <PriceFormatter amount={totalPayable} />
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePlaceOrder()}
                disabled={
                  activeCartItems.length === 0 ||
                  !hasValidAddress ||
                  isPlacingOrder
                }
                className="w-full h-[52px] mt-2 bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:opacity-50 text-white font-dm-sans font-bold text-[16px] rounded-[80px] shadow-color-primary transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? "Processing..." : "Process to Pay"}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default CheckoutClient;
