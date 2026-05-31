"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectCartCount } from "@/store/selectors";
import { openCart } from "@/store/slices/cartSlice";
import { Search, Menu as MenuIcon, X } from "lucide-react";
import { trackCartAction, trackMobileMenu } from "@/lib/analytics";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

const SearchAutocomplete = dynamic(
  () =>
    import("@/components/SearchAutocomplete").then((mod) => ({
      default: mod.SearchAutocomplete,
    })),
  {
    ssr: false,
  }
);

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const totalCartItems = useAppSelector(selectCartCount);
  const isHydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
    trackMobileMenu("open");
  };

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchModalOpen(false);
  };

  const handleProductSelect = (slug: string) => {
    router.push(`/products/${slug}`);
    setIsSearchModalOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-zinc-800 ${className}`}
        suppressHydrationWarning
      >
        {/* Mobile Layout */}
        <div className="md:hidden container mx-auto p-4 flex items-center justify-between">
          <button type="button"
            onClick={handleMenuClick}
            className="flex items-center justify-center size-10 text-white hover:text-zinc-300 transition-colors"
            aria-label={t("toggleMenu")}
          >
            <MenuIcon className="size-5" />
          </button>

          <div className="flex items-center gap-2">
            <button type="button"
              onClick={handleSearchClick}
              className="flex items-center justify-center size-10 text-white hover:text-zinc-300 transition-colors cursor-pointer"
              aria-label={t("searchProductsAria")}
            >
              <Search className="size-5" />
            </button>

            <button type="button"
              onClick={() => dispatch(openCart())}
              className="flex items-center justify-center size-10 text-white hover:text-zinc-300 transition-colors relative cursor-pointer"
              aria-label={t("shoppingCartAria")}
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              {isHydrated && totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold size-5 rounded-full flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex container mx-auto px-6 py-4 items-center justify-between">
          <Link href="/" className="flex items-center">
            {isHydrated && (
              <Image
                src="/logo-32.png"
                alt={t("brandName")}
                width={32}
                height={32}
                className="size-8 brightness-0 invert"
              />
            )}
            <span className="text-2xl font-semibold text-white">
              &apos;s shoucangpu
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {[
              { href: "/", label: t("home") },
              { href: "/products", label: t("products") },
              { href: "/contacts", label: t("contacts") },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-lg font-medium tracking-wider transition-colors relative pb-0.5 ${
                  pathname === href
                    ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white after:rounded-full"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            <button type="button"
              onClick={handleSearchClick}
              className="flex items-center justify-center size-10 text-white hover:text-zinc-300 transition-colors cursor-pointer"
              aria-label={t("searchProductsAria")}
            >
              <Search className="size-5" />
            </button>

            <button type="button"
              onClick={() => {
                dispatch(openCart());
                trackCartAction("open");
              }}
              className="flex items-center justify-center size-10 text-white hover:text-zinc-300 transition-colors relative cursor-pointer"
              aria-label={t("shoppingCartAria")}
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              {isHydrated && totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold size-5 rounded-full flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => {
          setIsSidebarOpen(false);
          trackMobileMenu("close");
        }}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-zinc-900 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              {isHydrated && (
                <Image
                  src="/logo-32.png"
                  alt={t("brandName")}
                  width={32}
                  height={32}
                  className="size-8 brightness-0 invert"
                />
              )}
              <div className="text-2xl font-bold text-white tracking-wider">
                shoucangpu
              </div>
            </div>
            <button type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
              aria-label={t("closeMenu")}
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Language Switcher in Mobile */}
          <div className="mb-6">
            <LanguageSwitcher />
          </div>

          <div className="space-y-1">
            {[
              {
                href: "/",
                label: t("home"),
                icon: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z",
              },
              {
                href: "/products",
                label: t("products"),
                icon: "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z",
              },
              {
                href: "/contacts",
                label: t("contacts"),
                icon: "M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z",
              },
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 py-3 px-4 rounded-lg text-base font-medium tracking-wide transition-colors ${
                  pathname === href
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <svg className="size-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d={icon} />
                </svg>
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-700">
            <h3 className="text-base font-medium text-zinc-400 mb-4">
              {t("quickActions")}
            </h3>
            <div className="space-y-2">
              <button type="button"
                onClick={() => {
                  setIsSidebarOpen(false);
                  handleSearchClick();
                }}
                className="w-full text-left py-3 px-4 text-lg rounded-lg transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-3"
                aria-label={t("searchProductsAria")}
              >
                <Search className="size-5" />
                <span>{t("search")}</span>
              </button>
              <button type="button"
                onClick={() => {
                  setIsSidebarOpen(false);
                  dispatch(openCart());
                }}
                className="w-full text-left py-3 px-4 text-lg rounded-lg transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-white"
                aria-label={t("shoppingCartAria")}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <svg
                      className="size-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    <span>{t("shoppingCartAria")}</span>
                  </div>
                  {isHydrated && totalCartItems > 0 && (
                    <span className="bg-white text-black text-xs font-bold px-2 py-1 rounded-full shrink-0 ml-2">
                      {totalCartItems}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <SearchAutocomplete
          isOpen={isSearchModalOpen}
          onClose={handleSearchClose}
          onProductSelect={handleProductSelect}
        />
      )}
    </>
  );
}

export default Header;
