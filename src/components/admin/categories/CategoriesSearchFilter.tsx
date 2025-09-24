import { Search } from "lucide-react";

interface CategoriesSearchFilterProps {
  searchQuery: string;
  statusFilter: "all" | "active" | "inactive";
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (filter: "all" | "active" | "inactive") => void;
}

export function CategoriesSearchFilter({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: CategoriesSearchFilterProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white placeholder-gray-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            onStatusFilterChange(
              e.target.value as "all" | "active" | "inactive"
            )
          }
          className="px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white min-w-48"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã ẩn</option>
        </select>
      </div>
    </div>
  );
}
