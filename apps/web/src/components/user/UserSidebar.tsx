"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogoutDialog } from "@/components/user/LogoutDialog";
import {
  LayoutDashboard,
  RefreshCcw,
  Heart,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  MapPin,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function UserSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/user/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Order History",
      href: "/user/orders",
      icon: RefreshCcw,
    },
    {
      title: "Notifications",
      href: "/user/notifications",
      icon: Bell,
    },
    {
      title: "My Addresses",
      href: "/user/addresses",
      icon: MapPin,
    },
    {
      title: "Wishlist",
      href: "/user/wishlist", // Adjust to match actual routings if different
      icon: Heart,
    },
    {
      title: "Shopping Cart",
      href: "/cart", // Adjust if needed
      icon: ShoppingCart,
    },
    {
      title: "Settings",
      href: "/user/settings",
      icon: Settings,
    },
  ];

  // Helper to check if a route is active.
  const isActive = (href: string) => {
    // pathname contains locale (e.g. /en/user/dashboard)
    // we just check if it ends with or includes the href
    return pathname.includes(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <Card className="hidden xl:flex w-[312px] shrink-0 rounded-[16px] border-border overflow-hidden bg-white shadow-sm flex-col pt-2 pb-4">
        <nav className="flex flex-col gap-1 w-full">
          <h2 className="text-xl font-bold px-6 py-4">Navigation</h2>

          <div className="flex flex-col w-full">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "relative w-full justify-start rounded-none h-14 px-6 gap-4 text-base font-normal transition-colors",
                    active
                      ? "bg-light-bg text-primary hover:bg-light-bg/80"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {/* Active left border indicator */}
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <item.icon
                    className={cn(
                      "size-5",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  {item.title}
                </Link>
              );
            })}

            <LogoutDialog>
              <button
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "relative w-full justify-start rounded-none h-14 px-6 gap-4 text-base font-normal text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground mt-2",
                )}
              >
                <LogOut className="size-5 text-muted-foreground" />
                Log out
              </button>
            </LogoutDialog>
          </div>
        </nav>
      </Card>

      {/* Mobile Accordion Navigation */}
      <div className="xl:hidden w-full mb-4">
        <Accordion
          type="single"
          collapsible
          className="w-full bg-white rounded-[16px] shadow-sm border border-border"
        >
          <AccordionItem value="navigation" className="border-none">
            <AccordionTrigger className="px-6 py-4 text-xl font-bold hover:no-underline [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center justify-between w-full pr-4">
                <span>Navigation</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-0">
              <div className="flex flex-col w-full">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "relative w-full justify-start rounded-none h-14 px-6 gap-4 text-base font-normal transition-colors",
                        active
                          ? "bg-light-bg text-primary hover:bg-light-bg/80"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      {active && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      )}
                      <item.icon
                        className={cn(
                          "size-5",
                          active ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      {item.title}
                    </Link>
                  );
                })}

                <LogoutDialog>
                  <button
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "relative w-full justify-start rounded-none h-14 px-6 gap-4 text-base font-normal text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground mt-2",
                    )}
                  >
                    <LogOut className="size-5 text-muted-foreground" />
                    Log out
                  </button>
                </LogoutDialog>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
