/** Display metadata for currencies set in Admin → Settings */
export const STORE_CURRENCY_META: Record<
  string,
  { symbol: string; locale: string; name: string }
> = {
  USD: { symbol: "$", locale: "en-US", name: "US Dollar" },
  EUR: { symbol: "€", locale: "de-DE", name: "Euro" },
  GBP: { symbol: "£", locale: "en-GB", name: "British Pound" },
  CAD: { symbol: "CA$", locale: "en-CA", name: "Canadian Dollar" },
  AUD: { symbol: "A$", locale: "en-AU", name: "Australian Dollar" },
  PKR: { symbol: "Rs", locale: "en-PK", name: "Pakistani Rupee" },
  INR: { symbol: "₹", locale: "en-IN", name: "Indian Rupee" },
  BDT: { symbol: "৳", locale: "bn-BD", name: "Bangladeshi Taka" },
};

export function currencyMeta(code: string) {
  const upper = (code || "USD").toUpperCase();
  return (
    STORE_CURRENCY_META[upper] || {
      symbol: upper,
      locale: "en-US",
      name: upper,
    }
  );
}

export function formatStorePrice(amount: number, symbol: string): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

  return `${symbol}${formatted}`;
}

export function formatStorePriceCompact(amount: number, symbol: string): string {
  const value = Number(amount) || 0;
  if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(1)}k`;
  }
  return formatStorePrice(value, symbol);
}
