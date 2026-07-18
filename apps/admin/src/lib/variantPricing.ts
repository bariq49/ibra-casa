import { formatCurrency } from "@/lib/utils";

export type VariantCatalogItem = {
  _id: string;
  name: string;
  priceModifier?: number;
};

/** Label for multi-selects, e.g. "60 cm (+15)" */
export function formatVariantLabel(item: VariantCatalogItem): string {
  const mod = item.priceModifier ?? 0;
  if (mod === 0) return item.name;
  return `${item.name} (${mod > 0 ? "+" : ""}${mod})`;
}

export function getVariantPriceRange(
  basePrice: number,
  discountPercentage: number,
  selectedSizeIds: string[],
  selectedColorIds: string[],
  selectedWeightIds: string[],
  sizes: VariantCatalogItem[],
  colors: VariantCatalogItem[],
  weights: VariantCatalogItem[],
): { min: number; max: number } | null {
  if (!basePrice && basePrice !== 0) return null;

  const pickMods = (ids: string[], catalog: VariantCatalogItem[]) =>
    ids.length > 0
      ? ids.map((id) => catalog.find((x) => x._id === id)?.priceModifier ?? 0)
      : [0];

  const sizeMods = pickMods(selectedSizeIds, sizes);
  const colorMods = pickMods(selectedColorIds, colors);
  const weightMods = pickMods(selectedWeightIds, weights);

  const prices: number[] = [];
  for (const sm of sizeMods) {
    for (const cm of colorMods) {
      for (const wm of weightMods) {
        const original = basePrice + sm + cm + wm;
        prices.push(
          parseFloat(
            (original * (1 - (discountPercentage || 0) / 100)).toFixed(2),
          ),
        );
      }
    }
  }

  if (prices.length === 0) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function formatPriceRange(range: { min: number; max: number }): string {
  if (range.min === range.max) {
    return formatCurrency(range.min);
  }
  return `${formatCurrency(range.min)} – ${formatCurrency(range.max)}`;
}
