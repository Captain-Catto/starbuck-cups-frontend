"use client";

import { useProducts } from "@/hooks/useProducts";
import { ProductsFilters } from "@/components/products/ProductsFilters";
import { ProductsToolbar } from "@/components/products/ProductsToolbar";
import { ProductsContent } from "@/components/products/ProductsContent";
import { Cart } from "@/components/ui/Cart";
import type { CapacityRange, Product } from "@/types";

interface InitialPaginationData {
  totalPages: number;
  limit: number;
  totalItems: number;
}

interface ProductsPageClientProps {
  initialProducts?: Product[];
  initialPaginationData?: InitialPaginationData | null;
  initialQueryKey?: string;
}

export default function ProductsPageClient({
  initialProducts = [],
  initialPaginationData = null,
  initialQueryKey,
}: ProductsPageClientProps) {
  const {
    categories,
    colors,
    capacities,
    searchQuery,
    debouncedSearchQuery,
    selectedCategory,
    selectedColor,
    capacityRange,
    showFilters,
    sortBy,
    currentPage,
    hasActiveFilters,
    setSearchQuery,
    setSelectedCategory,
    setSelectedColor,
    setCapacityRange,
    setShowFilters,
    setSortBy,
    setCurrentPage,
    updateURL,
    debouncedUpdateURL,
    clearFilters,
  } = useProducts();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    debouncedUpdateURL({ search: value, page: 1 });
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
    updateURL({ category: value, page: 1 });
  };

  const handleColorChange = (value: string) => {
    setSelectedColor(value);
    setCurrentPage(1);
    updateURL({ color: value, page: 1 });
  };

  const handleCapacityRangeChange = (range: CapacityRange) => {
    setCapacityRange(range);
    setCurrentPage(1);
    debouncedUpdateURL({
      minCapacity: range.min > 0 ? range.min : undefined,
      maxCapacity: range.max < 9999 ? range.max : undefined,
      page: 1,
    });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
    updateURL({ sort: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page });
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleRemoveSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    updateURL({ search: "", page: 1 });
  };

  const handleRemoveCategory = () => {
    setSelectedCategory("");
    setCurrentPage(1);
    updateURL({ category: "", page: 1 });
  };

  const handleRemoveColor = () => {
    setSelectedColor("");
    setCurrentPage(1);
    updateURL({ color: "", page: 1 });
  };

  const handleRemoveCapacity = () => {
    setCapacityRange({ min: 0, max: 9999 });
    setCurrentPage(1);
    updateURL({ minCapacity: undefined, maxCapacity: undefined, page: 1 });
  };

  const handleRemoveSort = () => {
    setSortBy("featured");
    setCurrentPage(1);
    updateURL({ sort: "featured", page: 1 });
  };

  const handleClearAllFilters = () => {
    clearFilters();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 lg:px-8 pt-20">
        {showFilters && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowFilters(false)}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <ProductsFilters
            categories={categories}
            colors={colors}
            capacities={capacities}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedColor={selectedColor}
            capacityRange={capacityRange}
            sortBy={sortBy}
            showFilters={showFilters}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onColorChange={handleColorChange}
            onCapacityRangeChange={handleCapacityRangeChange}
            onSortChange={handleSortChange}
            onToggleFilters={handleToggleFilters}
            onClearFilters={clearFilters}
          />

          <div className="lg:w-full">
            <ProductsToolbar
              hasActiveFilters={hasActiveFilters}
              onToggleFilters={handleToggleFilters}
            />

            <ProductsContent
              searchQuery={searchQuery}
              debouncedSearchQuery={debouncedSearchQuery}
              selectedCategory={selectedCategory}
              selectedColor={selectedColor}
              capacityRange={capacityRange}
              sortBy={sortBy}
              currentPage={currentPage}
              categories={categories}
              colors={colors}
              onPageChange={handlePageChange}
              onRemoveSearch={handleRemoveSearch}
              onRemoveCategory={handleRemoveCategory}
              onRemoveColor={handleRemoveColor}
              onRemoveCapacity={handleRemoveCapacity}
              onRemoveSort={handleRemoveSort}
              onClearAll={handleClearAllFilters}
              initialProducts={initialProducts}
              initialPaginationData={initialPaginationData}
              initialQueryKey={initialQueryKey}
            />
          </div>
        </div>
      </div>

      <Cart />
    </div>
  );
}
