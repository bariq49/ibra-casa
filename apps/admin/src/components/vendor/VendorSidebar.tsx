import { NavLink, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/useAuthStore";
import useVendorStore from "@/store/useVendorStore";
import {
  LayoutDashboard,
  Package,
  FileText,
  Layers,
  CheckCircle,
  Tag,
  Sliders,
  Hash,
  Bookmark,
  Boxes,
  ShoppingCart,
  RefreshCcw,
  ShoppingBag,
  Receipt,
  Users,
  BarChart3,
  Wallet,
  Banknote,
  Ticket,
  Inbox,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function VendorSidebar({ open, setOpen }: SidebarProps) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const { vendor } = useVendorStore();
  const [isMobile, setIsMobile] = useState(false);
  const [logoutAlertOpen, setLogoutAlertOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setOpen]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-background text-foreground w-full">
      {/* Header / Logo */}
      <div className="flex items-center justify-between p-4 h-16 shrink-0 relative z-20 border-b border-border">
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-center w-full"
            >
              <img src="/logo.png" alt="Sellzy" className="h-9 w-auto object-contain" />
            </motion.div>
          ) : (
            <motion.div
              key="logo-small"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center w-full cursor-pointer"
              onClick={() => setOpen(true)}
              title="Expand Sidebar"
            >
              <img
                src="/logo-small.png"
                alt="Sellzy"
                className="h-8 w-8 object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden lg:flex absolute -right-3.5 top-[18px] z-50 items-center justify-center"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className="w-7 h-7 rounded-full bg-white border border-grey-200 shadow-sm text-grey-900 hover:bg-grey-50 hover:text-primary-darker transition-all flex items-center justify-center p-0 ring-4 ring-background"
          >
            {open ? (
              <ChevronLeft size={16} strokeWidth={2.5} />
            ) : (
              <ChevronRight size={16} strokeWidth={2.5} />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbarHider scrollbarHide p-0">
        <div
          className={cn(
            "flex flex-col gap-1 p-4 pb-12 w-full",
            open ? "w-[280px]" : "w-[80px]",
          )}
        >
          {renderNavItems(open)}
        </div>
      </div>

      {/* Footer / User Card */}
      <div
        className={cn(
          "px-4 py-2 shrink-0 bg-background border-t border-border relative z-10 hidden lg:block",
          open ? "w-[280px]" : "w-[80px]",
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full bg-muted/40 hover:bg-muted text-foreground hover:text-foreground transition-all h-[50px] rounded-[10px] flex items-center p-2",
                !open ? "justify-center" : "justify-start",
              )}
            >
              <div className="w-8 h-8 rounded-[8px] bg-primary-lighter flex items-center justify-center shrink-0">
                <span className="text-primary-darker font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
                </span>
              </div>
              {open && (
                <div className="ml-3 flex flex-col items-start truncate overflow-hidden">
                  <span className="text-sm font-semibold truncate w-full">
                    {user?.name || "Vendor"}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium truncate w-full">
                    {vendor?.storeName || "Seller Admin"}
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[240px] bg-white border-border"
            side="right"
            sideOffset={12}
          >
            <DropdownMenuLabel className="font-semibold text-grey-900">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/vendor/settings")}
              className="cursor-pointer font-medium p-3"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setLogoutAlertOpen(true)}
              className="text-error-main focus:bg-error-main/10 focus:text-error-main cursor-pointer font-medium p-3"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out securely</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {logoutAlertOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogoutAlertOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative z-10 w-[90%] max-w-md bg-white rounded-2xl shadow-xl p-8 border border-border"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-error-lighter flex items-center justify-center mb-5 text-error-main shadow-inner">
                  <LogOut size={26} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-grey-900 mb-2">
                  Ready to leave?
                </h2>
                <p className="text-grey-500 mb-8 text-sm max-w-[280px]">
                  You are about to log out from the seller portal. You will need
                  to sign in again to manage your store.
                </p>
                <div className="flex w-full gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 rounded-xl text-base font-medium"
                    onClick={() => setLogoutAlertOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-11 rounded-xl bg-error-main hover:bg-error-dark text-white text-base font-medium shadow-lg shadow-error-main/20"
                    onClick={() => {
                      setLogoutAlertOpen(false);
                      logout();
                    }}
                  >
                    Yes, Log Out
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden lg:flex fixed inset-y-0 left-0 z-20 flex-col shadow-xl bg-background border-r border-border"
        initial={false}
        animate={{ width: open ? 280 : 80 }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
          type: "tween",
        }}
      >
        <div className="w-full h-full flex flex-col">{sidebarContent}</div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <Sheet open={open && isMobile} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="p-0 w-[280px] border-r-0 bg-background"
        >
          <VisuallyHidden.Root>
            <SheetTitle>Vendor Navigation</SheetTitle>
          </VisuallyHidden.Root>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ------------------------------------------------------------
// Layout Helpers
// ------------------------------------------------------------

function renderNavItems(open: boolean) {
  return (
    <>
      <NavItem
        to="/vendor"
        icon={<LayoutDashboard size={20} />}
        label="Dashboard"
        end
        open={open}
      />

      <NavGroup label="Product Management" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/vendor/products"
          icon={<Package size={20} />}
          label="All Products"
          end
          open={open}
        />
        <NavItem
          to="/vendor/products/draft"
          icon={<FileText size={20} />}
          label="Draft Products"
          open={open}
        />
        <NavItem
          to="/vendor/products/stock"
          icon={<Layers size={20} />}
          label="Stock Products"
          open={open}
        />
        <NavItem
          to="/vendor/products/review"
          icon={<CheckCircle size={20} />}
          label="Product Review"
          open={open}
        />
        <NavItem
          to="/vendor/catalog/categories"
          icon={<Tag size={20} />}
          label="Categories"
          open={open}
        />
        <NavItem
          to="/vendor/catalog/attributes"
          icon={<Sliders size={20} />}
          label="Attributes"
          open={open}
        />
        <NavItem
          to="/vendor/catalog/tags"
          icon={<Hash size={20} />}
          label="Tags"
          open={open}
        />
        <NavItem
          to="/vendor/catalog/brands"
          icon={<Bookmark size={20} />}
          label="Brands"
          open={open}
        />
        <NavItem
          to="/vendor/inventory"
          icon={<Boxes size={20} />}
          label="Manage Inventory"
          open={open}
        />
      </div>

      <NavGroup label="Order Management" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/vendor/orders"
          icon={<ShoppingCart size={20} />}
          label="Total Orders"
          end
          open={open}
        />
        <NavItem
          to="/vendor/orders/returns"
          icon={<RefreshCcw size={20} />}
          label="Return & Refund"
          open={open}
        />
        <NavItem
          to="/vendor/orders/abandoned"
          icon={<ShoppingBag size={20} />}
          label="Abandoned Cart"
          open={open}
        />
        <NavItem
          to="/vendor/transactions"
          icon={<Receipt size={20} />}
          label="Transactions"
          open={open}
        />
      </div>

      <NavGroup label="User Management" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/vendor/staff"
          icon={<Users size={20} />}
          label="Staff User"
          open={open}
        />
      </div>

      <NavGroup label="Reports & Analytics" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/vendor/reports"
          icon={<BarChart3 size={20} />}
          label="Sales Reports"
          open={open}
        />
      </div>

      <NavGroup label="Finance Management" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/vendor/earnings"
          icon={<Wallet size={20} />}
          label="Earning"
          open={open}
        />
        <NavItem
          to="/vendor/withdraws"
          icon={<Banknote size={20} />}
          label="Withdraws"
          open={open}
        />
        <NavItem
          to="/vendor/refunds"
          icon={<RefreshCcw size={20} />}
          label="Refunds"
          open={open}
        />
      </div>

      <NavGroup label="Promotional Deals" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/vendor/coupons"
          icon={<Ticket size={20} />}
          label="Coupon"
          open={open}
        />
      </div>

      <NavGroup label="Help & Support" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/vendor/inbox"
          icon={<Inbox size={20} />}
          label="Inbox"
          open={open}
        />
      </div>
    </>
  );
}

// ------------------------------------------------------------
// Components
// ------------------------------------------------------------

function NavGroup({ label, open }: { label: string; open: boolean }) {
  if (!open)
    return (
      <div
        className="flex items-center justify-center p-2 mt-4"
        title={label}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-primary-main/40" />
      </div>
    );

  return (
    <div className="flex items-center justify-between py-2 px-3 w-full mt-4 mb-1">
      <h3 className="font-sans font-medium leading-none text-grey-500 text-[11px] uppercase tracking-wider">
        {label}
      </h3>
    </div>
  );
}

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
  open: boolean;
};

function NavItem({ to, icon, label, end = false, open }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      title={!open ? label : undefined}
      className={({ isActive }) =>
        cn(
          "flex gap-3 items-center py-2.5 rounded-[8px] transition-all duration-200 group relative overflow-hidden",
          !open ? "w-10 h-10 justify-center mx-auto" : "px-3 text-[14px]",
          isActive
            ? "bg-primary-lighter text-primary-darker shadow-sm font-bold"
            : "text-grey-700 hover:text-grey-900 hover:bg-muted",
        )
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={cn(
              "relative z-10 flex justify-center items-center shrink-0 transition-all",
              !open ? "w-full" : "w-5",
              isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100",
            )}
          >
            {icon}
          </div>

          {open && (
            <span className="relative z-10 flex-1 font-sans font-medium leading-snug truncate">
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
