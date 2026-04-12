"use client";

import { useProducts } from "@/hooks/useProducts";
import { useRouter, usePathname } from "@/i18n/routing";
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

interface CategoryPageClientProps {
  categorySlug: string;
  categoryName?: string;
  initialProducts?: Product[];
  initialPaginationData?: InitialPaginationData | null;
  initialQueryKey?: string;
}

export default function CategoryPageClient({
  categorySlug,
  categoryName,
  initialProducts = [],
  initialPaginationData = null,
  initialQueryKey,
}: CategoryPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    categories,
    colors,
    capacities,
    searchQuery,
    debouncedSearchQuery,
    selectedColor,
    capacityRange,
    showFilters,
    sortBy,
    currentPage,
    setSearchQuery,
    setSelectedColor,
    setCapacityRange,
    setShowFilters,
    setSortBy,
    setCurrentPage,
    updateURL,
    debouncedUpdateURL,
    clearFilters,
  } = useProducts();

  // hasActiveFilters: không tính category vì nó luôn được set trên trang này
  const hasOtherActiveFilters =
    searchQuery.trim() !== "" ||
    selectedColor !== "" ||
    capacityRange.min > 0 ||
    capacityRange.max < 9999 ||
    sortBy !== "featured";

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    debouncedUpdateURL({ search: value, page: 1 });
  };

  // Khi đổi danh mục → chuyển sang trang /category/[newSlug]
  const handleCategoryChange = (value: string) => {
    if (!value) {
      router.push("/products");
    } else {
      router.push(`/category/${value}`);
    }
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

  // Bỏ filter category → về trang /products
  const handleRemoveCategory = () => {
    router.push("/products");
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
    // Xóa filters phụ nhưng giữ nguyên trên trang category
    setSearchQuery("");
    setSelectedColor("");
    setCapacityRange({ min: 0, max: 9999 });
    setSortBy("featured");
    setCurrentPage(1);
    router.replace(pathname, { scroll: false });
  };

  const useInitialServerData = !hasOtherActiveFilters && currentPage === 1;

  return (
    <div className="container mx-auto px-4 pt-4 pb-4 md:px-6 lg:px-8 md:pt-6 md:pb-8">
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
          selectedCategory={categorySlug}
          selectedColor={selectedColor}
          capacityRange={capacityRange}
          sortBy={sortBy}
          showFilters={showFilters}
          hasActiveFilters={hasOtherActiveFilters}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onColorChange={handleColorChange}
          onCapacityRangeChange={handleCapacityRangeChange}
          onSortChange={handleSortChange}
          onToggleFilters={handleToggleFilters}
          onClearFilters={handleClearAllFilters}
        />

        <div className="lg:w-full">
          <ProductsToolbar
            hasActiveFilters={hasOtherActiveFilters}
            onToggleFilters={handleToggleFilters}
          />

          <ProductsContent
            searchQuery={searchQuery}
            debouncedSearchQuery={debouncedSearchQuery}
            selectedCategory={categorySlug}
            categoryName={categoryName}
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
            initialProducts={useInitialServerData ? initialProducts : undefined}
            initialPaginationData={
              useInitialServerData ? initialPaginationData : undefined
            }
            initialQueryKey={useInitialServerData ? initialQueryKey : undefined}
          />
        </div>
      </div>

      <Cart />
    </div>
  );
}
