import {
  ShoppingCart,
  Users,
  Package,
  MessageSquare,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { DashboardStats, RevenueData } from "@/lib/api/dashboard";

interface StatsGridProps {
  dashboardStats: DashboardStats | null;
  revenueData: RevenueData | null;
  pendingConsultations: number;
  loading: boolean;
}

export function StatsGrid({
  dashboardStats,
  revenueData,
  pendingConsultations,
  loading,
}: StatsGridProps) {
  // Format number with Vietnamese locale
  const formatNumber = (num: number | undefined | null) => {
    return new Intl.NumberFormat("vi-VN").format(num || 0);
  };

  // Generate stats array from real data
  const stats = [
    {
      title: "Tổng đơn hàng",
      value: dashboardStats ? formatNumber(dashboardStats.totalOrders) : "...",
      change:
        revenueData && typeof revenueData.growth === "number"
          ? `${revenueData.growth > 0 ? "+" : ""}${revenueData.growth.toFixed(
              1
            )}%`
          : "...",
      trend:
        revenueData && typeof revenueData.growth === "number"
          ? revenueData.growth >= 0
            ? "up"
            : "down"
          : "up",
      icon: ShoppingCart,
      color: "bg-gray-700",
    },
    {
      title: "Khách hàng",
      value: dashboardStats
        ? formatNumber(dashboardStats.totalCustomers)
        : "...",
      change: "+8%",
      trend: "up",
      icon: Users,
      color: "bg-gray-700",
    },
    {
      title: "Sản phẩm",
      value: dashboardStats
        ? formatNumber(dashboardStats.totalProducts)
        : "...",
      change: "+3%",
      trend: "up",
      icon: Package,
      color: "bg-gray-700",
    },
    {
      title: "Tư vấn chờ",
      value: formatNumber(pendingConsultations),
      change: "-5%",
      trend: "down",
      icon: MessageSquare,
      color: "bg-gray-700",
    },
  ] as const;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-700 rounded"></div>
                <div className="w-8 h-4 bg-gray-700 rounded"></div>
              </div>
            </div>
            <div>
              <div className="h-8 bg-gray-700 rounded w-16 mb-1"></div>
              <div className="h-4 bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-gray-600 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-gray-300" : "text-gray-400"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
