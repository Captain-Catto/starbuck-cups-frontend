"use client";

import { useReducer } from "react";
import { Plus, Search, Filter, Download } from "lucide-react";
import Link from "next/link";
import { CustomerList } from "@/components/admin/customers/CustomerList";
import { PageHeader } from "@/components/admin/PageHeader";

interface FilterState {
  searchTerm: string;
  vipStatus: string;
  dateFrom: string;
  dateTo: string;
  isFilterOpen: boolean;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

type FilterAction =
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_VIP_STATUS"; payload: string }
  | { type: "SET_DATE_FROM"; payload: string }
  | { type: "SET_DATE_TO"; payload: string }
  | { type: "TOGGLE_FILTER" }
  | { type: "SET_SORT"; payload: { sortBy: string; sortOrder: "asc" | "desc" } };

const initialFilterState: FilterState = {
  searchTerm: "",
  vipStatus: "all",
  dateFrom: "",
  dateTo: "",
  isFilterOpen: false,
  sortBy: "createdAt",
  sortOrder: "desc",
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };
    case "SET_VIP_STATUS":
      return { ...state, vipStatus: action.payload };
    case "SET_DATE_FROM":
      return { ...state, dateFrom: action.payload };
    case "SET_DATE_TO":
      return { ...state, dateTo: action.payload };
    case "TOGGLE_FILTER":
      return { ...state, isFilterOpen: !state.isFilterOpen };
    case "SET_SORT":
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
      };
    default:
      return state;
  }
}

export default function CustomersPage() {
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);
  const {
    searchTerm,
    vipStatus,
    dateFrom,
    dateTo,
    isFilterOpen,
    sortBy,
    sortOrder,
  } = state;

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      <PageHeader
        title="Quản lý khách hàng"
        description="Quản lý thông tin khách hàng và địa chỉ giao hàng"
        action={
          <div className="flex gap-3">
            <button type="button" className="inline-flex items-center gap-2 px-4 py-2 text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
              <Download className="size-4" />
              Xuất Excel
            </button>
            <Link
              href="/admin/customers/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Plus className="size-4" />
              Thêm khách hàng
            </Link>
          </div>
        }
      />

      {/* Filters & Search */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
            <input aria-label="Tìm kiếm theo tên, SĐT, địa chỉ..."
              type="text"
              placeholder="Tìm kiếm theo tên, SĐT, địa chỉ..."
              value={searchTerm}
              onChange={(e) => dispatch({ type: "SET_SEARCH_TERM", payload: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <button type="button"
            onClick={() => dispatch({ type: "TOGGLE_FILTER" })}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer"
          >
            <Filter className="size-4" />
            Bộ lọc
          </button>
        </div>

        {/* Advanced Filters */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="page-date">
                  Từ ngày
                </label>
                <input aria-label="date"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => dispatch({ type: "SET_DATE_FROM", payload: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 bg-gray-700 text-white" id="page-date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="page-date-2">
                  Đến ngày
                </label>
                <input aria-label="date"
                  type="date"
                  value={dateTo}
                  onChange={(e) => dispatch({ type: "SET_DATE_TO", payload: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 bg-gray-700 text-white" id="page-date-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="page-select-option">
                  Loại khách hàng
                </label>
                <select aria-label="Select option"
                  value={vipStatus}
                  onChange={(e) => dispatch({ type: "SET_VIP_STATUS", payload: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 bg-gray-700 text-white" id="page-select-option"
                >
                  <option value="all">Tất cả</option>
                  <option value="vip">Khách VIP</option>
                  <option value="regular">Khách thường</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="page-select-option-2">
                  Sắp xếp theo
                </label>
                <select aria-label="Select option"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    dispatch({
                      type: "SET_SORT",
                      payload: { sortBy: field, sortOrder: order as "asc" | "desc" },
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 bg-gray-700 text-white" id="page-select-option-2"
                >
                  <option value="createdAt-desc">Ngày tạo (Mới nhất)</option>
                  <option value="createdAt-asc">Ngày tạo (Cũ nhất)</option>
                  <option value="fullName-asc">Tên khách hàng (A-Z)</option>
                  <option value="fullName-desc">Tên khách hàng (Z-A)</option>
                  <option value="totalSpent-desc">
                    Tổng tiền chi tiêu (Nhiều nhất)
                  </option>
                  <option value="totalSpent-asc">
                    Tổng tiền chi tiêu (Ít nhất)
                  </option>
                  <option value="orderCount-desc">
                    Số đơn hàng (Nhiều nhất)
                  </option>
                  <option value="orderCount-asc">Số đơn hàng (Ít nhất)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer List */}
      <CustomerList
        searchTerm={searchTerm}
        vipStatus={vipStatus}
        dateFrom={dateFrom}
        dateTo={dateTo}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    </div>
  );
}
