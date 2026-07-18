"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Container from "../common/Container";
import { homeIcon } from "@/images";

interface BreadcrumbProps {
  items?: {
    label: string;
    href?: string;
  }[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const pathname = usePathname();

  // Generate dynamic breadcrumbs if items prop is not provided
  const breadcrumbItems = React.useMemo(() => {
    if (items && items.length > 0) return items;

    const locales = ["en", "de", "fr", "it", "en-SG"];
    let localeSegment = "";
    let rawSegments = pathname.split("/").filter((segment) => segment !== "");
    
    if (locales.includes(rawSegments[0])) {
      localeSegment = "/" + rawSegments[0];
      rawSegments = rawSegments.slice(1);
    }

    return rawSegments.map((segment, index) => {
      const href = localeSegment + "/" + rawSegments.slice(0, index + 1).join("/");
      const label = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      // If it's the last segment, we don't need a link
      return {
        label,
        href: index === rawSegments.length - 1 ? undefined : (href || "/"),
      };
    });
  }, [items, pathname]);

  const homeHref = React.useMemo(() => {
    const locales = ["en", "de", "fr", "it", "en-SG"];
    const firstSeg = pathname.split("/").filter(Boolean)[0];
    return locales.includes(firstSeg) ? `/${firstSeg}` : "/";
  }, [pathname]);

  return (
    <div className="py-12">
      <Container>
        <div className="flex items-center gap-x-2 text-sm pb-2 w-full">
          <ul className="flex items-center gap-x-2 font-urbanist w-full overflow-hidden whitespace-nowrap">
            <li className="shrink-0">
              <Link
                href={homeHref}
                className="flex items-center gap-x-1.5 text-muted-foreground hover:text-primary transition-colors font-medium text-base"
              >
                <Image
                  src={homeIcon}
                  alt="Home"
                  className="w-[18px] h-[18px]"
                />
                Home
              </Link>
            </li>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                <li className="text-muted-foreground/50 text-base shrink-0">
                  <ChevronRight size={15} />
                </li>
                <li className={item.href ? "shrink-0" : "min-w-0 flex-1"}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-base"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-semibold text-base block truncate">
                      {item.label}
                    </span>
                  )}
                </li>
              </React.Fragment>
            ))}
          </ul>
        </div>
      </Container>
    </div>
  );
};

export default Breadcrumb;
