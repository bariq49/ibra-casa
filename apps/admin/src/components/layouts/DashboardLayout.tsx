import { useState } from "react";
import { Outlet, Navigate, useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function DashboardLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { isReadOnly } = usePermissions();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Prevent regular users from accessing the admin/employee dashboard
  if (user?.role === "user") {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-grey-50 p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-grey-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-error-lighter text-error-main rounded-full flex items-center justify-center mb-6 shadow-sm">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-grey-900 mb-3 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-grey-600 mb-8 leading-relaxed">
            Access not granted. Administrator or Employee clearance is required
            to view the dashboard and execute commands.
          </p>
          <Button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="w-full bg-primary hover:bg-primary-dark text-white rounded-full py-6 font-medium text-base shadow-md transition-all"
          >
            Sign in with an authorized account
          </Button>
        </div>
      </div>
    );
  }

  // Vendors have their own portal at /vendor — redirect them out of the admin layout.
  if (user?.role === "vendor") {
    return <Navigate to="/vendor" replace />;
  }

  const location = useLocation();
  const isSearchPage = location.pathname.includes("/search");

  return (
    <div className="flex w-full h-screen bg-background overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out overflow-hidden",
          "lg:ml-20",
          sidebarOpen && "lg:ml-[280px]",
        )}
      >
        {!isSearchPage && <Header setSidebarOpen={setSidebarOpen} />}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30">
          {isReadOnly && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-warning-lighter  border border-warning-lighter  rounded-lg shadow-sm">
              <span className="text-sm font-medium text-warning-dark ">
                👁️ Read-Only Mode: You can view all pages and data but cannot
                make any changes
              </span>
            </div>
          )}
          <Outlet context={{ setSidebarOpen }} />
        </main>
      </div>
    </div>
  );
}
