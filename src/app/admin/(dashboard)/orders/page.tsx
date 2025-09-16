"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, TrendingUp } from "lucide-react";
import Link from "next/link";
import { OrderList } from "@/components/admin/orders/OrderList";

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Get auth headers
  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch order statistics
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch("/api/admin/orders/stats", {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      console.log("Order stats response:", data);

      if (data.success) {
        setStats(data.data);
      } else {
        console.error("Failed to fetch order stats:", data.message);
      }
    } catch (error) {
      console.error("Error fetching order stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Prepare stats for display
  const displayStats = stats
    ? [
        {
          label: "Tổng đơn hàng",
          value: (stats.total || 0).toString(),
          change: "+0%",
          trend: "up" as const,
        },
        {
          label: "Chờ xử lý",
          value: (stats.pending || 0).toString(),
          change: "+0%",
          trend: "up" as const,
        },
        {
          label: "Đang giao",
          value: ((stats.shipped || 0) + (stats.processing || 0)).toString(),
          change: "+0%",
          trend: "down" as const,
        },
        {
          label: "Hoàn thành",
          value: (stats.delivered || 0).toString(),
          change: "+0%",
          trend: "up" as const,
        },
      ]
    : [
        {
          label: "Tổng đơn hàng",
          value: "0",
          change: "+0%",
          trend: "up" as const,
        },
        {
          label: "Chờ xử lý",
          value: "0",
          change: "+0%",
          trend: "up" as const,
        },
        {
          label: "Đang giao",
          value: "0",
          change: "+0%",
          trend: "down" as const,
        },
        {
          label: "Hoàn thành",
          value: "0",
          change: "+0%",
          trend: "up" as const,
        },
      ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và xử lý đơn hàng từ khách hàng
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
          <Link
            href="/admin/orders/new"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Tạo đơn hàng
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp
                  className={`w-4 h-4 ${
                    stat.trend === "down" ? "rotate-180" : ""
                  }`}
                />
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đang giao</option>
            <option value="delivered">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tất cả loại</option>
            <option value="product">Đơn sản phẩm</option>
            <option value="custom">Đơn tùy chỉnh</option>
          </select>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
          </button>
        </div>

        {/* Advanced Filters */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ ngày
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đến ngày
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá trị đơn hàng
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option value="">Tất cả</option>
                  <option value="0-500000">Dưới 500K</option>
                  <option value="500000-1000000">500K - 1M</option>
                  <option value="1000000+">Trên 1M</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miễn phí ship
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option value="">Tất cả</option>
                  <option value="true">Có</option>
                  <option value="false">Không</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order List */}
      <OrderList
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
      />
    </div>
  );
}
