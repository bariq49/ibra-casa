import { formatPriceRange, getVariantPriceRange, type VariantCatalogItem } from "@/lib/variantPricing";
import { formatCurrency } from "@/lib/utils";

type Props = {
  basePrice: number;
  discountPercentage: number;
  selectedSizes: string[];
  selectedColors: string[];
  selectedWeights: string[];
  sizes: VariantCatalogItem[];
  colors: VariantCatalogItem[];
  weights: VariantCatalogItem[];
};

export function VariantPricePreview({
  basePrice,
  discountPercentage,
  selectedSizes,
  selectedColors,
  selectedWeights,
  sizes,
  colors,
  weights,
}: Props) {
  const range = getVariantPriceRange(
    basePrice,
    discountPercentage,
    selectedSizes,
    selectedColors,
    selectedWeights,
    sizes,
    colors,
    weights,
  );

  const hasVariants =
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedWeights.length > 0;

  if (!hasVariants) {
    return (
      <p className="text-xs text-muted-foreground">
        Select sizes, colors, or weights to preview customer-facing prices.
        Set price modifiers in Sizes / Colors / Weights settings.
      </p>
    );
  }

  if (!range) return null;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
      <p className="font-medium text-foreground">
        Storefront price range:{" "}
        <span className="text-primary">{formatPriceRange(range)}</span>
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Base {formatCurrency(basePrice)}
        {discountPercentage > 0 ? ` · ${discountPercentage}% discount applied` : ""}
        . Final price updates when the customer picks size, color, and weight.
      </p>
    </div>
  );
}
