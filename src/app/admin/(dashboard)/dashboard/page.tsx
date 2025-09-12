"use client";

import { useAppSelector } from "@/store";
import {
  ShoppingCart,
  Users,
  Package,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  LayoutDashboard,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  const stats = [
    {
      title: "Tổng đơn hàng",
      value: "1,234",
      change: "+12%",
      trend: "up",
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      title: "Khách hàng",
      value: "567",
      change: "+8%",
      trend: "up",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Sản phẩm",
      value: "89",
      change: "+3%",
      trend: "up",
      icon: Package,
      color: "bg-purple-500",
    },
    {
      title: "Tư vấn chờ",
      value: "23",
      change: "-5%",
      trend: "down",
      icon: MessageSquare,
      color: "bg-orange-500",
    },
  ];

  const recentOrders = [
    {
      id: "#ORD-001",
      customer: "Nguyễn Văn A",
      product: "Starbucks Classic Tumbler",
      status: "pending",
      amount: "599,000đ",
      time: "10 phút trước",
    },
    {
      id: "#ORD-002",
      customer: "Trần Thị B",
      product: "Holiday Collection Cup",
      status: "confirmed",
      amount: "750,000đ",
      time: "25 phút trước",
    },
    {
      id: "#ORD-003",
      customer: "Lê Văn C",
      product: "Summer Limited Edition",
      status: "shipping",
      amount: "680,000đ",
      time: "1 giờ trước",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipping":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "shipping":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Chào mừng trở lại, {user?.name || "Admin"}! 👋
            </h1>
            <p className="text-green-100">
              Đây là tổng quan về hoạt động hôm nay của hệ thống
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <LayoutDashboard className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
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
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Đơn hàng gần đây
              </h3>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                Xem tất cả
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {order.id}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {order.customer}
                    </p>
                    <p className="text-xs text-gray-500">{order.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {order.amount}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {order.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Thao tác nhanh
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <Package className="w-8 h-8 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Thêm sản phẩm
                </span>
              </button>
              <button className="flex flex-col items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Quản lý khách hàng
                </span>
              </button>
              <button className="flex flex-col items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <ShoppingCart className="w-8 h-8 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Xem đơn hàng
                </span>
              </button>
              <button className="flex flex-col items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <MessageSquare className="w-8 h-8 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">
                  Tư vấn khách
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Biểu đồ doanh thu 7 ngày qua
          </h3>
        </div>
        <div className="p-6">
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Biểu đồ sẽ được hiển thị tại đây</p>
              <p className="text-xs">Cần tích hợp thư viện charting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
