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

type FilterTranslations = ReturnType<typeof useTranslations>;

function FiltersHeader({
  hasActiveFilters,
  onClearFilters,
  onToggleFilters,
  t,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onToggleFilters: () => void;
  t: FilterTranslations;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-white">{t("title")}</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="lg:hidden text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded cursor-pointer"
          >
            {t("clearAll")}
          </button>
        )}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="hidden lg:inline text-sm text-red-600 hover:text-red-700 rounded cursor-pointer"
          >
            {t("clearAll")}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onToggleFilters}
        className="lg:hidden text-zinc-400 hover:text-zinc-300 cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}

function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-zinc-400 hover:text-zinc-300 cursor-pointer"
      >
        ×
      </button>
    </div>
  );
}

function ActiveFiltersPanel({
  searchQuery,
  selectedCategory,
  selectedColor,
  capacityRange,
  sortBy,
  categories,
  colors,
  onSearchChange,
  onCategoryChange,
  onColorChange,
  onCapacityRangeChange,
  onSortChange,
  t,
}: {
  searchQuery: string;
  selectedCategory: string;
  selectedColor: string;
  capacityRange: CapacityRange;
  sortBy: string;
  categories: Category[];
  colors: Color[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onCapacityRangeChange: (range: CapacityRange) => void;
  onSortChange: (value: string) => void;
  t: FilterTranslations;
}) {
  const hasCapacityFilter = capacityRange.min > 0 || capacityRange.max < 9999;

  return (
    <div className="lg:hidden mb-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
      <h4 className="text-xs font-medium text-zinc-300 mb-3">
        {t("filtering")}
      </h4>
      <div className="flex flex-wrap gap-2">
        {searchQuery && (
          <ActiveFilterChip
            label={`${t("searchLabel")} "${searchQuery}"`}
            onRemove={() => onSearchChange("")}
          />
        )}

        {selectedCategory && (
          <ActiveFilterChip
            label={`${t("categoryLabel")} ${
              categories.find((c) => c.slug === selectedCategory)?.name ||
              selectedCategory
            }`}
            onRemove={() => onCategoryChange("")}
          />
        )}

        {selectedColor && (
          <ActiveFilterChip
            label={`${t("colorLabel")} ${
              colors.find((c) => c.slug === selectedColor)?.name ||
              selectedColor
            }`}
            onRemove={() => onColorChange("")}
          />
        )}

        {hasCapacityFilter && (
          <ActiveFilterChip
            label={`${t("capacityLabel")} ${
              capacityRange.min > 0 ? capacityRange.min : "0"
            }-${capacityRange.max < 9999 ? capacityRange.max : "∞"}ml`}
            onRemove={() => onCapacityRangeChange({ min: 0, max: 9999 })}
          />
        )}

        {sortBy !== "featured" && (
          <ActiveFilterChip
            label={`${t("sortLabel")} ${
              sortBy === "newest"
                ? t("sortNewest")
                : sortBy === "oldest"
                ? t("sortOldest")
                : sortBy === "name_asc"
                ? t("sortNameAsc")
                : sortBy === "name_desc"
                ? t("sortNameDesc")
                : sortBy
            }`}
            onRemove={() => onSortChange("featured")}
          />
        )}
      </div>
    </div>
  );
}

function SearchFilter({
  searchQuery,
  onSearchChange,
  t,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  t: FilterTranslations;
}) {
  return (
    <div className="mb-6">
      <label
        htmlFor="products-filter-search"
        className="block text-xs font-medium text-zinc-300 mb-2"
      >
        {t("search")}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4" />
        <input
          aria-label="text"
          id="products-filter-search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
        />
      </div>
    </div>
  );
}

function SelectFilter({
  id,
  label,
  value,
  ariaLabel,
  options,
  allOption,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  ariaLabel: string;
  options: { id: string; slug: string; name: string }[];
  allOption: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-6">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-zinc-300 mb-2"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 cursor-pointer"
      >
        <option value="">{allOption}</option>
        {options.map((option) => (
          <option key={option.id} value={option.slug}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function CapacityFilter({
  capacities,
  capacityRange,
  onCapacityRangeChange,
  t,
}: {
  capacities: Capacity[];
  capacityRange: CapacityRange;
  onCapacityRangeChange: (range: CapacityRange) => void;
  t: FilterTranslations;
}) {
  return (
    <div className="mb-6">
      <label
        className="block text-xs font-medium text-zinc-300 mb-2"
        htmlFor="capacity-min"
      >
        {t("capacityMl")}
      </label>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="capacity-min" className="block text-xs text-zinc-400 mb-1">
              {t("from")}
            </label>
            <input
              aria-label="capacity min"
              id="capacity-min"
              name="capacity-min"
              type="number"
              placeholder={t("minPlaceholder")}
              value={capacityRange.min > 0 ? capacityRange.min : ""}
              onChange={(e) =>
                onCapacityRangeChange({
                  ...capacityRange,
                  min: e.target.value ? parseInt(e.target.value) : 0,
                })
              }
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500"
            />
          </div>
          <div>
            <label htmlFor="capacity-max" className="block text-xs text-zinc-400 mb-1">
              {t("to")}
            </label>
            <input
              aria-label="capacity max"
              id="capacity-max"
              name="capacity-max"
              type="number"
              placeholder={t("maxPlaceholder")}
              value={capacityRange.max < 9999 ? capacityRange.max : ""}
              onChange={(e) =>
                onCapacityRangeChange({
                  ...capacityRange,
                  max: e.target.value ? parseInt(e.target.value) : 9999,
                })
              }
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-xs text-zinc-400 mb-1">
          {t("orSelectFromList")}
        </label>
        <div className="overflow-y-auto max-h-48 bg-zinc-800 border border-zinc-700 rounded">
          {capacities.map((capacity) => {
            const isSelected =
              capacityRange.min === capacity.volumeMl &&
              capacityRange.max === capacity.volumeMl;
            return (
              <button
                type="button"
                key={capacity.id}
                onClick={() =>
                  onCapacityRangeChange(
                    isSelected
                      ? { min: 0, max: 9999 }
                      : { min: capacity.volumeMl, max: capacity.volumeMl }
                  )
                }
                className={`w-full text-left px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-zinc-500 text-white font-medium"
                    : "text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {capacity.name} ({capacity.volumeMl}ml)
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SortFilter({
  sortBy,
  onSortChange,
  t,
}: {
  sortBy: string;
  onSortChange: (value: string) => void;
  t: FilterTranslations;
}) {
  return (
    <div className="mb-6">
      <label
        htmlFor="products-filter-sort"
        className="block text-xs font-medium text-zinc-300 mb-2"
      >
        {t("sort")}
      </label>
      <select
        id="products-filter-sort"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label={t("sortProducts")}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 cursor-pointer"
      >
        <option value="featured">{t("sortFeatured")}</option>
        <option value="newest">{t("sortNewest")}</option>
        <option value="oldest">{t("sortOldest")}</option>
        <option value="name_asc">{t("sortNameAsc")}</option>
        <option value="name_desc">{t("sortNameDesc")}</option>
      </select>
    </div>
  );
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

  return (
    <div className="lg:w-1/5">
      <div
        className={`bg-zinc-900 rounded-lg border border-zinc-800 p-6 lg:sticky lg:top-24 ${
          showFilters
            ? "fixed inset-x-4 top-4 bottom-4 z-50 overflow-y-auto lg:relative lg:inset-auto lg:z-auto lg:overflow-visible"
            : "hidden lg:block"
        }`}
      >
        <FiltersHeader
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
          onToggleFilters={onToggleFilters}
          t={t}
        />

        {hasActiveFilters && (
          <ActiveFiltersPanel
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedColor={selectedColor}
            capacityRange={capacityRange}
            sortBy={sortBy}
            categories={categories}
            colors={colors}
            onSearchChange={onSearchChange}
            onCategoryChange={onCategoryChange}
            onColorChange={onColorChange}
            onCapacityRangeChange={onCapacityRangeChange}
            onSortChange={onSortChange}
            t={t}
          />
        )}

        <SearchFilter searchQuery={searchQuery} onSearchChange={onSearchChange} t={t} />
        <SelectFilter
          id="products-filter-category"
          label={t("category")}
          value={selectedCategory}
          ariaLabel={t("filterByCategory")}
          options={categories}
          allOption={t("allCategories")}
          onChange={onCategoryChange}
        />
        <SelectFilter
          id="products-filter-color"
          label={t("color")}
          value={selectedColor}
          ariaLabel={t("filterByColor")}
          options={colors}
          allOption={t("allColors")}
          onChange={onColorChange}
        />
        <CapacityFilter
          capacities={capacities}
          capacityRange={capacityRange}
          onCapacityRangeChange={onCapacityRangeChange}
          t={t}
        />
        <SortFilter sortBy={sortBy} onSortChange={onSortChange} t={t} />
      </div>
    </div>
  );
}
