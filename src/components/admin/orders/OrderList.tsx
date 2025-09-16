"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  Edit,
  Package,
  User,
  Calendar,
  MapPin,
  Currency,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    fullName?: string;
    phone?: string;
  };
  orderType: "PRODUCT" | "CUSTOM";
  status: string;
  totalAmount: string; // API trả về string, không phải number
  shippingCost: string; // API trả về string, không phải number
  isFreeShipping: boolean;
  customDescription?: string;
  deliveryAddress?: {
    city?: string;
    district?: string;
    addressLine?: string;
    postalCode?: string;
  };
  _count?: {
    items: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface OrderListProps {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Đang xử lý", color: "bg-purple-100 text-purple-800" },
  shipped: { label: "Đang giao", color: "bg-orange-100 text-orange-800" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
};

export function OrderList({
  searchTerm,
  statusFilter,
  typeFilter,
}: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Get auth headers
  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("orderType", typeFilter);
      params.append("page", "1");
      params.append("limit", "10");

      console.log("Fetching orders with params:", params.toString());

      const response = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      console.log("Orders API response:", data);

      if (data.success) {
        setOrders(data.data.items || []);
      } else {
        console.error("Failed to fetch orders:", data.message);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter, typeFilter]);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có đơn hàng nào
          </h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter || typeFilter
              ? "Không tìm thấy đơn hàng phù hợp với bộ lọc"
              : "Chưa có đơn hàng nào được tạo"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Đơn hàng
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Khách hàng
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Địa chỉ giao hàng
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Currency className="w-4 h-4" />
                  Tổng tiền
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Ngày tạo
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </div>
                    <div className="flex items-center mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusConfig[order.status.toLowerCase()]?.color ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statusConfig[order.status.toLowerCase()]?.label ||
                          order.status}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer.fullName || "Khách hàng"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.customer.phone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-gray-900">
                      {order.deliveryAddress?.city || "Chưa có địa chỉ"}
                    </div>
                    <div className="text-xs text-gray-500 max-w-xs">
                      {order.deliveryAddress?.district &&
                      order.deliveryAddress?.addressLine
                        ? `${order.deliveryAddress.district}, ${order.deliveryAddress.addressLine}`
                        : order.deliveryAddress?.district ||
                          order.deliveryAddress?.addressLine ||
                          ""}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.orderType === "PRODUCT"
                        ? `${order._count?.items || 0} sản phẩm`
                        : "Đơn tùy chỉnh"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(order.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Chi tiết
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
