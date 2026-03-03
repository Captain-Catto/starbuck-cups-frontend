"use client";

import { useProducts } from "@/hooks/useProducts";
import { ProductsFilters } from "@/components/products/ProductsFilters";
import { ProductsToolbar } from "@/components/products/ProductsToolbar";
import { ProductsContent } from "@/components/products/ProductsContent";
import { Cart } from "@/components/ui/Cart";
import type { CapacityRange } from "@/types";

export default function ProductsPage() {
  const {
    // Data
    categories,
    colors,
    capacities,

    // State
    searchQuery,
    debouncedSearchQuery,
    selectedCategory,
    selectedColor,
    capacityRange,
    showFilters,
    sortBy,
    currentPage,
    hasActiveFilters,

    // Actions
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
    // Use debounced update for search - wait 300ms after user stops typing
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
    // Use debounced update for capacity - wait 300ms after user stops typing
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
    // Immediate update when removing filter
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
    setSortBy("newest");
    setCurrentPage(1);
    updateURL({ sort: "newest", page: 1 });
  };

  const handleClearAllFilters = () => {
    clearFilters();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 lg:px-8 pt-20">
        {/* Mobile Filter Backdrop */}
        {showFilters && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowFilters(false)}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <ProductsFilters
            // Data
            categories={categories}
            colors={colors}
            capacities={capacities}
            // State
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedColor={selectedColor}
            capacityRange={capacityRange}
            sortBy={sortBy}
            showFilters={showFilters}
            hasActiveFilters={hasActiveFilters}
            // Actions
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onColorChange={handleColorChange}
            onCapacityRangeChange={handleCapacityRangeChange}
            onSortChange={handleSortChange}
            onToggleFilters={handleToggleFilters}
            onClearFilters={clearFilters}
          />

          {/* Main Content */}
          <div className="lg:w-full">
            {/* Toolbar - Only show on mobile/tablet */}
            <ProductsToolbar
              hasActiveFilters={hasActiveFilters}
              onToggleFilters={handleToggleFilters}
            />

            {/* Products Grid */}
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
            />
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <Cart />
    </div>
  );
}
