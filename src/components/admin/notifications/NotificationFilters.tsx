import { Search, Filter } from "lucide-react";

interface NotificationFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  loading?: boolean;
}

const FILTER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "unread", label: "Chưa đọc" },
  { value: "read", label: "Đã đọc" },
  { value: "order", label: "Đơn hàng" },
  { value: "system", label: "Hệ thống" },
];

export function NotificationFilters({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  loading = false,
}: NotificationFiltersProps) {

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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
          <input aria-label="Tìm kiếm thông báo..."
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Bộ lọc */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
          <select aria-label="Select option"
            value={selectedFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer min-w-[160px]"
          >
            {FILTER_OPTIONS.map((option) => (
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
