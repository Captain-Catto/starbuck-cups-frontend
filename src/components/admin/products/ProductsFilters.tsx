import { Search } from "lucide-react";
import type { Color, Capacity, Category } from "@/types";

interface ProductFilters {
  search: string;
  category: string;
  color: string;
  minCapacity: string;
  maxCapacity: string;
  status: "all" | "active" | "inactive" | "low_stock";
  sortBy: string;
  sortOrder: "asc" | "desc";
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
      <div className="space-y-4">
        {/* Row 1: Search */}
        <div className="grid grid-cols-1 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Row 2: Category, Color, Capacity Range */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => onFilterChange("category", e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white"
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
            className="w-full px-3 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white"
          >
            <option value="">Tất cả màu sắc</option>
            {Array.isArray(colors) &&
              colors.map((color) => (
                <option key={color.id} value={color.slug}>
                  {color.name}
                </option>
              ))}
          </select>

          {/* Min Capacity Input */}
          <div>
            <input
              type="number"
              placeholder="Min"
              value={filters.minCapacity}
              onChange={(e) => onFilterChange("minCapacity", e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white placeholder-gray-400"
              min="0"
            />
          </div>

          {/* Max Capacity Input */}
          <div>
            <input
              type="number"
              placeholder="9999"
              value={filters.maxCapacity}
              onChange={(e) => onFilterChange("maxCapacity", e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white placeholder-gray-400"
              min="0"
            />
          </div>

          {/* Capacity Keyword Selector */}
          <div>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  onFilterChange("minCapacity", e.target.value);
                  onFilterChange("maxCapacity", e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white"
            >
              <option value="">Chọn dung tích cụ thể</option>
              {Array.isArray(capacities) &&
                capacities.map((capacity) => (
                  <option key={capacity.id} value={capacity.volumeMl}>
                    {capacity.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Row 3: Status, Sort */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange(
                "status",
                e.target.value as ProductFilters["status"]
              )
            }
            className="w-full px-3 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="low_stock">Sắp hết hàng</option>
          </select>

          {/* Sort Filter */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("-");
              onFilterChange("sortBy", sortBy);
              onFilterChange("sortOrder", sortOrder as "asc" | "desc");
            }}
            className="w-full px-3 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white"
          >
            <option value="createdAt-desc">Mới nhất</option>
            <option value="createdAt-asc">Cũ nhất</option>
            <option value="name-asc">Tên A-Z</option>
            <option value="name-desc">Tên Z-A</option>
            <option value="unitPrice-desc">Giá cao → thấp</option>
            <option value="unitPrice-asc">Giá thấp → cao</option>
            <option value="stockQuantity-desc">Tồn kho nhiều → ít</option>
            <option value="stockQuantity-asc">Tồn kho ít → nhiều</option>
            <option value="updatedAt-desc">Cập nhật mới nhất</option>
            <option value="updatedAt-asc">Cập nhật cũ nhất</option>
          </select>
        </div>
      </div>
    </div>
  );
}
