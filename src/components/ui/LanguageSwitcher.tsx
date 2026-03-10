"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { ChevronDown } from "lucide-react";

import Image from "next/image";

const localeFlags: Record<Locale, string> = {
  vi: "https://flagcdn.com/w40/vn.png",
  en: "https://flagcdn.com/w40/gb.png",
  zh: "https://flagcdn.com/w40/cn.png",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Desktop: Dropdown */}
      <div className="hidden md:block relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white rounded transition-colors"
        >
          <Image 
            src={localeFlags[locale]} 
            alt={locale} 
            width={20} 
            height={15} 
            className="rounded-sm object-cover shadow-sm"
          />
          <span>{localeNames[locale]}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-1 min-w-[120px] z-50">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  locale === loc
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-300 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                <Image 
                  src={localeFlags[loc]} 
                  alt={loc} 
                  width={20} 
                  height={15} 
                  className="rounded-sm object-cover shadow-sm"
                />
                <span>{localeNames[loc]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile: Inline buttons (unchanged) */}
      <div className="flex md:hidden items-center gap-1">
        {locales.map((loc, index) => (
          <span key={loc} className="flex items-center">
            {index > 0 && <span className="text-zinc-600 mx-1">|</span>}
            <button
              onClick={() => handleLocaleChange(loc)}
              className={`text-xs font-medium px-1.5 py-0.5 rounded transition-colors ${
                locale === loc
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {localeNames[loc]}
            </button>
          </span>
        ))}
      </div>
    </>
  );
}
