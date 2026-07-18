import { useStoreSettingsStore } from "@/store/useStoreSettingsStore";
import { calculateCartTotals, type CartTotalsOptions } from "@/lib/priceUtils";
import { currencyMeta } from "@/lib/storeCurrency";
import type { CartItem } from "@/store/useCartStore";

/** Currency symbol from Admin → Settings */
export function useStoreCurrencySymbol(): string {
  const currency = useStoreSettingsStore((s) => s.currency);
  return currencyMeta(currency).symbol;
}

/** Pricing options derived from Admin → Settings (tax, shipping, free delivery). */
export function useStorePricingOptions(): CartTotalsOptions {
  const taxRate = useStoreSettingsStore((s) => s.taxRate);
  const shippingCost = useStoreSettingsStore((s) => s.shippingCost);
  const freeDeliveryThreshold = useStoreSettingsStore(
    (s) => s.freeDeliveryThreshold,
  );

  return {
    taxRate,
    shippingCost,
    freeDeliveryThreshold,
  };
}

export function useCartTotalsFromStore(cartItems: CartItem[]) {
  const options = useStorePricingOptions();
  return calculateCartTotals(cartItems, options);
}
