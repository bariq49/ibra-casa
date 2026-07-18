"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/store/useAuthStore";

export default function VendorDashboardRedirectPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    if (user?.role !== "vendor") {
      router.replace("/user/dashboard");
      return;
    }
    const adminUrl =
      process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:5173";
    window.location.href = `${adminUrl.replace(/\/$/, "")}/vendor`;
  }, [isAuthenticated, user?.role, router]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="size-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <h1 className="text-lg font-semibold text-foreground">
        Opening your Vendor Dashboard…
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        Redirecting you to the seller portal. If nothing happens, please refresh
        this page.
      </p>
    </main>
  );
}
