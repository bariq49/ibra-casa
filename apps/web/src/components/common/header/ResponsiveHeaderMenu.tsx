import React, { useState } from "react";
import SearchHeader from "./SearchHeader";
import { ShoppingCart, Menu } from "lucide-react";
import Logo from "../Logo";
import Container from "../Container";
import MobileSidebar from "./MobileSidebar";
import { useHeaderStore } from "@/store/useHeaderStore";

import { NavItem } from "@/constants/data";
import { CategoryTreeNode } from "@/hooks/useCategoryTree";

interface ResponsiveHeaderMenuProps {
  initialMenus?: NavItem[];
  initialCategoryTree?: CategoryTreeNode[];
}

const ResponsiveHeaderMenu = ({ initialMenus, initialCategoryTree }: ResponsiveHeaderMenuProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { onCartOpen } = useHeaderStore();

  return (
    <>
      <Container className="border border-gray-300 xl:border-0 sticky-header">
        <div>
          <div className="pb-4 pt-3 block xl:hidden">
            <div className="flex justify-between items-center">
              <div>
                <button
                  className="border rounded-full border-border p-2 hover:bg-gray-100 transition-colors"
                  id="sidebar-menu-btn"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu />
                </button>
              </div>
              <Logo className="w-24" />
              <div className="xl:hidden flex items-center gap-x-4">
                <button
                  onClick={onCartOpen}
                  className="relative p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 shadow-sm active:scale-95 group"
                >
                  <ShoppingCart
                    size={22}
                    className="group-hover:rotate-6 transition-transform"
                  />
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full border-2 border-white">
                    0
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="pb-4 block xl:hidden">
            <SearchHeader id="mobile-search" />
          </div>
        </div>
      </Container>
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
