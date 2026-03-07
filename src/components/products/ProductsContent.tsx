"use client";

import ProductsGrid from "@/components/ProductsGrid";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FilterBadges } from "@/components/products/FilterBadges";
import type { CapacityRange, Category, Color, Product } from "@/types";
import { useTranslations } from "next-intl";

interface InitialPaginationData {
  totalPages: number;
  limit: number;
  totalItems: number;
}

interface ProductsContentProps {
  searchQuery: string;
  debouncedSearchQuery: string;
  selectedCategory: string;
  selectedColor: string;
  capacityRange: CapacityRange;
  sortBy: string;
  currentPage: number;
  categories: Category[];
  colors: Color[];
  onPageChange: (page: number) => void;
  onRemoveSearch: () => void;
  onRemoveCategory: () => void;
  onRemoveColor: () => void;
  onRemoveCapacity: () => void;
  onRemoveSort: () => void;
  onClearAll: () => void;
  initialProducts?: Product[];
  initialPaginationData?: InitialPaginationData | null;
  initialQueryKey?: string;
}

export function ProductsContent({
  searchQuery,
  debouncedSearchQuery,
  selectedCategory,
  selectedColor,
  capacityRange,
  sortBy,
  currentPage,
  categories,
  colors,
  onPageChange,
  onRemoveSearch,
  onRemoveCategory,
  onRemoveColor,
  onRemoveCapacity,
  onRemoveSort,
  onClearAll,
  initialProducts,
  initialPaginationData,
  initialQueryKey,
}: ProductsContentProps) {
  const tCommon = useTranslations("common");

  return (
    <div className="lg:w-full space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: tCommon("home"), href: "/" },
          { label: tCommon("products") },
        ]}
      />

      {/* Filter Badges */}
      <FilterBadges
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedColor={selectedColor}
        capacityRange={capacityRange}
        sortBy={sortBy}
        categories={categories}
        colors={colors}
        onRemoveSearch={onRemoveSearch}
        onRemoveCategory={onRemoveCategory}
        onRemoveColor={onRemoveColor}
        onRemoveCapacity={onRemoveCapacity}
        onRemoveSort={onRemoveSort}
        onClearAll={onClearAll}
      />

      {/* Products Grid */}
      <ProductsGrid
        searchQuery={debouncedSearchQuery}
        selectedCategory={selectedCategory}
        selectedColor={selectedColor}
        capacityRange={capacityRange}
        sortBy={sortBy}
        currentPage={currentPage}
        onPageChange={onPageChange}
        initialProducts={initialProducts}
        initialPaginationData={initialPaginationData}
        initialQueryKey={initialQueryKey}
      />
    </div>
  );
}
