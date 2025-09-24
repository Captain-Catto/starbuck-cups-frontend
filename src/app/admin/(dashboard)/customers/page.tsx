"use client";

import { useState } from "react";
import { Plus, Search, Filter, Download } from "lucide-react";
import Link from "next/link";
import { CustomerList } from "@/components/admin/customers/CustomerList";

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [vipStatus, setVipStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý khách hàng</h1>
          <p className="text-gray-300 mt-1">
            Quản lý thông tin khách hàng và địa chỉ giao hàng
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <Link
            href="/admin/customers/new"
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            <Plus className="w-4 h-4" />
            Thêm khách hàng
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, SĐT, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
          </button>
        </div>

        {/* Advanced Filters */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Loại khách hàng
                </label>
                <select
                  value={vipStatus}
                  onChange={(e) => setVipStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 bg-gray-700 text-white"
                >
                  <option value="all">Tất cả</option>
                  <option value="vip">Khách VIP</option>
                  <option value="regular">Khách thường</option>
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
      />
    </div>
  );
}
