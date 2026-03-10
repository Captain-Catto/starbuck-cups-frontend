"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
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
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const totalCartItems = cartItems.length;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
        <div className="md:hidden container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleMenuClick}
            className="flex items-center justify-center w-10 h-10 text-white hover:text-zinc-300 transition-colors"
            aria-label={t("toggleMenu")}
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSearchClick}
              className="flex items-center justify-center w-10 h-10 text-white hover:text-zinc-300 transition-colors"
              aria-label={t("searchProductsAria")}
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => dispatch(openCart())}
              className="flex items-center justify-center w-10 h-10 text-white hover:text-zinc-300 transition-colors relative"
              aria-label={t("shoppingCartAria")}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              {isHydrated && totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex container mx-auto px-6 py-4 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {isHydrated && (
              <img
                src="/logo-32.png"
                alt={t("brandName")}
                width={32}
                height={32}
                className="w-8 h-8 brightness-0 invert"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <span className="text-lg font-semibold text-white">
              H&apos;s shoucangpu
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium hover:text-zinc-300 transition-colors ${
                pathname === "/" ? "text-white" : "text-zinc-400"
              }`}
            >
              {t("home")}
            </Link>
            <Link
              href="/products"
              className={`font-light tracking-wider transition-colors ${
                pathname === "/products"
                  ? "text-sm text-white"
                  : "text-sm text-zinc-400 hover:text-zinc-300"
              }`}
            >
              {t("products")}
            </Link>
            <Link
              href="/contacts"
              className={`font-light tracking-wider transition-colors ${
                pathname === "/contacts"
                  ? "text-sm text-white"
                  : "text-sm text-zinc-400 hover:text-zinc-300"
              }`}
            >
              {t("contacts")}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            <button
              onClick={handleSearchClick}
              className="flex items-center justify-center w-10 h-10 text-white hover:text-zinc-300 transition-colors"
              aria-label={t("searchProductsAria")}
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                dispatch(openCart());
                trackCartAction("open");
              }}
              className="flex items-center justify-center w-10 h-10 text-white hover:text-zinc-300 transition-colors relative"
              aria-label={t("shoppingCartAria")}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              {isHydrated && totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-opacity-50 z-50"
          onClick={() => {
            setIsSidebarOpen(false);
            trackMobileMenu("close");
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-zinc-900 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {isHydrated && (
                <img
                  src="/logo-32.png"
                  alt={t("brandName")}
                  width={32}
                  height={32}
                  className="w-8 h-8 brightness-0 invert"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <div className="text-lg font-bold text-white tracking-wider">
                H&apos;s shoucangpu
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
              aria-label={t("closeMenu")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Language Switcher in Mobile */}
          <div className="mb-6">
            <LanguageSwitcher />
          </div>

          <div className="space-y-2">
            <Link
              href="/"
              onClick={() => setIsSidebarOpen(false)}
              className={`block py-3 px-4 rounded-lg transition-colors ${
                pathname === "/"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                {t("home")}
              </div>
            </Link>
            <Link
              href="/products"
              onClick={() => setIsSidebarOpen(false)}
              className={`block py-3 px-4 rounded-lg transition-colors ${
                pathname === "/products"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM10 18V9l5.5-4H4.5L10 9v9z"
                  />
                </svg>
                {t("products")}
              </div>
            </Link>
            <Link
              href="/contacts"
              onClick={() => setIsSidebarOpen(false)}
              className={`block py-3 px-4 rounded-lg transition-colors ${
                pathname === "/contacts"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {t("contacts")}
              </div>
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-700">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">
              {t("quickActions")}
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  handleSearchClick();
                }}
                className="w-full text-left py-3 px-4 rounded-lg transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-3"
                aria-label={t("searchProductsAria")}
              >
                <Search className="w-5 h-5" />
                <span>{t("search")}</span>
              </button>
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  dispatch(openCart());
                }}
                className="w-full text-left py-3 px-4 rounded-lg transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-white"
                aria-label={t("shoppingCartAria")}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    <span>{t("shoppingCartAria")}</span>
                  </div>
                  {isHydrated && totalCartItems > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full shrink-0 ml-2">
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
