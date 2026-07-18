"use client";
import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/routing";
import {
  ChevronDown,
  ChevronRight,
  Headset,
  LayoutGrid,
  ArrowRight,
  PhoneCall,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import Container from "../Container";
import { useTranslations } from "next-intl";
import { useMenus } from "@/hooks/useMenus";
import { useCategoryTree, CategoryTreeNode } from "@/hooks/useCategoryTree";
import { NavItem } from "@/constants/data";
import Image from "next/image";

const MAX_VISIBLE_CATEGORIES = 12;

interface BottomHeaderProps {
  isSticky?: boolean;
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
  initialMenus,
  initialCategoryTree,
}: BottomHeaderProps) => {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const supportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supportRef.current &&
        !supportRef.current.contains(event.target as Node)
      ) {
        setIsSupportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { menus, isLoading: menusLoading } = useMenus(initialMenus);
  const { tree: categoryTree, isLoading: categoriesLoading } =
    useCategoryTree(initialCategoryTree);

  /** Root-level categories capped at MAX_VISIBLE_CATEGORIES */
  const visibleCategories = categoryTree.slice(0, MAX_VISIBLE_CATEGORIES);
  const hasMoreCategories = categoryTree.length > MAX_VISIBLE_CATEGORIES;

  return (
    <div
      className={`border-y border-border hidden xl:flex header-bottom bg-background z-40 transition-all duration-300 ${
        isSticky
          ? "fixed top-0 left-0 w-full shadow-md animate-fadeInDown"
          : "relative"
      }`}
    >
      <Container className="flex items-center justify-between w-full">
        <div className="flex items-center gap-x-8">
          {/* Category Menu */}
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
                      className="text-black hover:text-primary transition-colors flex items-center gap-1"
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

        {/* Support Section */}
        <div
          className="relative z-50"
          ref={supportRef}
          onMouseEnter={() => setIsSupportOpen(true)}
          onMouseLeave={() => setIsSupportOpen(false)}
        >
          <div
            onClick={() => setIsSupportOpen(!isSupportOpen)}
            className="flex items-center gap-x-4 py-2 cursor-pointer group select-none"
          >
            <div className="size-12 flex items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-warning/20 shadow-sm border border-transparent group-hover:border-warning/30">
              <Headset className="size-6 text-primary" />
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-xs text-muted-foreground leading-tight group-hover:text-primary transition-colors">
                24/7 Support
              </span>
              <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                888-777-999
              </span>
            </div>
          </div>

          {/* Dropdown Menu */}
          <ul
            className={`absolute right-0 top-full mt-2 w-[220px] bg-background shadow-dark-z-24 rounded-lg border border-border z-50 transition-all duration-300 overflow-hidden origin-top ${
              isSupportOpen
                ? "opacity-100 visible scale-y-100"
                : "opacity-0 invisible scale-y-0"
            }`}
          >
            <li className="border-b last:border-b-0 border-border/50">
              <a
                href="tel:888-777-999"
                className="flex items-center gap-x-3 px-5 py-3.5 hover:bg-muted hover:text-primary transition-colors duration-300 w-full text-[15px] font-semibold text-foreground/90 group"
                onClick={() => setIsSupportOpen(false)}
              >
                <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                  <PhoneCall className="size-4 text-primary" />
                </div>
                Make a Call
              </a>
            </li>
            <li className="border-b last:border-b-0 border-border/50">
              <button
                onClick={() => {
                  navigator.clipboard.writeText("888-777-999");
                  toast.success("Phone number copied!", {
                    description: (
                      <span className="text-foreground/90 font-medium tracking-tight">
                        888-777-999 has been copied to your clipboard.
                      </span>
                    ),
                  });
                  setIsSupportOpen(false);
                }}
                className="flex items-center gap-x-3 px-5 py-3.5 hover:bg-muted hover:text-primary transition-colors duration-300 w-full text-[15px] font-semibold text-left text-foreground/90 group"
              >
                <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Copy className="size-4 text-primary" />
                </div>
                Copy Number
              </button>
            </li>
          </ul>
        </div>
      </Container>
    </div>
  );
};

export default BottomHeader;
