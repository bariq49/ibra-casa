"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useRouter } from "@/i18n/routing";
import {
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  ArrowRight,
  Search,
  X,
  User,
  ShoppingCart,
} from "lucide-react";
import Logo from "../Logo";
import SearchHeader from "./SearchHeader";
import { useMenus } from "@/hooks/useMenus";
import { useCategoryTree, CategoryTreeNode } from "@/hooks/useCategoryTree";
import { NavItem } from "@/constants/data";
import Image from "next/image";
import { useHeaderStore } from "@/store/useHeaderStore";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

const MAX_VISIBLE_CATEGORIES = 12;

interface BottomHeaderProps {
  isSticky?: boolean;
  syncedAtTop?: boolean;
  /** Shared hero-band gradient (not a solid fill) */
  gradientStyle?: React.CSSProperties;
  onDarkHero?: boolean;
  initialMenus?: NavItem[];
  initialCategoryTree?: CategoryTreeNode[];
}

/** Renders a single category image or a fallback initial */
const CategoryImage = ({ category }: { category: CategoryTreeNode }) => {
  if (category.image) {
    return (
      <Image
        src={category.image}
        alt={category.name}
        width={200}
        height={200}
        className="size-6 object-contain rounded-sm"
        loading="lazy"
      />
    );
  }
  return (
    <span className="text-xs font-bold text-primary">
      {category.name.charAt(0).toUpperCase()}
    </span>
  );
};

