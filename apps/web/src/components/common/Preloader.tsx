"use client";

import React, { useEffect, useState } from "react";
import { useLoadingStore } from "@/store/useLoadingStore";
import { cn } from "@/lib/utils";
import { usePathname } from "@/i18n/routing";

const Preloader = () => {
  const { isLoading } = useLoadingStore();
  const [show, setShow] = useState(true); // Always show initially for mount
  const [isExiting, setIsExiting] = useState(false);
  const pathname = usePathname();

  // Handle initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      const hideTimer = setTimeout(() => {
        setShow(false);
        setIsExiting(false);
      }, 500);
      return () => clearTimeout(hideTimer);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle route changes
  useEffect(() => {
    // When pathname changes, we show the preloader briefly or until initialized
    // However, Next.js loading.tsx usually handles route segments.
    // This hook is for manual loading state or global transitions.
    if (isLoading) {
      setShow(true);
      setIsExiting(false);
    } else if (show && !isExiting) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setShow(false);
        setIsExiting(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, pathname]);

  if (!show) return null;

  return (
    <div className={cn("preloader", isExiting && "loaded")}>
      <div className="pxl-loader-spinner">
        <div className="pxl-loader-bounce1"></div>
        <div className="pxl-loader-bounce2"></div>
        <div className="pxl-loader-bounce3"></div>
      </div>
    </div>
  );
};

export default Preloader;
