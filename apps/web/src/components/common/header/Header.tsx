"use client";
import { useEffect, useState } from "react";
import BottomHeader from "./BottomHeader";
import TopHeader from "./TopHeader";
import MiddleHeader from "./MiddleHeader";
import ResponsiveHeaderMenu from "./ResponsiveHeaderMenu";
import { CategoryTreeNode } from "@/hooks/useCategoryTree";
import { NavItem } from "@/constants/data";

interface HeaderProps {
  initialMenus?: NavItem[];
  initialCategoryTree?: CategoryTreeNode[];
}

export default function Header({ initialMenus, initialCategoryTree }: HeaderProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ========== HEADER Section Start ========== */}
      <header>
        {/* header-top start */}
        <TopHeader />
        {/* header-top End */}

        <MiddleHeader />
        <BottomHeader 
          isSticky={isSticky} 
          initialMenus={initialMenus} 
          initialCategoryTree={initialCategoryTree} 
        />

        {/* Mobile Menu Start */}
        <ResponsiveHeaderMenu 
          initialMenus={initialMenus} 
          initialCategoryTree={initialCategoryTree} 
        />
        {/* Mobile Menu End */}
      </header>
      {/* ========== HEADER Section End ========== */}
    </>
  );
}
