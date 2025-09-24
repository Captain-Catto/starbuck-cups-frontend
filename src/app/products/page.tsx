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
    clearFilters,
  } = useProducts();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    updateURL({ search: value, page: 1 });
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
    updateURL({
      capacityMin: range.min > 0 ? range.min : undefined,
      capacityMax: range.max < 9999 ? range.max : undefined,
      page: 1
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 lg:px-8 pt-24">
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
              selectedCategory={selectedCategory}
              selectedColor={selectedColor}
              capacityRange={capacityRange}
              sortBy={sortBy}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <Cart />
    </div>
  );
}
