import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  currencyMeta,
  formatStorePrice,
  formatStorePriceCompact,
} from "@/lib/storeCurrency";
import { useStoreSettingsStore } from "@/store/useStoreSettingsStore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format amount using currency from Admin → Settings (symbol left, dot decimals). */
export function formatCurrency(amount: number | undefined | null): string {
  const currency = useStoreSettingsStore.getState().currency;
  const symbol = currencyMeta(currency).symbol;
  return formatStorePrice(Number(amount) || 0, symbol);
}

/** Compact chart labels, e.g. €12.5k */
export function formatCurrencyCompact(amount: number): string {
  const currency = useStoreSettingsStore.getState().currency;
  const symbol = currencyMeta(currency).symbol;
  return formatStorePriceCompact(amount, symbol);
}

/** Whole-number display for dashboard stat cards */
export function formatCurrencyWhole(amount: number): string {
  const currency = useStoreSettingsStore.getState().currency;
  const symbol = currencyMeta(currency).symbol;
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
  return `${symbol}${formatted}`;
}

/** Current store currency symbol from Admin → Settings */
export function getCurrencySymbol(): string {
  const currency = useStoreSettingsStore.getState().currency;
  return currencyMeta(currency).symbol;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
