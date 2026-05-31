"use client";

import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProductsToolbarProps {
  hasActiveFilters: boolean;
  onToggleFilters: () => void;
}

export function ProductsToolbar({
  hasActiveFilters,
  onToggleFilters,
}: ProductsToolbarProps) {
  const t = useTranslations("filters");

  return (
    <div className="lg:hidden bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Mobile Filter Toggle */}
          <button type="button"
            onClick={onToggleFilters}
            className="flex items-center gap-2 px-3 py-2 border border-zinc-700 rounded-lg hover:bg-zinc-800 relative text-white"
          >
            <Filter className="size-4" />
            {t("title")}
            {hasActiveFilters && (
              <span className="absolute -top-1.5 -right-1.5 size-4 bg-white text-black text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                ✓
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
