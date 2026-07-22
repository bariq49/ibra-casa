import { NavLink, Link } from "react-router";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/useAuthStore";
import {
  Award,
  Bookmark,
  Briefcase,
  Battery,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  ImageIcon,
  LayoutDashboard,
  List,
  LogOut,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Palette,
  Plus,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sliders,
  Star,
  Store,
  BarChart3,
  Tag,
  Ticket,
  Clock,
  User,
  UserCheck,
  Users,
  Smartphone,
  TrendingUp,
  Weight as WeightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
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

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const { logout, user } = useAuthStore();
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
    <div className="flex flex-col h-full bg-primary-darker text-white w-full">
      {/* Header / Logo */}
      <div className="flex items-center justify-between p-4 h-16 shrink-0 relative z-20 border-b border-white/5">
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
              <img
                src="/logo.svg"
                alt="Sellzy"
                className="h-8 w-auto brightness-0 invert"
              />
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
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
        <div
          className={cn(
            "flex flex-col gap-1 p-4 pb-12 w-full",
            open ? "w-[280px]" : "w-[80px]",
          )}
        >
          {renderNavItems(open)}
        </div>
      </div>

      {/* Footer / Account menu */}
      <div
        className={cn(
          "px-4 py-2 shrink-0 bg-primary-darker/90 backdrop-blur-sm border-t border-white/5 relative z-10",
          open ? "w-[280px]" : "w-[80px]",
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full bg-white/5 hover:bg-white/15 text-white hover:text-white transition-all h-[50px] rounded-[10px] flex items-center p-2",
                !open ? "justify-center" : "justify-start",
              )}
            >
              <div className="w-8 h-8 rounded-[8px] bg-primary-light flex items-center justify-center shrink-0">
                <span className="text-primary-darker font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </span>
              </div>
              {open && (
                <div className="ml-3 flex flex-col items-start truncate overflow-hidden">
                  <span className="text-sm font-semibold truncate w-full ">
                    {user?.name || "Admin User"}
                  </span>
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-medium truncate w-full">
                    {user?.role || "Administrator"}
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
            <DropdownMenuItem asChild className="cursor-pointer font-medium p-0">
              <Link
                to="/dashboard/profile"
                className="flex w-full items-center gap-2 p-3"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer font-medium p-0">
              <Link
                to="/dashboard/settings"
                className="flex w-full items-center gap-2 p-3"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setLogoutAlertOpen(true)}
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogoutAlertOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            {/* Modal Content */}
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
                  You are about to log out from the dashboard. You will need to
                  sign in again to access administrative features.
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
        className="hidden lg:flex fixed inset-y-0 left-0 z-20 flex-col shadow-xl bg-primary-darker border-r border-grey-500/10"
        initial={false}
        animate={{
          width: open ? 280 : 80,
        }}
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
          className="p-0 w-[280px] border-r-0 bg-primary-darker"
        >
          <VisuallyHidden.Root>
            <SheetTitle>Navigation Menu</SheetTitle>
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
        to="/dashboard"
        icon={<LayoutDashboard size={20} />}
        label="Dashboard"
        end={true}
        open={open}
      />

      <NavGroup label="Product Management" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/dashboard/products"
          icon={<ShoppingBag size={20} />}
          label="Products"
          open={open}
        />
        <NavItem
          to="/dashboard/product-types"
          icon={<Battery size={20} />}
          label="Product Types"
          open={open}
        />
        <NavItem
          to="/dashboard/product-bases"
          icon={<Smartphone size={20} />}
          label="Product Bases"
          open={open}
        />
        <NavItem
          to="/dashboard/categories"
          icon={<Tag size={20} />}
          label="Categories"
          open={open}
        />
        <NavItem
          to="/dashboard/brands"
          icon={<Bookmark size={20} />}
          label="Brands"
          open={open}
        />
        <NavItem
          to="/dashboard/sizes"
          icon={<Sliders size={20} />}
          label="Sizes"
          open={open}
        />
        <NavItem
          to="/dashboard/colors"
          icon={<Palette size={20} />}
          label="Colors"
          open={open}
        />
        <NavItem
          to="/dashboard/weights"
          icon={<WeightIcon size={20} />}
          label="Weights"
          open={open}
        />
        <NavItem
          to="/dashboard/badges"
          icon={<Award size={20} />}
          label="Badges"
          open={open}
        />
      </div>

      <NavGroup label="Order & Sales" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/dashboard/orders-dashboard"
          icon={<ShoppingCart size={20} />}
          label="Order Dashboard"
          open={open}
        />
        <NavItem
          to="/dashboard/orders"
          icon={<ShoppingCart size={20} />}
          label="Orders"
          open={open}
        />
        <NavItem
          to="/dashboard/abandoned-cart"
          icon={<ShoppingCart size={20} />}
          label="Abandoned Carts"
          open={open}
        />
        <NavItem
          to="/dashboard/invoices"
          icon={<FileText size={20} />}
          label="Invoices"
          open={open}
        />
        <NavItem
          to="/dashboard/qc"
          icon={<CheckCircle size={20} />}
          label="Quality Control"
          open={open}
        />
      </div>

      <NavGroup label="User Management" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/dashboard/users"
          icon={<Users size={20} />}
          label="All Users"
          open={open}
        />
        <NavItem
          to="/dashboard/admins"
          icon={<UserCheck size={20} />}
          label="Admins"
          open={open}
        />
        <NavItem
          to="/dashboard/subscriptions"
          icon={<Mail size={20} />}
          label="Subscriptions"
          open={open}
        />
        <NavItem
          to="/dashboard/addresses"
          icon={<MapPin size={20} />}
          label="Addresses"
          open={open}
        />
        <NavItem
          to="/dashboard/employees"
          icon={<Briefcase size={20} />}
          label="Employees"
          open={open}
        />
        <NavItem
          to="/dashboard/salaries"
          icon={<DollarSign size={20} />}
          label="Salaries"
          open={open}
        />
      </div>

      <NavGroup label="About, Careers & Contact" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/dashboard/about-page"
          icon={<FileText size={20} />}
          label="About Page Config"
          open={open}
        />
        <NavItem
          to="/dashboard/career-page"
          icon={<FileText size={20} />}
          label="Career Page Config"
          open={open}
        />
        <NavItem
          to="/dashboard/careers"
          icon={<Briefcase size={20} />}
          label="Careers Management"
          open={open}
        />
      </div>

      <NavGroup label="Vendor Management" open={open} highlight />
      <div
        className={cn(
          "flex flex-col mb-1 space-y-1",
          open && "border-l-2 border-primary-light/40 pl-2 ml-1",
        )}
      >
        <NavItem
          to="/dashboard/vendors"
          icon={<Store size={20} />}
          label="Vendors"
          open={open}
        />
        <NavItem
          to="/dashboard/vendor-products"
          icon={<Package size={20} />}
          label="Vendor Products"
          open={open}
        />
        <NavItem
          to="/dashboard/vendor-analytics"
          icon={<BarChart3 size={20} />}
          label="Vendor Analytics"
          open={open}
        />
        <NavItem
          to="/dashboard/vendor-config"
          icon={<Sliders size={20} />}
          label="Vendor Config"
          open={open}
        />
      </div>

      <NavGroup label="Purchase" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/dashboard/purchases/dashboard"
          icon={<TrendingUp size={20} />}
          label="Dashboard"
          open={open}
        />
        <NavItem
          to="/dashboard/purchases/create"
          icon={<Plus size={20} />}
          label="Create Purchase"
          open={open}
        />
        <NavItem
          to="/dashboard/purchases/approved"
          icon={<CheckCircle size={20} />}
          label="Approved"
          open={open}
        />
        <NavItem
          to="/dashboard/purchases/purchased"
          icon={<PackageCheck size={20} />}
          label="Purchased"
          open={open}
        />
        <NavItem
          to="/dashboard/purchases/suppliers"
          icon={<Users size={20} />}
          label="Suppliers"
          open={open}
        />
      </div>

      <NavGroup label="Marketing & Blog" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/dashboard/banners"
          icon={<ImageIcon size={20} />}
          label="Banners"
          open={open}
        />
        <NavItem
          to="/dashboard/promotions/coupon"
          icon={<Ticket size={20} />}
          label="Coupon"
          open={open}
        />
        <NavItem
          to="/dashboard/todays-offer"
          icon={<Clock size={20} />}
          label="Today's Offer"
          open={open}
        />
        <NavItem
          to="/dashboard/reviews"
          icon={<Star size={20} />}
          label="Product Reviews"
          open={open}
        />
        <NavItem
          to="/dashboard/blog/posts"
          icon={<List size={20} />}
          label="Blog Posts"
          open={open}
        />
        <NavItem
          to="/dashboard/menus"
          icon={<List size={20} />}
          label="Appearance Menus"
          open={open}
        />
      </div>

      <NavGroup label="System Config" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/dashboard/profile"
          icon={<User size={20} />}
          label="Profile"
          open={open}
        />
        <NavItem
          to="/dashboard/settings"
          icon={<Settings size={20} />}
          label="Settings"
          open={open}
        />
      </div>

      <NavGroup label="API Config" open={open} />
      <div className="flex flex-col mb-1 space-y-1">
        <NavItem
          to="/dashboard/api-config/system-metrics"
          icon={<Sliders size={20} />}
          label="System Metrics"
          open={open}
        />
      </div>
    </>
  );
}

