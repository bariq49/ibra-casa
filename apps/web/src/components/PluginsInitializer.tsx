"use client";

import { usePathname } from "@/i18n/routing";
import { useEffect } from "react";

export default function PluginsInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    // Re-initialize WOW.js for animations
    if (typeof window !== "undefined" && (window as any).WOW) {
      try {
        new (window as any).WOW().init();
      } catch (error) {
        console.error("WOW.js initialization failed:", error);
      }
    }
  }, [pathname]);

  return null;
}
