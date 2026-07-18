export interface PriceDetails {
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  discountPercentage: number;
}

export type VariantOption = {
  priceModifier?: number;
};

/** Price for a product base + selected size/color/weight modifiers. */
export function calculateVariantPrice(
  basePrice: number,
  discountPercentage: number = 0,
  options: {
    size?: VariantOption | null;
    color?: VariantOption | null;
    weight?: VariantOption | null;
  } = {},
): PriceDetails {
  const modifier =
    (options.size?.priceModifier ?? 0) +
    (options.color?.priceModifier ?? 0) +
    (options.weight?.priceModifier ?? 0);

  const originalPrice = parseFloat((basePrice + modifier).toFixed(2));
  const discountedPrice = parseFloat(
    (originalPrice * (1 - (discountPercentage || 0) / 100)).toFixed(2),
  );
  const discountAmount = parseFloat(
    (originalPrice - discountedPrice).toFixed(2),
  );

  return {
    originalPrice,
    discountedPrice,
    discountAmount: discountAmount > 0 ? discountAmount : 0,
    discountPercentage: discountPercentage || 0,
  };
}

/**
 * Global utility to calculate product prices accurately from various fallback models.
 * Ensures identical price structures across Product Cards, Cart, Checkout, and Success.
 */
export function calculateProductPrice(product: any): PriceDetails {
  if (!product) {
    return {
      originalPrice: 0,
      discountedPrice: 0,
      discountAmount: 0,
      discountPercentage: 0,
    };
  }

  // 1. Detect base original price
  const pOldPrice = product.price || product.oldPrice || 0;

  // 2. Detect discount percentage
  const pDiscountPercentage = product.discountPercentage || product.discount || 0;

  // 3. Determine definitive discounted price
  let pCurrentPrice = product.currentPrice;
  if (pCurrentPrice === undefined || pCurrentPrice === null) {
    pCurrentPrice = parseFloat((pOldPrice * (1 - pDiscountPercentage / 100)).toFixed(2));
  }

  // If product just has a currentPrice and no oldPrice, make oldPrice match currentPrice to prevent negative discounts
  const definitiveOriginalPrice = pOldPrice < pCurrentPrice ? pCurrentPrice : pOldPrice;
  const definitiveDiscountAmount = parseFloat((definitiveOriginalPrice - pCurrentPrice).toFixed(2));

  return {
    originalPrice: definitiveOriginalPrice,
    discountedPrice: pCurrentPrice,
    discountAmount: definitiveDiscountAmount > 0 ? definitiveDiscountAmount : 0,
    discountPercentage: pDiscountPercentage,
  };
}

export interface CartTotals {
  subtotalOriginal: number; // Subtotal if no discounts were applied
  subtotalDiscounted: number; // The subtotal after discount
  totalDiscount: number; // The sum of (original - discounted) * quantity
  vatPercentage: number;
  taxAmount: number;
  shippingCost: number;
  totalPayable: number;
}

export type CartTotalsOptions = {
  /** Tax rate as fraction 0–1 (e.g. 0.1 = 10%). Overrides NEXT_PUBLIC_VAT_PERCENTAGE. */
  taxRate?: number;
  /** Flat shipping cost. Overrides NEXT_PUBLIC_SHIPPING_COST. */
  shippingCost?: number;
  /** Subtotal at/above this gets free shipping. */
  freeDeliveryThreshold?: number;
};

/**
 * Global utility to calculate cart totals (Subtotal, Discount, VAT, Shipping, Total)
 */
export function calculateCartTotals(
  cartItems: any[],
  options: CartTotalsOptions = {},
): CartTotals {
  let subtotalOriginal = 0;
  let subtotalDiscounted = 0;
  let totalDiscount = 0;

  cartItems.forEach((item) => {
    if (item?.product) {
      const product = item.product;
      const basePrice =
        Number(product.price) ||
        Number(product.oldPrice) ||
        Number(product.currentPrice) ||
        0;
      const discountPercentage =
        Number(product.discountPercentage) || Number(product.discount) || 0;

      // Prefer line variant modifiers when present; otherwise fall back to stored product pricing
      const hasModifiers =
        item.size?.priceModifier != null ||
        item.color?.priceModifier != null ||
        item.weight?.priceModifier != null;

      const prices = hasModifiers
        ? calculateVariantPrice(basePrice, discountPercentage, {
            size: item.size,
            color: item.color,
            weight: item.weight,
          })
        : calculateProductPrice(product);

      const qty = Number(item.quantity) || 1;
      subtotalOriginal += prices.originalPrice * qty;
      subtotalDiscounted += prices.discountedPrice * qty;
      totalDiscount += prices.discountAmount * qty;
    }
  });

  const taxRate =
    typeof options.taxRate === "number"
      ? options.taxRate
      : Number(process.env.NEXT_PUBLIC_VAT_PERCENTAGE || 0) / 100;
  const taxAmount = subtotalDiscounted * taxRate;
  const vatPercentage = taxRate * 100;

  let shippingCost =
    typeof options.shippingCost === "number"
      ? options.shippingCost
      : Number(process.env.NEXT_PUBLIC_SHIPPING_COST || 0);

  const threshold = options.freeDeliveryThreshold;
  if (
    typeof threshold === "number" &&
    threshold > 0 &&
    subtotalDiscounted >= threshold
  ) {
    shippingCost = 0;
  }

  const totalPayable = subtotalDiscounted + taxAmount + shippingCost;

  return {
    subtotalOriginal,
    subtotalDiscounted,
    totalDiscount,
    vatPercentage,
    taxAmount,
    shippingCost,
    totalPayable,
  };
}
