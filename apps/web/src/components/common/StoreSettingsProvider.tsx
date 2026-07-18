"use client";

import { useEffect, useLayoutEffect } from "react";
import api from "@/lib/api";
import {
  DEFAULT_STORE_SETTINGS,
  type StoreSettings,
} from "@/lib/storeCurrency";
import { useStoreSettingsStore } from "@/store/useStoreSettingsStore";

interface Props {
  initialSettings?: Partial<StoreSettings>;
  children?: React.ReactNode;
}

const StoreSettingsProvider = ({ initialSettings, children }: Props) => {
  const setSettings = useStoreSettingsStore((s) => s.setSettings);

  useLayoutEffect(() => {
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      setSettings({ ...DEFAULT_STORE_SETTINGS, ...initialSettings });
    }
  }, [initialSettings, setSettings]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/api/system-metrics/store-settings");
        if (cancelled || !data?.settings) return;
        setSettings({
          currency: data.settings.currency || DEFAULT_STORE_SETTINGS.currency,
          taxRate:
            typeof data.settings.taxRate === "number"
              ? data.settings.taxRate
              : DEFAULT_STORE_SETTINGS.taxRate,
          shippingCost:
            typeof data.settings.shippingCost === "number"
              ? data.settings.shippingCost
              : DEFAULT_STORE_SETTINGS.shippingCost,
          freeDeliveryThreshold:
            typeof data.settings.freeDeliveryThreshold === "number"
              ? data.settings.freeDeliveryThreshold
              : DEFAULT_STORE_SETTINGS.freeDeliveryThreshold,
          storeName: data.settings.storeName,
        });
      } catch {
        if (!cancelled) {
          setSettings(DEFAULT_STORE_SETTINGS);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setSettings]);

  return <>{children}</>;
};

export default StoreSettingsProvider;
