"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { useOrderStats } from "@/hooks/admin/useOrderStats";

const OrderList = dynamic(
  () =>
    import("@/components/admin/orders/OrderList").then((mod) => ({
      default: mod.OrderList,
    })),
  { loading: () => <div className="h-96 bg-gray-800 rounded-lg animate-pulse" /> }
);

const OrderStatsCards = dynamic(
  () =>
    import("@/components/admin/orders/OrderStatsCards").then((mod) => ({
      default: mod.OrderStatsCards,
    })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="h-28 bg-gray-800 rounded-lg border border-gray-700 animate-pulse"
          />
        ))}
      </div>
    ),
  }
);

const OrderFilters = dynamic(
  () =>
    import("@/components/admin/orders/OrderFilters").then((mod) => ({
      default: mod.OrderFilters,
    })),
  { loading: () => <div className="h-20 bg-gray-800 rounded-lg animate-pulse" /> }
);

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

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value }));
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, statusFilter: value }));
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, typeFilter: value }));
  }, []);

  const handleAdvancedFiltersChange = useCallback((advancedFilters: {
    dateFrom?: string;
    dateTo?: string;
    priceRange?: string;
    freeShipping?: string;
  }) => {
    setFilters((prev) => ({ ...prev, ...advancedFilters }));
  }, []);

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
