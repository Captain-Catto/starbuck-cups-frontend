"use client";

import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import CartIcon from "@/components/ui/CartIcon";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  return (
    <header className={`bg-white shadow-sm sticky top-0 z-30 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo_small.webp"
              alt="Starbucks Cups"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-green-700">
              Starbucks Cups
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Sản phẩm
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search - Mobile */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-700" />
            </button>

            {/* Cart */}
            <CartIcon />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
