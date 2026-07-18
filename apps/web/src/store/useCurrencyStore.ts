import { create } from "zustand";
import { toCurrencyFromStore } from "@/lib/storeCurrency";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  rate: number;
}

const DEFAULT_CURRENCY = toCurrencyFromStore("USD");

interface CurrencyStore {
  currentCode: string;
  currencies: Currency[];
  setStoreCurrency: (code: string) => void;
  getCurrent: () => Currency;
}

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
  currentCode: DEFAULT_CURRENCY.code,
  currencies: [DEFAULT_CURRENCY],

  setStoreCurrency: (code) => {
    const currency = toCurrencyFromStore(code);
    set({
      currentCode: currency.code,
      currencies: [currency],
    });
  },

  getCurrent: () => {
    const { currentCode, currencies } = get();
    return (
      currencies.find((c) => c.code === currentCode) || DEFAULT_CURRENCY
    );
  },
}));
