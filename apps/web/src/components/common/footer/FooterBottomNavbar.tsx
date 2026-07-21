"use client";
import { usePathname, useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/store/useAuthStore";
import { useHeaderStore } from "@/store/useHeaderStore";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";

import { Home, Package, Heart, UserCircle } from "lucide-react";

const footerBottomNavItems = [
  { href: "/", icon: Home, label: "Home", isProtected: false },
  {
    href: "/user/orders",
    icon: Package,
    label: "My Order",
    isProtected: true,
  },
  { href: "/wishlist-style-v1", icon: Heart, label: "Wishlist", isProtected: false },
  { href: "/user/dashboard", icon: UserCircle, label: "My Account", isProtected: true },
];

const FooterBottomNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { onAuthOpen } = useHeaderStore();
  
  // Track where the user wanted to go before login
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // If they become authenticated and we have a pending path, redirect them
  useEffect(() => {
    if (isAuthenticated && pendingPath) {
      router.push(pendingPath as any);
      setPendingPath(null);
    }
  }, [isAuthenticated, pendingPath, router]);

  const handleNavClick = (href: string, isProtected: boolean) => {
    if (isProtected && !isAuthenticated) {
      setPendingPath(href);
      onAuthOpen("login");
    } else {
      router.push(href as any);
    }
  };

  return (
    <div className="w-full z-80 bg-white text-primary border-t border-gray-300 block md:hidden fixed bottom-0 left-0 pb-safe">
      <div className="container px-2">
        <ul className="flex items-center justify-between footer-bottom-nav -mt-px relative">
          {footerBottomNavItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <li key={index} className="flex-1">
                <button
                  type="button"
                  onClick={() => handleNavClick(item.href, item.isProtected)}
                  className={`w-full flex items-center flex-col gap-y-1 text-sm leading-[22px] px-[9px] pt-2.5 pb-2 transition-colors relative ${
                    isActive ? "text-primary" : "text-light-primary-text hover:text-primary/70"
                  }`}
                >
                  {/* Active Indicator Animation */}
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute top-0 left-0 right-0 h-[2px] bg-primary rounded-b-md"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="inline-flex items-center justify-center relative">
                    {isAuthenticated && item.label === "My Account" && user?.avatar ? (
                      <div className={`w-[24px] h-[24px] rounded-full overflow-hidden border transition-transform duration-300 ${isActive ? "scale-110 border-primary shadow-sm" : "scale-100 border-border"}`}>
                         <Image src={user.avatar} alt="Avatar" width={24} height={24} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <item.icon
                        className={`w-6 h-6 leading-6 transition-transform duration-300 ${
                          isActive ? "scale-110" : "scale-100"
                        }`}
                      />
                    )}
                  </span>
                  <span className="font-medium text-[11px] sm:text-xs text-nowrap mt-0.5">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default FooterBottomNavbar;
