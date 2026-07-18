import { create } from "zustand";
import { currencyMeta } from "@/lib/storeCurrency";

type StoreSettingsState = {
  currency: string;
  loaded: boolean;
  setCurrency: (currency: string) => void;
  getSymbol: () => string;
};

export const useStoreSettingsStore = create<StoreSettingsState>((set, get) => ({
  currency: "USD",
  loaded: false,

  setCurrency: (currency) => {
    set({ currency: (currency || "USD").toUpperCase(), loaded: true });
  },

  getSymbol: () => currencyMeta(get().currency).symbol,
}));
