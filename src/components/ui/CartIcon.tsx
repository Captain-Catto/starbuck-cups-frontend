"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { toggleCart } from "@/store/slices/cartSlice";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

interface CartIconProps {
  className?: string;
}

export function CartIcon({ className = "" }: CartIconProps) {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const tCommon = useTranslations("common");

  const totalItems = items.length;

  return (
    <button
      onClick={() => dispatch(toggleCart())}
      className={`relative p-2 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
      aria-label={tCommon("shoppingCartAria")}
    >
      <ShoppingBag className="w-6 h-6 text-gray-700" />

      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}

export default CartIcon;
