import { Search } from "lucide-react";
import type { Category, Color, Capacity } from "@/types";

interface ProductFilters {
  search: string;
  category: string;
  color: string;
  capacity: string;
  status: "all" | "active" | "inactive" | "low_stock";
}

interface ProductsFiltersProps {
  filters: ProductFilters;
  categories: Category[];
  colors: Color[];
  capacities: Capacity[];
  onFilterChange: (field: keyof ProductFilters, value: string) => void;
}

export function ProductsFilters({
  filters,
  categories,
  colors,
  capacities,
  onFilterChange,
}: ProductsFiltersProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white placeholder-gray-400"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => onFilterChange("category", e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white"
        >
          <option value="">Tất cả danh mục</option>
          {Array.isArray(categories) &&
            categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
        </select>

        {/* Color Filter */}
        <select
          value={filters.color}
          onChange={(e) => onFilterChange("color", e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white"
        >
          <option value="">Tất cả màu sắc</option>
          {Array.isArray(colors) &&
            colors.map((color) => (
              <option key={color.id} value={color.slug}>
                {color.name}
              </option>
            ))}
        </select>

        {/* Capacity Filter */}
        <select
          value={filters.capacity}
          onChange={(e) => onFilterChange("capacity", e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white"
        >
          <option value="">Tất cả dung tích</option>
          {Array.isArray(capacities) &&
            capacities.map((capacity) => (
              <option key={capacity.id} value={capacity.slug}>
                {capacity.name}
              </option>
            ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) =>
            onFilterChange("status", e.target.value as ProductFilters["status"])
          }
          className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Không hoạt động</option>
          <option value="low_stock">Sắp hết hàng</option>
        </select>
      </div>
    </div>
  );
}
