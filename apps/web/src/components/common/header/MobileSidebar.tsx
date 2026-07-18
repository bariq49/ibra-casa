"use client";
import React, { useState } from "react";
import {
  X,
  ChevronDown,
  Lock,
  Phone,
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import Logo from "../Logo";
import { useMenus } from "@/hooks/useMenus";
import { NavItem } from "@/constants/data";

interface SubMenuProps {
  title: string;
  path?: string;
  active?: boolean;
  children?: React.ReactNode;
  onClose?: () => void;
}

const SubMenu = ({
  title,
  path = "#",
  active = false,
  children,
  onClose,
}: SubMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="border-b border-gray-100 last:border-0">
      <div
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => {
          if (children) {
            setIsOpen(!isOpen);
          }
        }}
      >
        <Link
          href={path}
          className={`py-3 text-[15px] font-medium transition-colors duration-300 ${
            active ? "text-primary" : "text-gray-700 hover:text-primary"
          }`}
          onClick={(e) => {
            if (children && (path === "#" || path === "")) {
              e.preventDefault();
              // Toggle is handled by the parent div
            } else if (onClose) {
              onClose();
            }
          }}
        >
          {title}
        </Link>
        {children && (
          <button className="p-3 text-gray-400 group-hover:text-primary transition-colors duration-300">
            <ChevronDown
              size={18}
              className={`transform transition-transform duration-500 ease-in-out ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        )}
      </div>
      {children && (
        <div
          className={`grid transition-all duration-500 ease-in-out ${
            isOpen
              ? "grid-rows-[1fr] opacity-100 mb-2"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <ul className="overflow-hidden pl-4 pr-2">{children}</ul>
        </div>
      )}
    </li>
  );
};

import { CategoryTreeNode, useCategoryTree } from "@/hooks/useCategoryTree";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  initialMenus?: NavItem[];
  initialCategoryTree?: CategoryTreeNode[];
}

const MobileSidebar = ({ 
  isOpen, 
  onClose, 
  initialMenus, 
  initialCategoryTree 
}: MobileSidebarProps) => {
  const { menus, isLoading } = useMenus(initialMenus);
  const { tree: categoryTree } = useCategoryTree(initialCategoryTree);
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-999 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-[300px] sm:w-[350px] bg-white h-full z-1000 shadow-2xl transform transition-transform duration-500 cubic-bezier(0.645,0.045,0.355,1) flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <Logo className="w-24" />
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-primary transition-all duration-300 text-base"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <nav>
            <ul className="flex flex-col">
              <SubMenu title="Categories" onClose={onClose}>
                <li>
                  <Link
                    href="#"
                    onClick={onClose}
                    className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    Fresh & Organic
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    onClick={onClose}
                    className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    Baby Food
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    Vegetables
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    Meat & Fish
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    Dairy & Eggs
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    Bakery & Snacks
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    Rice & Pulses
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    Beverages
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    onClick={onClose}
                    className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    Frozen Foods
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    Sauces & Pickels
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    Health & Wellness
                  </Link>
                </li>
              </SubMenu>

              {/* Dynamic Menu Items */}
              {isLoading ? (
                // Skeleton loading
                <div className="space-y-4 p-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-6 bg-gray-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                menus.map((item: NavItem) => {
                  // Handle standard sub-menus
                  if (item.subItems && item.subItems.length > 0) {
                    return (
                      <SubMenu
                        key={item._id || item.id}
                        title={item.title}
                        path={item.href}
                        onClose={onClose}
                      >
                        {item.subItems.map((sub: NavItem) => (
                          <div key={sub._id || sub.id}>
                            {sub.subItems && sub.subItems.length > 0 ? (
                              <SubMenu title={sub.title} path={sub.href} onClose={onClose}>
                                {sub.subItems.map((third: NavItem) => (
                                  <li key={third._id || third.id}>
                                    <Link
                                      href={third.href}
                                      onClick={onClose}
                                      className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                                    >
                                      {third.title}
                                    </Link>
                                  </li>
                                ))}
                              </SubMenu>
                            ) : (
                              <li>
                                <Link
                                  href={sub.href}
                                  onClick={onClose}
                                  className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                                >
                                  {sub.title}
                                </Link>
                              </li>
                            )}
                          </div>
                        ))}
                      </SubMenu>
                    );
                  }

                  // Handle Mega Menus
                  if (item.isMega && item.megaData) {
                    return (
                      <SubMenu
                        key={item._id || item.id}
                        title={item.title}
                        path={item.href}
                        onClose={onClose}
                      >
                        {item.megaData.map((col: any) => (
                          <SubMenu
                            key={col._id || col.id}
                            title={col.title}
                            path="#"
                            onClose={onClose}
                          >
                            {col.items.map((subLink: any) => {
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
                                <li key={subLink._id || subLink.id}>
                                  <Link
                                    href={formattedHref}
                                    onClick={onClose}
                                    className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                                  >
                                    {subLink.title}
                                  </Link>
                                </li>
                              );
                            })}
                          </SubMenu>
                        ))}
                      </SubMenu>
                    );
                  }

                  // Simple Menu Item
                  return (
                    <li key={item._id || item.id}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="block py-3 text-[15px] font-medium text-gray-700 hover:text-primary border-b border-gray-100 transition-colors"
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
          </nav>

          {/* Contact Info */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="flex flex-col gap-y-4">
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-x-4 text-gray-700 hover:text-primary group transition-all duration-300"
              >
                <span className="p-2.5 bg-orange-50 text-orange-600 rounded-full group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Lock size={18} />
                </span>
                <span className="font-medium text-[15px]">Login / Sign Up</span>
              </Link>
              <a
                href="tel:888777999"
                className="flex items-center gap-x-4 text-gray-700 hover:text-primary group transition-all duration-300"
              >
                <span className="p-2.5 bg-orange-50 text-orange-600 rounded-full group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Phone size={18} />
                </span>
                <span className="font-medium text-[15px]">888-777-999</span>
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-8 pb-10">
            <h4 className="text-[11px] font-bold text-gray-400 mb-5 uppercase tracking-[0.2em]">
              Follow us
            </h4>
            <div className="flex items-center gap-x-3">
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-full hover:bg-primary transition-all duration-500 hover:-translate-y-1 shadow-lg hover:shadow-primary/30"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-full hover:bg-primary transition-all duration-500 hover:-translate-y-1 shadow-lg hover:shadow-primary/30"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-full hover:bg-primary transition-all duration-500 hover:-translate-y-1 shadow-lg hover:shadow-primary/30"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-full hover:bg-primary transition-all duration-500 hover:-translate-y-1 shadow-lg hover:shadow-primary/30"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