// ------------------------------------------------------------
// Components
// ------------------------------------------------------------

function NavGroup({
  label,
  open,
  highlight,
}: {
  label: string;
  open: boolean;
  highlight?: boolean;
}) {
  if (!open)
    return (
      <div
        className="flex items-center justify-center p-2 mt-4 tooltip-trigger"
        title={label}
      >
        <div
          className={cn(
            "rounded-full",
            highlight
              ? "w-2 h-2 bg-primary-light shadow-[0_0_8px_rgba(94,217,186,0.6)]"
              : "w-1.5 h-1.5 bg-warning-main/50",
          )}
        />
      </div>
    );

  if (highlight) {
    return (
      <div className="mt-4 mb-1 mx-1 px-3 py-2 rounded-lg bg-primary-light/10 border border-primary-light/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-light opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-light" />
          </span>
          <h3 className="font-sans font-bold leading-none text-primary-light text-[11px] uppercase tracking-wider">
            {label}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 px-3 w-full mt-4 mb-1">
      <h3 className="font-sans font-medium leading-none text-warning-main text-[11px] uppercase tracking-wider">
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
            ? "bg-primary-lighter text-primary-darker shadow-sm font-bold hover:text-primary-darker"
            : "text-white/70 hover:text-white hover:bg-white/10 hover:shadow-sm",
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
