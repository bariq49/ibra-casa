"use client";
import React from "react";
import Container from "../Container";
import { Headset } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import LanguageToggle from "./LanguageToggle";
import { useAuthStore } from "@/store/useAuthStore";
import { useHeaderStore } from "@/store/useHeaderStore";

const TopHeader = () => {
  const t = useTranslations("Header");
  const { onAuthOpen } = useHeaderStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="bg-primary-light header-top relative z-60">
      <Container>
        <div className="flex flex-col xl:flex-row items-center justify-between gap-y-2 lg:gap-y-0">
          <div className="xl:flex items-center gap-x-6 hidden">
            <p className="flex items-center gap-x-2 text-foreground text-sm font-thin line-clamp-1">
              <span>
                <Headset className="size-5 text-foreground" />
              </span>
              {t("needSupport")}
              <span>{t("callUs")}</span>
              <Link
                href="tel:(480)555-0103"
                className="bg-warning py-px px-2 text-xs leading-4.5 rounded-[60px] text-foreground"
              >
                (480) 555-0103
              </Link>
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-x-4">
            <ul className="flex items-center text-foreground">
              <li>
                <Link href="/about" className="topHeaderNavBtn">
                  {t("topNav.about")}
                </Link>
              </li>
              <li>
                {isAuthenticated ? (
                  <Link href="/user/dashboard" className="topHeaderNavBtn">
                    My Account
                  </Link>
                ) : (
                  <button
                    onClick={() => onAuthOpen("login")}
                    className="topHeaderNavBtn"
                  >
                    {t("topNav.account")}
                  </button>
                )}
              </li>
              <li>
                <Link
                  href={
                    isAuthenticated ? "/user/wishlist" : "/wishlist-style-v1"
                  }
                  className="topHeaderNavBtn"
                >
                  {t("topNav.wishlist")}
                </Link>
              </li>
              <li>
                <Link href="/compare" className="topHeaderNavBtn">
                  {t("topNav.compare")}
                </Link>
              </li>
              <li>
                <Link
                  href="/order-tracking"
                  className="topHeaderNavBtn border-r-0"
                >
                  {t("topNav.tracking")}
                </Link>
              </li>
            </ul>
            <LanguageToggle />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TopHeader;
