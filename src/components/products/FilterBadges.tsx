"use client";

import { X } from "lucide-react";
import type { Category, Color, CapacityRange } from "@/types";
import { useTranslations } from "next-intl";

interface FilterBadgesProps {
  searchQuery: string;
  selectedCategory: string;
  selectedColor: string;
  capacityRange: CapacityRange;
  sortBy: string;
  categories: Category[];
  colors: Color[];
  onRemoveSearch: () => void;
  onRemoveCategory: () => void;
  onRemoveColor: () => void;
  onRemoveCapacity: () => void;
  onRemoveSort: () => void;
  onClearAll: () => void;
}

export function FilterBadges({
  searchQuery,
  selectedCategory,
  selectedColor,
  capacityRange,
  sortBy,
  categories,
  colors,
  onRemoveSearch,
  onRemoveCategory,
  onRemoveColor,
  onRemoveCapacity,
  onRemoveSort,
  onClearAll,
}: FilterBadgesProps) {
  const t = useTranslations("filters");

  // Helper functions
  const getCategoryName = (id: string): string => {
    const category = categories.find((c) => c.id === id || c.slug === id);
    return category?.name || id;
  };

  const getColorName = (id: string): string => {
    const color = colors.find((c) => c.id === id || c.slug === id);
    return color?.name || id;
  };

  const getSortLabel = (value: string): string => {
    const sortLabels: Record<string, string> = {
      featured: t("sortFeatured"),
      newest: t("sortNewest"),
      oldest: t("sortOldest"),
      name_asc: t("sortNameAsc"),
      name_desc: t("sortNameDesc"),
    };
    return sortLabels[value] || value;
  };

  // Check active filters
  const hasSearch = searchQuery.trim().length > 0;
  const hasCategory = selectedCategory.trim().length > 0;
  const hasColor = selectedColor.trim().length > 0;
  const hasCapacity = capacityRange.min > 0 || capacityRange.max < 9999;
  const hasSort = sortBy && sortBy !== "featured";

  const activeFiltersCount = [
    hasSearch,
    hasCategory,
    hasColor,
    hasCapacity,
    hasSort,
  ].filter(Boolean).length;

  // Don't render if no active filters
  if (activeFiltersCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Search Badge */}
      {hasSearch && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white">
          <span>
            {t("searchLabel")} <span className="font-medium">{searchQuery}</span>
          </span>
          <button
            onClick={onRemoveSearch}
            className="hover:bg-zinc-700 rounded p-0.5 transition-colors"
            aria-label={t("removeSearch")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Badge */}
      {hasCategory && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white">
          <span>
            {t("categoryLabel")}{" "}
            <span className="font-medium">
              {getCategoryName(selectedCategory)}
            </span>
          </span>
          <button
            onClick={onRemoveCategory}
            className="hover:bg-zinc-700 rounded p-0.5 transition-colors"
            aria-label={t("removeCategory")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Color Badge */}
      {hasColor && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white">
          <span>
            {t("colorLabel")}{" "}
            <span className="font-medium">{getColorName(selectedColor)}</span>
          </span>
          <button
            onClick={onRemoveColor}
            className="hover:bg-zinc-700 rounded p-0.5 transition-colors"
            aria-label={t("removeColor")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Capacity Badge */}
      {hasCapacity && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white">
          <span>
            {t("capacityLabel")}{" "}
            <span className="font-medium">
              {capacityRange.min > 0 ? `${capacityRange.min}ml` : "0ml"} -{" "}
              {capacityRange.max < 9999 ? `${capacityRange.max}ml` : "∞"}
            </span>
          </span>
          <button
            onClick={onRemoveCapacity}
            className="hover:bg-zinc-700 rounded p-0.5 transition-colors"
            aria-label={t("removeCapacity")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sort Badge */}
      {hasSort && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white">
          <span>
            {t("sortLabel")} <span className="font-medium">{getSortLabel(sortBy)}</span>
          </span>
          <button
            onClick={onRemoveSort}
            className="hover:bg-zinc-700 rounded p-0.5 transition-colors"
            aria-label={t("removeSort")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Clear All Button */}
      {activeFiltersCount >= 2 && (
        <button
          onClick={onClearAll}
          className="text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium cursor-pointer transition-colors"
        >
          {t("clearAll")}
        </button>
      )}
    </div>
  );
}
