export interface PriceDetails {
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  discountPercentage: number;
}

export type VariantOption = {
  priceModifier?: number;
};

function isPopulatedVariant(value: unknown): value is VariantOption {
  return (
    !!value &&
    typeof value === "object" &&
    ("name" in value || "priceModifier" in value || "slug" in value)
  );
}

function firstPopulatedVariant(
  values: unknown[] | undefined | null,
): VariantOption | null {
  if (!Array.isArray(values)) return null;
  return values.find(isPopulatedVariant) ?? null;
}

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
 *
 * When size/color/weight options are present, uses the same default selection as the
 * product detail page (first of each) so listing cards match the PDP starting price.
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

  const basePrice = Number(product.price) || Number(product.oldPrice) || 0;
  const discountPercentage =
    Number(product.discountPercentage) || Number(product.discount) || 0;

  const defaultSize = firstPopulatedVariant(product.sizes);
  const defaultColor = firstPopulatedVariant(product.colors);
  const defaultWeight = firstPopulatedVariant(product.weights);

  if (defaultSize || defaultColor || defaultWeight) {
    return calculateVariantPrice(basePrice, discountPercentage, {
      size: defaultSize,
      color: defaultColor,
      weight: defaultWeight,
    });
  }

  // Slim product objects (e.g. cart lines) without variant arrays
  let pCurrentPrice = product.currentPrice;
  if (pCurrentPrice === undefined || pCurrentPrice === null) {
    pCurrentPrice = parseFloat(
      (basePrice * (1 - discountPercentage / 100)).toFixed(2),
    );
  }

  const definitiveOriginalPrice =
    basePrice < pCurrentPrice ? pCurrentPrice : basePrice;
  const definitiveDiscountAmount = parseFloat(
    (definitiveOriginalPrice - pCurrentPrice).toFixed(2),
  );

  return {
    originalPrice: definitiveOriginalPrice,
    discountedPrice: pCurrentPrice,
    discountAmount: definitiveDiscountAmount > 0 ? definitiveDiscountAmount : 0,
    discountPercentage,
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
 * Resolve unit prices for a cart line.
 * Catalog base (`basePrice` or `price`) + selected size/color/weight modifiers.
 */
export function getCartLinePrices(item: {
  product?: any;
  size?: VariantOption | null;
  color?: VariantOption | null;
  weight?: VariantOption | null;
}): PriceDetails {
  const product = item?.product;
  if (!product) {
    return {
      originalPrice: 0,
      discountedPrice: 0,
      discountAmount: 0,
      discountPercentage: 0,
    };
  }

  const discountPercentage =
    Number(product.discountPercentage) || Number(product.discount) || 0;

  const hasLineModifiers =
    item.size != null || item.color != null || item.weight != null;

  if (hasLineModifiers) {
    // Explicit catalog base from PDP add-to-cart
    if (Number(product.basePrice) > 0) {
      return calculateVariantPrice(
        Number(product.basePrice),
        discountPercentage,
        {
          size: item.size,
          color: item.color,
          weight: item.weight,
        },
      );
    }

    // Legacy slim snapshots baked the variant total into price/currentPrice
    // (no catalog basePrice, but currentPrice is set and no full product arrays)
    const isBakedLegacySnapshot =
      product.currentPrice != null &&
      !Array.isArray(product.sizes) &&
      !Array.isArray(product.colors) &&
      !Array.isArray(product.weights);

    if (isBakedLegacySnapshot) {
      return calculateProductPrice({
        ...product,
        sizes: undefined,
        colors: undefined,
        weights: undefined,
      });
    }

    // Server-synced / catalog product: `price` is base — apply line modifiers
    const catalogBase =
      Number(product.price) || Number(product.oldPrice) || 0;
    return calculateVariantPrice(catalogBase, discountPercentage, {
      size: item.size,
      color: item.color,
      weight: item.weight,
    });
  }

  return calculateProductPrice(product);
}

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
      const prices = getCartLinePrices(item);
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
