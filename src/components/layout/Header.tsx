"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { openCart } from "@/store/slices/cartSlice";
import { Search, Menu as MenuIcon, X } from "lucide-react";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import Image from "next/image";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Calculate total cart items
  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Wait for hydration to avoid mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
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
      >
        {/* Mobile Layout */}
        <div className="md:hidden container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left: Menu Button */}
          <button
            onClick={handleMenuClick}
            className="flex items-center justify-center w-10 h-10 text-white hover:text-zinc-300 transition-colors"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          {/* Center: Logo */}
          <Link href="/" className="flex items-center gap-2">
            {isHydrated && (
              <div className="flex items-center gap-2">
                {/* Image với filter để đổi màu */}
                <div className="relative w-10 h-10">
                  <Image
                    src="/logo.png"
                    alt="Starbucks Logo"
                    fill
                    className="object-contain brightness-0 invert"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </Link>

          {/* Right: Search & Cart */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSearchClick}
              className="flex items-center justify-center w-10 h-10 text-white hover:text-zinc-300 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => dispatch(openCart())}
              className="flex items-center justify-center w-10 h-10 text-white hover:text-zinc-300 transition-colors relative"
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
          {/* Menu Button */}
          <button
            onClick={handleMenuClick}
            className="flex items-center gap-2 text-sm font-medium text-white hover:text-zinc-300 transition-colors"
          >
            <MenuIcon className="w-4 h-4" />
            Menu
          </button>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium hover:text-zinc-300 transition-colors ${
                pathname === "/" ? "text-white" : "text-zinc-400"
              }`}
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              className={`font-light tracking-wider transition-colors ${
                pathname === "/products"
                  ? "text-sm text-white"
                  : "text-sm text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Sản phẩm
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSearchClick}
              className="flex items-center gap-2 text-sm font-medium text-white hover:text-zinc-300 transition-colors"
            >
              <Search className="w-4 h-4" />
              Tìm kiếm
            </button>

            <button
              onClick={() => dispatch(openCart())}
              className="text-sm font-medium text-white hover:text-zinc-300 transition-colors"
            >
              Giỏ hàng{" "}
              {isHydrated && (
                <span className="text-zinc-500">{totalCartItems}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-zinc-900 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8">
            {/* Logo trong sidebar */}
            <div className="flex items-center gap-3">
              {isHydrated && (
                <Image
                  src="/logo.png"
                  alt="Starbucks Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                  onError={(e) => {
                    // Fallback to text if image fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              )}
              <div className="text-lg font-bold text-white tracking-wider">
                STARBUCKS
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
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
                Trang chủ
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
                Sản phẩm
              </div>
            </Link>
          </div>

          {/* Quick Actions trong sidebar */}
          <div className="mt-8 pt-8 border-t border-zinc-700">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  handleSearchClick();
                }}
                className="w-full text-left py-3 px-4 rounded-lg transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5" />
                  Tìm kiếm sản phẩm
                </div>
              </button>
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  dispatch(openCart());
                }}
                className="w-full text-left py-3 px-4 rounded-lg transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Giỏ hàng
                  </div>
                  {isHydrated && totalCartItems > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
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
      <SearchAutocomplete
        isOpen={isSearchModalOpen}
        onClose={handleSearchClose}
        onProductSelect={handleProductSelect}
      />
    </>
  );
}

export default Header;
