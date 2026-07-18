import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/useAuthStore";
import useVendorStore from "@/store/useVendorStore";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import VendorOnboarding from "@/pages/vendor/VendorOnboarding";

export default function VendorLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const { vendor, fetched, fetchVendor } = useVendorStore();
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );

  useEffect(() => {
    if (isAuthenticated && user?.role === "vendor" && !fetched) {
      fetchVendor();
    }
  }, [isAuthenticated, user?.role, fetched, fetchVendor]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admins can peek at the vendor portal as themselves but normal users can't.
  if (user?.role !== "vendor" && user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex w-full h-screen bg-background overflow-hidden">
      <VendorSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300 ease-in-out",
          "lg:ml-20",
          sidebarOpen && "lg:ml-[280px]",
        )}
      >
        <VendorHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto bg-primary-lighter/40">
          {/* Vendors that aren't yet active see the onboarding screen instead of the page */}
          {user?.role === "vendor" &&
          (!fetched || !vendor || vendor.status !== "approved") ? (
            <VendorOnboarding />
          ) : (
            <div className="p-4 md:p-6 min-h-full">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
