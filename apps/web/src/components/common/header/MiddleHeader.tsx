"use client";

import { Link } from "@/i18n/routing";
import {
  ChevronDown,
  KeyRound,
  Lock,
  LogIn,
  ShoppingCart,
  Smartphone,
  Store,
  User,
  UserPlus,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Settings,
  Bell,
} from "lucide-react";

import { useEffect } from "react";
import Container from "../Container";
import SearchHeader from "./SearchHeader";
import Logo from "../Logo";
import { useAuthStore } from "@/store/useAuthStore";
import { useHeaderStore } from "@/store/useHeaderStore";
import CartSidebar from "./CartSidebar";
import AuthSidebar from "./AuthSidebar";
import { useCartStore } from "@/store/useCartStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { LogoutDialog } from "@/components/user/LogoutDialog";

const MiddleHeader = () => {
  const { onCartOpen, onAuthOpen } = useHeaderStore();
  const { user, isAuthenticated } = useAuthStore();
  const cartItems = useCartStore((state) => state.cartItems);
  const totalItems = cartItems.length ? cartItems.length : 0;
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchUnreadCount]);

  return (
    <>
      <div className="py-4 border border-gray-300 xl:border-0 hidden xl:block header-middle relative z-50">
        <Container>
          {/* For Desktop Screen Start */}
          <div className="xl:flex items-center hidden">
            <Logo />
            <div className="flex items-center w-full justify-end gap-x-[54px]">
              <SearchHeader />

              <div className="flex items-center gap-x-6 shrink-0">
                <ul className="flex items-center gap-x-6">
                  <li className="flex items-center gap-x-4 cursor-pointer relative group py-2">
                    <div className="flex items-center gap-x-3">
                      <div className="inline-flex items-center justify-center bg-warning w-12 h-12 rounded-xl text-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 hoverEffect">
                        <User className="size-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium text-muted-foreground leading-tight">
                          {isAuthenticated
                            ? `Welcome, ${user?.name?.split(" ")[0] || "User"}`
                            : "Account"}
                        </span>
                        <div className="flex items-center gap-x-1">
                          <span className="text-[15px] font-bold text-foreground leading-tight max-w-[100px] line-clamp-1">
                            {isAuthenticated ? "My Account" : "Log in"}
                          </span>
                          <ChevronDown className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>

                    {/* Added pt-4 to act as a bridge for the cursor to travel downwards without losing hover state */}
                    <div className="absolute right-0 top-full pt-4 z-50 w-[250px] max-w-[250px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                      <ul className="bg-white rounded-lg shadow-dark-z-24 py-2 m-0 list-none">
                        {!isAuthenticated ? (
                          <>
                            <li className="px-4 group/item">
                              <button
                                onClick={() => onAuthOpen("login")}
                                className="login-page-btn flex w-full items-center py-2 gap-x-2 relative text-foreground group-hover/item:text-primary"
                              >
                                <span className="w-8 h-8 bg-gray-100 group-hover/item:bg-primary/8 inline-flex items-center justify-center rounded-full">
                                  <LogIn className="size-4 text-foreground group-hover/item:text-primary" />
                                </span>
                                Login
                              </button>
                            </li>
                            <li className="px-4 group/item">
                              <button
                                onClick={() => onAuthOpen("register")}
                                className="register-page-btn flex w-full items-center py-2 gap-x-2 relative text-foreground group-hover/item:text-primary"
                              >
                                <span className="w-8 h-8 bg-gray-100 group-hover/item:bg-primary/8 inline-flex items-center justify-center rounded-full">
                                  <UserPlus className="size-4 text-foreground group-hover/item:text-primary" />
                                </span>
                                Register
                              </button>
                            </li>
                            <li className="px-4 group/item">
                              <button
                                onClick={() => onAuthOpen("forgot-password")}
                                className="forgot-password-page-btn flex w-full items-center py-2 gap-x-2 relative text-foreground group-hover/item:text-primary"
                              >
                                <span className="w-8 h-8 bg-gray-100 group-hover/item:bg-primary/8 transition-colors duration-300 inline-flex items-center justify-center rounded-full">
                                  <KeyRound className="size-4 text-foreground group-hover/item:text-primary" />
                                </span>
                                Forget Password
                              </button>
                            </li>
                          </>
                        ) : (
                          <>
                            {user?.role === "vendor" && (
                              <li className="px-4 group/item">
                                <Link
                                  href="/vendor-dashboard"
                                  className="flex w-full items-center py-2 gap-x-2 relative text-foreground group-hover/item:text-primary transition-colors"
                                >
                                  <span className="w-8 h-8 bg-primary/10 group-hover/item:bg-primary/20 transition-colors inline-flex items-center justify-center rounded-full">
                                    <Store className="size-4 text-primary" />
                                  </span>
                                  Vendor Dashboard
                                </Link>
                              </li>
                            )}
                            <li className="px-4 group/item">
                              <Link
                                href="/user/dashboard"
                                className="flex w-full items-center py-2 gap-x-2 relative text-foreground group-hover/item:text-primary transition-colors"
                              >
                                <span className="w-8 h-8 bg-gray-100 group-hover/item:bg-primary/8 transition-colors inline-flex items-center justify-center rounded-full">
                                  <LayoutDashboard className="size-4 text-foreground group-hover/item:text-primary transition-colors" />
                                </span>
                                Dashboard
                              </Link>
                            </li>
                            <li className="px-4 group/item">
                              <Link
                                href="/user/orders"
                                className="flex w-full items-center py-2 gap-x-2 relative text-foreground group-hover/item:text-primary transition-colors"
                              >
                                <span className="w-8 h-8 bg-gray-100 group-hover/item:bg-primary/8 transition-colors inline-flex items-center justify-center rounded-full">
                                  <ShoppingBag className="size-4 text-foreground group-hover/item:text-primary transition-colors" />
                                </span>
                                Order History
                              </Link>
                            </li>
                            <li className="px-4 group/item">
                              <Link
                                href="/user/notifications"
                                className="flex w-full items-center justify-between py-2 gap-x-2 relative text-foreground group-hover/item:text-primary transition-colors"
                              >
                                <div className="flex items-center gap-x-2">
                                  <span className="w-8 h-8 bg-gray-100 group-hover/item:bg-primary/8 transition-colors inline-flex items-center justify-center rounded-full">
                                    <Bell className="size-4 text-foreground group-hover/item:text-primary transition-colors" />
                                  </span>
                                  Notifications
                                </div>
                                {unreadCount > 0 && (
                                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center">
                                    {unreadCount}
                                  </span>
                                )}
                              </Link>
                            </li>
                            <li className="px-4 group/item">
                              <Link
                                href="/user/wishlist"
                                className="flex w-full items-center py-2 gap-x-2 relative text-foreground group-hover/item:text-primary transition-colors"
                              >
                                <span className="w-8 h-8 bg-gray-100 group-hover/item:bg-primary/8 transition-colors inline-flex items-center justify-center rounded-full">
                                  <Heart className="size-4 text-foreground group-hover/item:text-primary transition-colors" />
                                </span>
                                Wishlist
                              </Link>
                            </li>
                            <li className="px-4 group/item">
                              <Link
                                href="/cart"
                                className="flex w-full items-center py-2 gap-x-2 relative text-foreground group-hover/item:text-primary transition-colors"
                              >
                                <span className="w-8 h-8 bg-gray-100 group-hover/item:bg-primary/8 transition-colors inline-flex items-center justify-center rounded-full">
                                  <ShoppingCart className="size-4 text-foreground group-hover/item:text-primary transition-colors" />
                                </span>
                                Shopping Cart
                              </Link>
                            </li>
                            <li className="px-4 group/item">
                              <Link
                                href="/user/settings"
                                className="flex w-full items-center py-2 gap-x-2 relative text-foreground group-hover/item:text-primary transition-colors"
                              >
                                <span className="w-8 h-8 bg-gray-100 group-hover/item:bg-primary/8 transition-colors inline-flex items-center justify-center rounded-full">
                                  <Settings className="size-4 text-foreground group-hover/item:text-primary transition-colors" />
                                </span>
                                Settings
                              </Link>
                            </li>
                            <li className="px-4 group/item border-t border-gray-100 mt-2 pt-2">
                              <LogoutDialog>
                                <button className="flex w-full items-center py-2 gap-x-2 relative text-foreground group-hover/item:text-red-500">
                                  <span className="w-8 h-8 bg-gray-100 group-hover/item:bg-red-50 inline-flex items-center justify-center rounded-full">
                                    <LogOut className="size-4 text-foreground group-hover/item:text-red-500" />
                                  </span>
                                  Logout
                                </button>
                              </LogoutDialog>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <button
                      onClick={onCartOpen}
                      className="flex items-center gap-x-3 cursor-pointer group cart-sidebar-btn py-2"
                    >
                      <div className="relative inline-flex items-center justify-center bg-warning w-12 h-12 rounded-xl text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30">
                        <ShoppingCart className="size-6" />
                        <span className="absolute -top-1.5 -right-1.5 bg-warning text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white group-hover:bg-primary shadow-sm transition-transform duration-300 group-hover:scale-110">
                          {totalItems}
                        </span>
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[12px] font-medium text-muted-foreground">
                          Cart
                        </span>
                        <span className="text-[15px] font-bold text-foreground">
                          {totalItems} - {totalItems === 1 ? "Item" : "Items"}
                        </span>
                      </div>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* FOr Desktop Screen End */}
        </Container>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar />

      {/* Auth Sidebar */}
      <AuthSidebar />
    </>
  );
};

export default MiddleHeader;
