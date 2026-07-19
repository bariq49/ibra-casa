import { useEffect } from "react";
import axios from "axios";
import useAuthStore from "@/store/useAuthStore";
import { useStoreSettingsStore } from "@/store/useStoreSettingsStore";

const API_URL = (
  import.meta.env.VITE_NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

export default function StoreSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setCurrency = useStoreSettingsStore((s) => s.setCurrency);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (isAuthenticated && token) {
          const { data } = await axios.get(
            `${API_URL}/api/system-metrics/config`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (!cancelled && data?.config?.currency) {
            setCurrency(data.config.currency);
            return;
          }
        }

        const { data } = await axios.get(
          `${API_URL}/api/system-metrics/store-settings`,
        );
        if (!cancelled && data?.settings?.currency) {
          setCurrency(data.settings.currency);
        }
      } catch {
        if (!cancelled) {
          setCurrency("USD");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, setCurrency]);

  return <>{children}</>;
}
