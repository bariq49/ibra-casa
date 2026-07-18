"use client";
import { cn } from "@/lib/utils";
import { useStoreSettingsStore } from "@/store/useStoreSettingsStore";
import { currencyMeta, formatStorePrice } from "@/lib/storeCurrency";

interface Props {
  amount: number | undefined;
  className?: string;
}

const PriceFormatter = ({ amount, className }: Props) => {
  const currency = useStoreSettingsStore((s) => s.currency);
  const symbol = currencyMeta(currency).symbol;

  const safeAmount = Number(amount) || 0;
  const formattedPrice = formatStorePrice(safeAmount, symbol);

  return (
    <span className={cn("text-sm font-semibold text-gofarm-black", className)}>
      {formattedPrice}
    </span>
  );
};

export default PriceFormatter;
