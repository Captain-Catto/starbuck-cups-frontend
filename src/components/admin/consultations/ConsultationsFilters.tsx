import { Search } from "lucide-react";

interface ConsultationFilters {
  status: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

interface ConsultationsFiltersProps {
  filters: ConsultationFilters;
  onFilterChange: (field: keyof ConsultationFilters, value: string) => void;
}

const statusConfig = {
  PENDING: {
    label: "Chờ xử lý",
  },
  IN_PROGRESS: {
    label: "Đang xử lý",
  },
  RESOLVED: {
    label: "Đã giải quyết",
  },
  CLOSED: {
    label: "Đã đóng",
  },
};

export function ConsultationsFilters({
  filters,
  onFilterChange,
}: ConsultationsFiltersProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(statusConfig).map(([status, config]) => (
            <option key={status} value={status}>
              {config.label}
            </option>
          ))}
        </select>

        {/* Date From */}
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onFilterChange("dateFrom", e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          placeholder="Từ ngày"
        />

        {/* Date To */}
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onFilterChange("dateTo", e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          placeholder="Đến ngày"
        />
      </div>
    </div>
  );
}