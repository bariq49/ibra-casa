"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

export type StorePaymentSettings = {
  enableStripe: boolean;
  enableCod: boolean;
  enableBankTransfer: boolean;
  enablePaypal: boolean;
};

interface PaymentMethodsProps {
  isLoggedIn: boolean;
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  isLoggedIn,
  selectedMethod,
  onMethodChange,
}) => {
  const [settings, setSettings] = useState<StorePaymentSettings>({
    enableStripe: true,
    enableCod: true,
    enableBankTransfer: false,
    enablePaypal: false,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/api/system-metrics/store-settings");
        if (cancelled || !data?.settings) return;
        setSettings({
          enableStripe: data.settings.enableStripe !== false,
          enableCod: data.settings.enableCod !== false,
          enableBankTransfer: !!data.settings.enableBankTransfer,
          enablePaypal: !!data.settings.enablePaypal,
        });
      } catch {
        // Keep defaults if the public endpoint fails
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const methodEnabled =
      (selectedMethod === "cash" && settings.enableCod) ||
      (selectedMethod === "credit_card" && settings.enableStripe);

    if (!methodEnabled) {
      if (settings.enableStripe) onMethodChange("credit_card");
      else if (settings.enableCod) onMethodChange("cash");
    }
  }, [loaded, settings, selectedMethod, onMethodChange]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <h3 className="font-urbanist font-bold text-[20px] leading-[30px] text-light-primary-text">
        Payment
      </h3>

      {!isLoggedIn && (
        <div className="bg-muted text-light-secondary-text px-4 py-3 rounded-[8px] font-dm-sans text-[15px]">
          Checking out as a guest — your order confirmation will be sent to the
          email you provide above.
        </div>
      )}

      <fieldset
        className="flex flex-col gap-4"
      >
        {settings.enableBankTransfer && (
          <label
            className="w-full border rounded-[16px] px-6 py-4 flex items-center justify-between transition-colors border-border opacity-50 cursor-not-allowed"
            title="Currently unavailable"
          >
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="payment"
                className="size-5 accent-primary"
                disabled
              />
              <span className="font-dm-sans text-[16px] text-light-primary-text line-through">
                Bank Transfer
              </span>
            </div>
            <span className="text-xs text-light-disabled-text">Coming soon</span>
          </label>
        )}

        {settings.enableCod && (
          <label
            className={`w-full border rounded-[16px] px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${
              selectedMethod === "cash"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border"
            }`}
          >
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="payment"
                className="size-5 accent-primary"
                checked={selectedMethod === "cash"}
                onChange={() => onMethodChange("cash")}
              />
              <span className="font-dm-sans text-[16px] text-light-primary-text">
                Cash On Delivery
              </span>
            </div>
          </label>
        )}

        {settings.enableStripe && (
          <div
            className={`w-full border rounded-[16px] transition-colors p-[2px] ${
              selectedMethod === "credit_card"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border"
            }`}
          >
            <label className="flex items-center justify-between px-6 py-4 cursor-pointer w-full">
              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  name="payment"
                  className="size-5 accent-primary"
                  checked={selectedMethod === "credit_card"}
                  onChange={() => onMethodChange("credit_card")}
                />
                <span className="font-dm-sans text-[16px] text-light-primary-text">
                  Credit Card (Stripe)
                </span>
              </div>
              <div className="flex items-center font-bold text-info-dark italic">
                VISA / MASTERCARD
              </div>
            </label>
          </div>
        )}

        {settings.enablePaypal && (
          <label
            className="w-full border rounded-[16px] px-6 py-4 flex items-center justify-between transition-colors border-border opacity-50 cursor-not-allowed"
            title="Currently unavailable"
          >
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="payment"
                className="size-5 accent-primary"
                disabled
              />
              <span className="font-dm-sans text-[16px] text-light-primary-text line-through">
                PayPal
              </span>
            </div>
            <span className="text-xs text-light-disabled-text">Coming soon</span>
          </label>
        )}

        {loaded && !settings.enableStripe && !settings.enableCod && (
            <div className="bg-error-lighter text-error-dark px-4 py-3 rounded-[8px] font-dm-sans text-[15px]">
              No payment methods are available right now. Please contact support.
            </div>
          )}
      </fieldset>
    </div>
  );
};

export default PaymentMethods;
