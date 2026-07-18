"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  EnglishFlag,
  FrenchFlag,
  GermanFlag,
  ItalianFlag,
  SingaporeFlag,
} from "@/components/svgs/HeaderFlags";
import { ChevronDown } from "lucide-react";

const LOCALES = [
  { code: "en", name: "English", icon: <EnglishFlag /> },
  { code: "de", name: "German", icon: <GermanFlag /> },
  { code: "fr", name: "French", icon: <FrenchFlag /> },
  { code: "it", name: "Italian", icon: <ItalianFlag /> },
  { code: "en-SG", name: "Singapore", icon: <SingaporeFlag /> },
];

const LanguageToggle = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const currentLocaleItem =
    LOCALES.find((l) => l.code === locale) || LOCALES[0];

  return (
    <div className="relative group">
      <Link
        href="#"
        className="text-sm text-foreground inline-flex items-center gap-x-2 py-3.5"
      >
        <span className="inline-flex items-center justify-center size-7 bg-primary-dark rounded-full">
          {currentLocaleItem.icon}
        </span>
        {currentLocaleItem.name}
        <span className="inline-flex items-center justify-center">
          <ChevronDown className="size-5 text-foreground" />
        </span>
      </Link>

      <ul className="absolute left-0 top-[calc(100%-4px)] py-2 z-50 w-[250px] max-w-[250px] bg-white rounded-lg shadow-dark-z-24 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 before:absolute before:content-[''] before:w-full before:h-6 before:-top-4 before:left-0">
        {LOCALES.map((l) => (
          <li key={l.code} className="py-2 px-4 group/item">
            <Link
              href={pathname}
              locale={l.code}
              scroll={false}
              className="flex items-center gap-x-2 relative text-foreground group-hover/item:text-primary"
            >
              <span
                className={`w-8 h-8 ${locale === l.code ? "bg-primary/8" : "bg-gray-100"} group-hover/item:bg-primary/8 inline-flex items-center justify-center rounded-full`}
              >
                {l.icon}
              </span>
              {l.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LanguageToggle;
