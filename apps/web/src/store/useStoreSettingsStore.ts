import { create } from "zustand";
import {
  DEFAULT_STORE_SETTINGS,
  type StoreSettings,
} from "@/lib/storeCurrency";
import { useCurrencyStore } from "@/store/useCurrencyStore";

interface StoreSettingsState extends StoreSettings {
  loaded: boolean;
  setSettings: (settings: Partial<StoreSettings>) => void;
  applyCurrency: (code: string) => void;
}

export const useStoreSettingsStore = create<StoreSettingsState>((set, get) => ({
  ...DEFAULT_STORE_SETTINGS,
  loaded: false,

  setSettings: (settings) => {
    set((state) => ({
      ...state,
      ...settings,
      loaded: true,
    }));
    if (settings.currency) {
      get().applyCurrency(settings.currency);
    }
  },

  applyCurrency: (code) => {
    useCurrencyStore.getState().setStoreCurrency(code);
  },
}));
