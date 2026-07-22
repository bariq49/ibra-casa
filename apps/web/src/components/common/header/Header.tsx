"use client";
import { useEffect, useState } from "react";
import BottomHeader from "./BottomHeader";
import TopHeader from "./TopHeader";
// import MiddleHeader from "./MiddleHeader";
import ResponsiveHeaderMenu from "./ResponsiveHeaderMenu";
import CartSidebar from "./CartSidebar";
import AuthSidebar from "./AuthSidebar";
import { CategoryTreeNode } from "@/hooks/useCategoryTree";
import { NavItem } from "@/constants/data";
import { useHeaderStore } from "@/store/useHeaderStore";
import {
  heroBandGradient,
  HERO_BAND_SIZE,
  isLightColor,
} from "@/lib/colorUtils";

interface HeaderProps {
  initialMenus?: NavItem[];
  initialCategoryTree?: CategoryTreeNode[];
}

export default function Header({
  initialMenus,
  initialCategoryTree,
}: HeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  const heroBgColor = useHeaderStore((s) => s.heroBgColor);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 80);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bottom header shares the hero gradient (not a flat solid). Sticky → white.
  const syncedAtTop = Boolean(heroBgColor) && !isSticky;
  const bandGradient = syncedAtTop
    ? heroBandGradient(heroBgColor as string)
    : undefined;
  const onDarkHero =
    syncedAtTop && !isLightColor(heroBgColor as string);

  const gradientStyle = bandGradient
    ? {
        backgroundImage: bandGradient,
        backgroundSize: HERO_BAND_SIZE,
        backgroundPosition: "0 0",
        backgroundRepeat: "no-repeat" as const,
      }
    : undefined;

  return (
    <>
      {/* ========== HEADER Section Start ========== */}
      <header className="w-full max-w-full overflow-x-clip border-b-0 shadow-none">
        {/* header-top start — always primary-light, no hero color */}
        <TopHeader />
        {/* header-top End */}

        {/* Middle header removed — search / account / cart icons are in BottomHeader */}
        {/* <MiddleHeader /> */}

        <BottomHeader
          isSticky={isSticky}
          syncedAtTop={syncedAtTop}
          gradientStyle={gradientStyle}
          onDarkHero={onDarkHero}
          initialMenus={initialMenus}
          initialCategoryTree={initialCategoryTree}
        />

        {/* Mobile Menu Start */}
        <ResponsiveHeaderMenu
          isSticky={isSticky}
          syncedAtTop={syncedAtTop}
          gradientStyle={gradientStyle}
          onDarkHero={onDarkHero}
          initialMenus={initialMenus}
          initialCategoryTree={initialCategoryTree}
        />
        {/* Mobile Menu End */}

        <CartSidebar />
        <AuthSidebar />
      </header>
      {/* ========== HEADER Section End ========== */}
    </>
  );
}