const BottomHeader = ({
  isSticky = false,
  syncedAtTop = false,
  gradientStyle,
  onDarkHero = false,
  initialMenus,
  initialCategoryTree,
}: BottomHeaderProps) => {
  const { menus, isLoading: menusLoading } = useMenus(initialMenus);
  const { tree: categoryTree, isLoading: categoriesLoading } =
    useCategoryTree(initialCategoryTree);
  const { onCartOpen, onAuthOpen } = useHeaderStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const cartItems = useCartStore((state) => state.cartItems);
  const totalItems = cartItems.length ? cartItems.length : 0;
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSearchOpen(false);
    };
    if (isSearchOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  /** Root-level categories capped at MAX_VISIBLE_CATEGORIES */
  const visibleCategories = categoryTree.slice(0, MAX_VISIBLE_CATEGORIES);
  const hasMoreCategories = categoryTree.length > MAX_VISIBLE_CATEGORIES;

  return (
    <div
      className={`hidden xl:flex header-bottom max-w-full overflow-x-hidden transition-all duration-300 ${isSearchOpen ? "z-[220]" : "z-40"} ${
        isSticky
          ? "fixed top-0 left-0 w-full bg-white shadow-md animate-fadeInDown"
          : syncedAtTop
            ? "relative"
            : "relative bg-white"
      }`}
      style={
        syncedAtTop && !isSticky && gradientStyle
          ? gradientStyle
          : undefined
      }
    >
      <div className="w-full px-6 sm:px-8 md:px-10 lg:px-12 pt-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full gap-4">
          {/* Left: Logo */}
          <div className="justify-self-start flex items-center min-w-0">
            <Logo className={`w-24 ${onDarkHero ? "brightness-0 invert" : ""}`} />
          </div>

          {/* Center: Menus */}
          <div className="justify-self-center flex items-center">
          {false && (
          <div className="relative group">
            <button className="flex items-center gap-x-2 bg-primary-light hover:bg-primary text-foreground hover:text-primary-foreground px-6 py-4 rounded-lg font-semibold transition-colors duration-300">
              <LayoutGrid className="size-5" />
              Explore All Categories
              <ChevronDown className="size-5 transition-transform duration-300 group-hover:rotate-180" />
            </button>

            <ul className="absolute left-0 top-full w-[280px] bg-background shadow-dark-z-24 rounded-b-lg border-x border-b border-border z-50 transition-all duration-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {categoriesLoading ? (
                /* Skeleton loading state */
                Array.from({ length: 6 }).map((_, i) => (
                  <li
                    key={`skel-${i}`}
                    className="border-b last:border-b-0 border-border/50 px-6 py-3 flex items-center gap-x-3"
                  >
                    <span className="size-8 rounded-full bg-muted animate-pulse" />
                    <span className="h-4 w-28 rounded bg-muted animate-pulse" />
                  </li>
                ))
              ) : visibleCategories.length === 0 ? (
                <li className="px-6 py-4 text-sm text-muted-foreground text-center">
                  No categories available
                </li>
              ) : (
                <>
                  {visibleCategories.map((cat) => (
                    <li
                      key={cat._id}
                      className="border-b last:border-b-0 border-border/50 group/item relative"
                    >
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        className="flex items-center justify-between px-6 py-3 hover:bg-muted hover:text-primary transition-colors duration-300"
                      >
                        <div className="flex items-center gap-x-3">
                          <span className="size-8 flex items-center justify-center border border-border rounded-full bg-white overflow-hidden shrink-0">
                            <CategoryImage category={cat} />
                          </span>
                          <span className="text-sm font-medium truncate max-w-[160px]">
                            {cat.name}
                          </span>
                        </div>
                        {cat.children && cat.children.length > 0 && (
                          <ChevronRight className="size-4 text-muted-foreground group-hover/item:text-primary transition-colors shrink-0" />
                        )}
                      </Link>

                      {/* Sub-menu (2nd Level) */}
                      {cat.children && cat.children.length > 0 && (
                        <ul className="absolute left-full top-0 w-[240px] bg-background shadow-dark-z-24 rounded-lg border border-border z-50 transition-all duration-300 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible group-hover/item:translate-x-0 -translate-x-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                          {cat.children.map((sub) => (
                            <li
                              key={sub._id}
                              className="border-b last:border-b-0 border-border/50 relative group/sub"
                            >
                              <Link
                                href={`/shop?category=${sub.slug}`}
                                className="flex items-center justify-between px-6 py-3 hover:bg-muted hover:text-primary transition-colors duration-300 text-sm font-medium"
                              >
                                <span className="truncate max-w-[150px]">
                                  {sub.name}
                                </span>
                                {sub.children && sub.children.length > 0 && (
                                  <ChevronRight className="size-4 text-muted-foreground group-hover/sub:text-primary transition-colors shrink-0" />
                                )}
                              </Link>

                              {/* Sub-sub-menu (3rd Level) */}
                              {sub.children && sub.children.length > 0 && (
                                <ul className="absolute left-full top-0 w-[220px] bg-background shadow-dark-z-24 rounded-lg border border-border z-50 transition-all duration-300 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible group-hover/sub:translate-x-0 -translate-x-2 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                                  {sub.children.map((third) => (
                                    <li
                                      key={third._id}
                                      className="border-b last:border-b-0 border-border/50"
                                    >
                                      <Link
                                        href={`/shop?category=${third.slug}`}
                                        className="flex items-center px-6 py-3 hover:bg-muted hover:text-primary transition-colors duration-300 text-sm font-medium"
                                      >
                                        <span className="truncate">
                                          {third.name}
                                        </span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}

                  {/* View All Categories link */}
                  {hasMoreCategories && (
                    <li className="border-t border-border/50">
                      <Link
                        href="/categories"
                        className="flex items-center justify-center gap-x-2 px-6 py-3.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors duration-300"
                      >
                        View All Categories
                        <ArrowRight className="size-4" />
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>

          )}

          {/* Main Navigation */}
          <nav className="main-menu">
            <ul className="flex items-center">
              {menusLoading ? (
                // Simple skeleton or loading state
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-4 w-20 bg-gray-200 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                menus.map((item) => (
                  <li
                    key={item._id || item.id}
                    className={
                      (item.subItems && item.subItems.length > 0) || item.isMega
                        ? "has-sub-item"
                        : ""
                    }
                  >
                    <Link
                      href={item.href}
                      className={`hover:text-primary transition-colors flex items-center gap-1 ${onDarkHero ? "text-white" : "text-black"}`}
                    >
                      {item.title}
                      {((item.subItems && item.subItems.length > 0) ||
                        item.isMega) && <ChevronDown className="size-4" />}
                    </Link>

                    {/* Standard Sub-menu */}
                    {item.subItems &&
                      item.subItems.length > 0 &&
                      !item.isMega && (
                        <ul>
                          {item.subItems.map((subItem) => (
                            <li
                              key={subItem._id || subItem.id}
                              className={
                                subItem.subItems && subItem.subItems.length > 0
                                  ? "has-sub-item"
                                  : ""
                              }
                            >
                              <Link
                                href={subItem.href}
                                className={`text-black hover:text-primary transition-colors ${
                                  subItem.subItems &&
                                  subItem.subItems.length > 0
                                    ? "flex items-center justify-between w-full"
                                    : ""
                                }`}
                              >
                                {subItem.title}
                                {subItem.subItems &&
                                  subItem.subItems.length > 0 && (
                                    <ChevronRight className="size-4" />
                                  )}
                              </Link>
                              {subItem.subItems &&
                                subItem.subItems.length > 0 && (
                                  <ul>
                                    {subItem.subItems.map((thirdItem) => (
                                      <li key={thirdItem._id || thirdItem.id}>
                                        <Link
                                          href={thirdItem.href}
                                          className="text-black hover:text-primary transition-colors block w-full"
                                        >
                                          {thirdItem.title}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                            </li>
                          ))}
                        </ul>
                      )}

                    {/* Mega Menu */}
                    {item.isMega && item.megaData && (
                      <div className="mega-menu">
                        <div className="p-10">
                          <div className="grid grid-cols-6 gap-x-4 divide-x divide-border">
                            {item.megaData.map((column, colIdx) => (
                              <div
                                key={column._id || column.id || colIdx}
                                className={`flex flex-col gap-y-1.5 ${
                                  (colIdx + 1) % 10 === 1
                                    ? "pr-4"
                                    : (colIdx + 1) % 10 === 6
                                      ? "pl-4"
                                      : "px-4"
                                }`}
                              >
                                <h5 className="text-sm leading-[22px] uppercase font-semibold text-black mb-2">
                                  {column.title}
                                </h5>
                                <ul className="flex flex-col gap-y-2">
                                  {column.items.map((subLink, subIdx) => {
                                    const rawHref = subLink.href || "#";
                                    let formattedHref = rawHref;

                                    if (
                                      rawHref !== "#" &&
                                      !rawHref.startsWith("http") &&
                                      !rawHref.startsWith("/menu/")
                                    ) {
                                      const cleanHref = rawHref.startsWith("/")
                                        ? rawHref.slice(1)
                                        : rawHref;
                                      formattedHref = `/menu/${cleanHref}`;
                                    }

                                    return (
                                      <li
                                        key={
                                          subLink._id || subLink.id || subIdx
                                        }
                                      >
                                        <Link
                                          href={formattedHref}
                                          className="text-black hover:text-primary transition-colors inline-block w-full"
                                        >
                                          {subLink.title}
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </nav>
          </div>

          {/* Right: Search / Account / Cart icons (no backgrounds) */}
          <div className="justify-self-end flex items-center gap-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className={`inline-flex items-center justify-center size-11 transition-colors ${onDarkHero ? "text-white hover:text-white/80" : "text-foreground hover:text-primary"}`}
              aria-label="Search"
            >
              <Search className="size-6" strokeWidth={1.75} />
            </button>

            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  router.push(
                    user?.role === "vendor"
                      ? "/vendor-dashboard"
                      : "/user/dashboard",
                  );
                  return;
                }
                onAuthOpen("login");
              }}
              className={`inline-flex items-center justify-center size-11 transition-colors ${onDarkHero ? "text-white hover:text-white/80" : "text-foreground hover:text-primary"}`}
              aria-label="Account"
            >
              <User className="size-6" strokeWidth={1.75} />
            </button>

            <button
              type="button"
              onClick={onCartOpen}
              className={`relative inline-flex items-center justify-center size-11 transition-colors ${onDarkHero ? "text-white hover:text-white/80" : "text-foreground hover:text-primary"}`}
              aria-label="Cart"
            >
              <ShoppingCart className="size-6" strokeWidth={1.75} />
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-width search overlay — portaled so TopHeader cannot cover it */}
      {isSearchOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[300]">
            <button
              type="button"
              aria-label="Close search"
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
              onClick={() => setIsSearchOpen(false)}
            />
            <div className="relative z-10 w-full bg-white border-b border-border shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="w-full px-6 sm:px-8 md:px-10 lg:px-12 py-5 md:py-6">
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-1 min-w-0">
                    <SearchHeader
                      id="bottom-header-search"
                      className="w-full !max-w-none"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="inline-flex items-center justify-center size-11 shrink-0 rounded-full border border-border bg-muted/40 text-foreground hover:bg-muted transition-colors mt-0.5"
                    aria-label="Close search"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default BottomHeader;
