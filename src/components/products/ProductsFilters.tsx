"use client";

import { Search } from "lucide-react";
import type { Category, Color, Capacity, CapacityRange } from "@/types";
import { useTranslations } from "next-intl";

interface ProductsFiltersProps {
  // Data
  categories: Category[];
  colors: Color[];
  capacities: Capacity[];

  // State
  searchQuery: string;
  selectedCategory: string;
  selectedColor: string;
  capacityRange: CapacityRange;
  sortBy: string;
  showFilters: boolean;
  hasActiveFilters: boolean;

  // Actions
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onCapacityRangeChange: (range: CapacityRange) => void;
  onSortChange: (value: string) => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
}

export function ProductsFilters({
  // Data
  categories,
  colors,
  capacities,

  // State
  searchQuery,
  selectedCategory,
  selectedColor,
  capacityRange,
  sortBy,
  showFilters,
  hasActiveFilters,

  // Actions
  onSearchChange,
  onCategoryChange,
  onColorChange,
  onCapacityRangeChange,
  onSortChange,
  onToggleFilters,
  onClearFilters,
}: ProductsFiltersProps) {
  const t = useTranslations("filters");
  const searchInputId = "products-filter-search";
  const categorySelectId = "products-filter-category";
  const colorSelectId = "products-filter-color";
  const capacityPresetSelectId = "products-filter-capacity-preset";
  const sortSelectId = "products-filter-sort";

  return (
    <div className="lg:w-1/5">
      <div
        className={`bg-zinc-900 rounded-lg border border-zinc-800 p-6 lg:sticky lg:top-24 ${
          showFilters
            ? "fixed inset-x-4 top-4 bottom-4 z-50 overflow-y-auto lg:relative lg:inset-auto lg:z-auto lg:overflow-visible"
            : "hidden lg:block"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-white">{t("title")}</h3>
            {/* Clear filters button for mobile */}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="lg:hidden text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded"
              >
                {t("clearAll")}
              </button>
            )}
            {/* Clear filters button for desktop */}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="hidden lg:inline text-sm text-red-600 hover:text-red-700 rounded"
              >
                {t("clearAll")}
              </button>
            )}
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onToggleFilters}
            className="lg:hidden text-zinc-400 hover:text-zinc-300"
          >
            ✕
          </button>
        </div>

        {/* Active Filters Display - Mobile Only */}
        {hasActiveFilters && (
          <div className="lg:hidden mb-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
            <h4 className="text-xs font-medium text-zinc-300 mb-3">
              {t("filtering")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white">
                  <span>{t("searchLabel")} &ldquo;{searchQuery}&rdquo;</span>
                  <button
                    onClick={() => onSearchChange("")}
                    className="text-zinc-400 hover:text-zinc-300"
                  >
                    ×
                  </button>
                </div>
              )}

              {selectedCategory && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white">
                  <span>
                    {t("categoryLabel")}{" "}
                    {categories.find((c) => c.slug === selectedCategory)
                      ?.name || selectedCategory}
                  </span>
                  <button
                    onClick={() => onCategoryChange("")}
                    className="text-zinc-400 hover:text-zinc-300"
                  >
                    ×
                  </button>
                </div>
              )}

              {selectedColor && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white">
                  <span>
                    {t("colorLabel")}{" "}
                    {colors.find((c) => c.slug === selectedColor)?.name ||
                      selectedColor}
                  </span>
                  <button
                    onClick={() => onColorChange("")}
                    className="text-zinc-400 hover:text-zinc-300"
                  >
                    ×
                  </button>
                </div>
              )}

              {(capacityRange.min > 0 || capacityRange.max < 9999) && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white">
                  <span>
                    {t("capacityLabel")} {capacityRange.min > 0 ? capacityRange.min : "0"}
                    -{capacityRange.max < 9999 ? capacityRange.max : "∞"}ml
                  </span>
                  <button
                    onClick={() => onCapacityRangeChange({ min: 0, max: 9999 })}
                    className="text-zinc-400 hover:text-zinc-300"
                  >
                    ×
                  </button>
                </div>
              )}

              {sortBy !== "featured" && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white">
                  <span>
                    {t("sortLabel")}{" "}
                    {sortBy === "newest"
                      ? t("sortNewest")
                      : sortBy === "oldest"
                      ? t("sortOldest")
                      : sortBy === "name_asc"
                      ? t("sortNameAsc")
                      : sortBy === "name_desc"
                      ? t("sortNameDesc")
                      : sortBy}
                  </span>
                  <button
                    onClick={() => onSortChange("featured")}
                    className="text-zinc-400 hover:text-zinc-300"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <label
            htmlFor={searchInputId}
            className="block text-xs font-medium text-zinc-300 mb-2"
          >
            {t("search")}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              id={searchInputId}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <label
            htmlFor={categorySelectId}
            className="block text-xs font-medium text-zinc-300 mb-2"
          >
            {t("category")}
          </label>
          <select
            id={categorySelectId}
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label={t("filterByCategory")}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
          >
            <option value="">{t("allCategories")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Color Filter */}
        <div className="mb-6">
          <label
            htmlFor={colorSelectId}
            className="block text-xs font-medium text-zinc-300 mb-2"
          >
            {t("color")}
          </label>
          <select
            id={colorSelectId}
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            aria-label={t("filterByColor")}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
          >
            <option value="">{t("allColors")}</option>
            {colors.map((color) => (
              <option key={color.id} value={color.slug}>
                {color.name}
              </option>
            ))}
          </select>
        </div>

        {/* Capacity Filter */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-zinc-300 mb-2">
            {t("capacityMl")}
          </label>

          {/* Range inputs */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">{t("from")}</label>
                <input
                  type="number"
                  placeholder={t("minPlaceholder")}
                  value={capacityRange.min > 0 ? capacityRange.min : ""}
                  onChange={(e) => {
                    const newRange = {
                      ...capacityRange,
                      min: e.target.value ? parseInt(e.target.value) : 0,
                    };
                    onCapacityRangeChange(newRange);
                  }}
                  className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">{t("to")}</label>
                <input
                  type="number"
                  placeholder={t("maxPlaceholder")}
                  value={capacityRange.max < 9999 ? capacityRange.max : ""}
                  onChange={(e) => {
                    const newRange = {
                      ...capacityRange,
                      max: e.target.value ? parseInt(e.target.value) : 9999,
                    };
                    onCapacityRangeChange(newRange);
                  }}
                  className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* Original dropdown as fallback */}
          <div className="mt-3">
            <label
              htmlFor={capacityPresetSelectId}
              className="block text-xs text-zinc-400 mb-1"
            >
              {t("orSelectFromList")}
            </label>
            <select
              id={capacityPresetSelectId}
              value=""
              onChange={(e) => {
                const capacityId = e.target.value;

                // Auto-update range inputs when selecting specific capacity
                if (capacityId) {
                  const selectedCap = capacities.find(
                    (cap) => cap.id === capacityId
                  );
                  if (selectedCap) {
                    const volume = selectedCap.volumeMl;
                    // Set exact range for the selected capacity
                    onCapacityRangeChange({
                      min: volume,
                      max: volume,
                    });
                  }
                } else {
                  // Reset range when no specific capacity is selected
                  onCapacityRangeChange({ min: 0, max: 9999 });
                }
              }}
              aria-label={t("selectCapacity")}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500"
            >
              <option value="">{t("selectSpecificCapacity")}</option>
              {capacities.map((capacity) => (
                <option key={capacity.id} value={capacity.id}>
                  {capacity.name} ({capacity.volumeMl}ml)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mb-6">
          <label
            htmlFor={sortSelectId}
            className="block text-xs font-medium text-zinc-300 mb-2"
          >
            {t("sort")}
          </label>
          <select
            id={sortSelectId}
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label={t("sortProducts")}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
          >
            <option value="featured">{t("sortFeatured")}</option>
            <option value="newest">{t("sortNewest")}</option>
            <option value="oldest">{t("sortOldest")}</option>
            <option value="name_asc">{t("sortNameAsc")}</option>
            <option value="name_desc">{t("sortNameDesc")}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
