"use client";

import { useState } from "react";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { OrderList } from "@/components/admin/orders/OrderList";
import { OrderStatsCards } from "@/components/admin/orders/OrderStatsCards";
import { OrderFilters } from "@/components/admin/orders/OrderFilters";
import { useOrderStats } from "@/hooks/admin/useOrderStats";

export default function OrdersPage() {
  const [filters, setFilters] = useState({
    searchTerm: "",
    statusFilter: "all",
    typeFilter: "all",
    dateFrom: "",
    dateTo: "",
    priceRange: "",
    freeShipping: "",
  });

  const {
    displayStats,
    loading: statsLoading,
    error: statsError,
    fetchStats,
  } = useOrderStats();

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, statusFilter: value }));
  };

  const handleTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, typeFilter: value }));
  };

  const handleAdvancedFiltersChange = (advancedFilters: {
    dateFrom?: string;
    dateTo?: string;
    priceRange?: string;
    freeShipping?: string;
  }) => {
    setFilters((prev) => ({ ...prev, ...advancedFilters }));
  };

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý đơn hàng</h1>
          <p className="text-gray-300 mt-1">
            Theo dõi và xử lý đơn hàng từ khách hàng
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <Link
            href="/admin/orders/new"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo đơn hàng
          </Link>
        </div>
      </div>

      {/* Order Statistics */}
      <OrderStatsCards
        displayStats={displayStats}
        loading={statsLoading}
        error={statsError}
        onRetry={fetchStats}
      />

      {/* Filters */}
      <OrderFilters
        searchTerm={filters.searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={filters.statusFilter}
        onStatusChange={handleStatusChange}
        typeFilter={filters.typeFilter}
        onTypeChange={handleTypeChange}
        onAdvancedFiltersChange={handleAdvancedFiltersChange}
      />

      {/* Orders List */}
      <OrderList
        searchTerm={filters.searchTerm}
        statusFilter={filters.statusFilter}
        typeFilter={filters.typeFilter}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        priceRange={filters.priceRange}
        freeShipping={filters.freeShipping}
      />
    </div>
  );
}
