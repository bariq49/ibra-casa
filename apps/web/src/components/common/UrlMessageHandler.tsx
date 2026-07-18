"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Client component that monitors URL search params for error/message flags
 * and displays them as toasts, then cleans up the URL.
 */
export default function UrlMessageHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (error || message) {
      // Display the toast
      if (error === "login-required" || error === "unauthorized") {
        toast.error(message || "Please log in to continue");
      } else if (error) {
        toast.error(message || "An error occurred");
      } else if (message) {
        toast.success(message);
      }

      // Clean up URL by removing the query params
      const currentPath = window.location.pathname;
      router.replace(currentPath, { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}
