import { Search, Filter } from "lucide-react";

interface NotificationFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  loading?: boolean;
}

export function NotificationFilters({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  loading = false,
}: NotificationFiltersProps) {
  const filterOptions = [
    { value: "all", label: "Tất cả" },
    { value: "unread", label: "Chưa đọc" },
    { value: "read", label: "Đã đọc" },
    { value: "order", label: "Đơn hàng" },
    { value: "system", label: "Hệ thống" },
  ];

  if (loading) {
    return (
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 animate-pulse">
            <div className="h-12 bg-gray-700 rounded-lg"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-12 w-40 bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Thanh tìm kiếm */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Bộ lọc */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={selectedFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer min-w-[160px]"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
