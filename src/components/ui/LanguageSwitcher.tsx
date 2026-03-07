"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales, localeNames, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1">
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
  );
}
