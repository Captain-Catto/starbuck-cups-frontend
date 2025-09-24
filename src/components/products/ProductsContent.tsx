import ProductsGrid from "@/components/ProductsGrid";
import type { CapacityRange } from "@/types";

interface ProductsContentProps {
  searchQuery: string;
  selectedCategory: string;
  selectedColor: string;
  capacityRange: CapacityRange;
  sortBy: string;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function ProductsContent({
  searchQuery,
  selectedCategory,
  selectedColor,
  capacityRange,
  sortBy,
  currentPage,
  onPageChange,
}: ProductsContentProps) {
  return (
    <div className="lg:w-full">
      {/* Products Grid */}
      <ProductsGrid
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedColor={selectedColor}
        capacityRange={capacityRange}
        sortBy={sortBy}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}