"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { toggleCart } from "@/store/slices/cartSlice";
import { ShoppingBag } from "lucide-react";

interface CartIconProps {
  className?: string;
}

export function CartIcon({ className = "" }: CartIconProps) {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <button
      onClick={() => dispatch(toggleCart())}
      className={`relative p-2 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
      aria-label="Open cart"
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
