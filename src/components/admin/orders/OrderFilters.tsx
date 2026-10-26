import { useState } from "react";
import { Search, Filter } from "lucide-react";

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  onAdvancedFiltersChange?: (filters: AdvancedFilters) => void;
}

interface AdvancedFilters {
  dateFrom?: string;
  dateTo?: string;
  priceRange?: string;
  freeShipping?: string;
}

export function OrderFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  onAdvancedFiltersChange,
}: OrderFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});

  const handleAdvancedFilterChange = (
    key: keyof AdvancedFilters,
    value: string
  ) => {
    const newFilters = { ...advancedFilters, [key]: value };
    setAdvancedFilters(newFilters);
    onAdvancedFiltersChange?.(newFilters);
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 sm:p-4">
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4 lg:flex-nowrap">
        <div className="relative col-span-2 sm:min-w-64 sm:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
          <input aria-label="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full min-h-11 pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <select aria-label="Select option"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="min-h-11 w-full min-w-0 px-3 py-2 pr-8 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 bg-gray-700 text-white sm:w-auto"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="processing">Đang xử lý</option>
          <option value="shipped">Đang giao</option>
          <option value="delivered">Đã giao</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <select aria-label="Select option"
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          className="min-h-11 w-full min-w-0 px-3 py-2 pr-8 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 bg-gray-700 text-white sm:w-auto"
        >
          <option value="all">Tất cả loại</option>
          <option value="product">Đơn sản phẩm</option>
          <option value="custom">Đơn tùy chỉnh</option>
        </select>

        <button type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`col-span-2 flex min-h-11 items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors sm:col-span-1 ${
            isFilterOpen
              ? "bg-gray-600 text-white"
              : "text-gray-300 bg-gray-700 hover:bg-gray-600"
          }`}
        >
          <Filter className="size-4" />
          Bộ lọc
        </button>
      </div>

      {/* Advanced Filters */}
      {isFilterOpen && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="orderfilters-date">
                Từ ngày
              </label>
              <input aria-label="date"
                type="date"
                value={advancedFilters.dateFrom || ""}
                onChange={(e) =>
                  handleAdvancedFilterChange("dateFrom", e.target.value)
                }
                className="w-full min-h-11 px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 bg-gray-700 text-white" id="orderfilters-date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="orderfilters-date-2">
                Đến ngày
              </label>
              <input aria-label="date"
                type="date"
                value={advancedFilters.dateTo || ""}
                onChange={(e) =>
                  handleAdvancedFilterChange("dateTo", e.target.value)
                }
                className="w-full min-h-11 px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 bg-gray-700 text-white" id="orderfilters-date-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="orderfilters-select-option">
                Giá trị đơn hàng
              </label>
              <select aria-label="Select option"
                value={advancedFilters.priceRange || ""}
                onChange={(e) =>
                  handleAdvancedFilterChange("priceRange", e.target.value)
                }
                className="w-full px-3 py-2 pr-8 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 bg-gray-700 text-white" id="orderfilters-select-option"
              >
                <option value="">Tất cả</option>
                <option value="0-100">Dưới 100K</option>
                <option value="100-500">100K - 500K</option>
                <option value="500-1000">500K - 1M</option>
                <option value="1000+">Trên 1M</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="orderfilters-select-option-2">
                Miễn phí ship
              </label>
              <select aria-label="Select option"
                value={advancedFilters.freeShipping || ""}
                onChange={(e) =>
                  handleAdvancedFilterChange("freeShipping", e.target.value)
                }
                className="w-full px-3 py-2 pr-8 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 bg-gray-700 text-white" id="orderfilters-select-option-2"
              >
                <option value="">Tất cả</option>
                <option value="free">Miễn phí ship</option>
                <option value="paid">Có phí ship</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
