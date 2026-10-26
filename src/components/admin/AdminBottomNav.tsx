"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Menu,
} from "lucide-react";

interface AdminBottomNavProps {
  pathname: string;
  pendingCount: number;
  onOpenMenu: () => void;
}

const ITEMS = [
  { icon: LayoutDashboard, label: "Tổng quan", path: "/admin/dashboard" },
  { icon: Package, label: "Sản phẩm", path: "/admin/products" },
  { icon: ShoppingCart, label: "Đơn hàng", path: "/admin/orders" },
  { icon: MessageSquare, label: "Tư vấn", path: "/admin/consultations" },
] as const;

/**
 * Fixed bottom navigation for phones (hidden from `lg` up, where the sidebar is used).
 * The most-used sections stay under the thumb; everything else lives behind "Menu".
 */
export function AdminBottomNav({
  pathname,
  pendingCount,
  onOpenMenu,
}: AdminBottomNavProps) {
  const itemClass = (active: boolean) =>
    `relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
      active ? "text-white" : "text-gray-400 active:text-white"
    }`;

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-700 bg-gray-800 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="flex">
        {ITEMS.map(({ icon: Icon, label, path }) => {
          const active = pathname === path || pathname.startsWith(path + "/");
          const badge = path === "/admin/consultations" ? pendingCount : 0;
          return (
            <Link
              prefetch={false}
              key={path}
              href={path}
              aria-current={active ? "page" : undefined}
              className={itemClass(active)}
            >
              <span className="relative">
                <Icon className="size-6" />
                {badge > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
              {label}
              {active && (
                <span className="absolute inset-x-6 top-0 h-0.5 rounded-b bg-white" />
              )}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className={itemClass(false)}
        >
          <Menu className="size-6" />
          Menu
        </button>
      </div>
    </nav>
  );
}
