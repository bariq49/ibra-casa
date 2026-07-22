"use client";
import React, { useState } from "react";
import SearchHeader from "./SearchHeader";
import { ShoppingCart, Menu } from "lucide-react";
import Logo from "../Logo";
import MobileSidebar from "./MobileSidebar";
import { useHeaderStore } from "@/store/useHeaderStore";
import { useCartStore } from "@/store/useCartStore";

import { NavItem } from "@/constants/data";
import { CategoryTreeNode } from "@/hooks/useCategoryTree";

interface ResponsiveHeaderMenuProps {
  isSticky?: boolean;
  syncedAtTop?: boolean;
  gradientStyle?: React.CSSProperties;
  onDarkHero?: boolean;
  initialMenus?: NavItem[];
  initialCategoryTree?: CategoryTreeNode[];
}

const ResponsiveHeaderMenu = ({
  isSticky = false,
  syncedAtTop = false,
  gradientStyle,
  onDarkHero = false,
  initialMenus,
  initialCategoryTree,
}: ResponsiveHeaderMenuProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { onCartOpen, heroBgColor } = useHeaderStore();
  const cartItems = useCartStore((state) => state.cartItems);
  const totalItems = cartItems.length ? cartItems.length : 0;

  const bandActive = syncedAtTop && !isSticky;

  return (
    <>
      {/* Mobile header — same hero band bg as desktop bottom header */}
      <div
        className={`xl:hidden w-full max-w-full overflow-x-clip !border-0 !border-b-0 outline-none !shadow-none transition-all duration-300 ${
          isSticky
            ? "fixed top-0 left-0 z-50 bg-white shadow-md"
            : bandActive
              ? "relative"
              : "relative bg-white"
        }`}
        style={
          bandActive
            ? {
                ...(gradientStyle || {}),
                backgroundColor: heroBgColor || undefined,
                borderBottom: "none",
                boxShadow: "none",
              }
            : undefined
        }
      >
        <div className="w-full max-w-full px-4 pt-2.5 pb-2">
          <div className="flex justify-between items-center gap-3 min-w-0">
            <button
              type="button"
              className={`shrink-0 border rounded-full p-2 transition-colors ${
                onDarkHero
                  ? "border-white/30 text-white hover:bg-white/10"
                  : "border-border hover:bg-gray-100"
              }`}
              id="sidebar-menu-btn"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>

            <Logo
              className={`w-32 h-auto ${
                onDarkHero ? "brightness-0 invert" : ""
              }`}
            />

            <button
              type="button"
              onClick={onCartOpen}
              className={`relative shrink-0 p-2 rounded-xl transition-all duration-300 active:scale-95 ${
                onDarkHero
                  ? "text-white hover:bg-white/10"
                  : "bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm"
              }`}
              aria-label="Cart"
            >
              <ShoppingCart size={22} />
              <span
                className={`absolute -top-1 -right-1 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-0.5 flex items-center justify-center rounded-full border-2 ${
                  onDarkHero
                    ? "bg-primary border-transparent"
                    : "bg-primary border-white"
                }`}
              >
                {totalItems}
              </span>
            </button>
          </div>
        </div>

        <div className="w-full max-w-full min-w-0 px-4 pb-2">
          <SearchHeader id="mobile-search" className="w-full max-w-full" />
        </div>
      </div>

      {/* Spacer when mobile header is fixed/sticky */}
      {isSticky && <div className="xl:hidden h-[108px]" aria-hidden />}

      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        initialMenus={initialMenus}
        initialCategoryTree={initialCategoryTree}
      />
    </>
  );
};

export default ResponsiveHeaderMenu;
