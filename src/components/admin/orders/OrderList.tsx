"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  Edit,
  Package,
  Truck,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    fullName?: string;
    phone?: string;
  };
  orderType: "custom" | "product";
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  totalAmount: number;
  shippingCost: number;
  isFreeShipping: boolean;
  customDescription?: string;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface OrderListProps {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
}

const statusConfig = {
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Đang xử lý", color: "bg-purple-100 text-purple-800" },
  shipped: { label: "Đang giao", color: "bg-orange-100 text-orange-800" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
};

const typeConfig = {
  product: { label: "Đơn sản phẩm", icon: Package },
  custom: { label: "Đơn tùy chỉnh", icon: Edit },
};

export function OrderList({
  searchTerm,
  statusFilter,
  typeFilter,
}: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: "1",
        orderNumber: "ORD-20240115-0001",
        customer: {
          id: "cust1",
          fullName: "Nguyễn Văn An",
          phone: "0901234567",
        },
        orderType: "product",
        status: "pending",
        totalAmount: 450000,
        shippingCost: 30000,
        isFreeShipping: false,
        itemCount: 3,
        createdAt: "2024-01-15T08:30:00Z",
        updatedAt: "2024-01-15T08:30:00Z",
      },
      {
        id: "2",
        orderNumber: "ORD-20240115-0002",
        customer: {
          id: "cust2",
          fullName: "Trần Thị Bình",
          phone: "0987654321",
        },
        orderType: "custom",
        status: "confirmed",
        totalAmount: 800000,
        shippingCost: 0,
        isFreeShipping: true,
        customDescription: "Ly Starbucks màu đỏ với logo công ty",
        createdAt: "2024-01-14T14:20:00Z",
        updatedAt: "2024-01-15T09:15:00Z",
      },
      {
        id: "3",
        orderNumber: "ORD-20240114-0003",
        customer: {
          id: "cust3",
          fullName: "Lê Hoàng Cường",
          phone: "0912345678",
        },
        orderType: "product",
        status: "shipped",
        totalAmount: 320000,
        shippingCost: 25000,
        isFreeShipping: false,
        itemCount: 2,
        createdAt: "2024-01-14T10:15:00Z",
        updatedAt: "2024-01-15T16:30:00Z",
      },
      {
        id: "4",
        orderNumber: "ORD-20240113-0004",
        customer: {
          id: "cust4",
          fullName: "Phạm Thị Dung",
          phone: "0909876543",
        },
        orderType: "product",
        status: "delivered",
        totalAmount: 650000,
        shippingCost: 0,
        isFreeShipping: true,
        itemCount: 4,
        createdAt: "2024-01-13T16:45:00Z",
        updatedAt: "2024-01-14T14:20:00Z",
      },
      {
        id: "5",
        orderNumber: "ORD-20240112-0005",
        customer: {
          id: "cust5",
          fullName: "Võ Minh Tuấn",
          phone: "0903456789",
        },
        orderType: "custom",
        status: "cancelled",
        totalAmount: 0,
        shippingCost: 0,
        isFreeShipping: false,
        customDescription: "Thiết kế đặc biệt cho sự kiện",
        createdAt: "2024-01-12T11:30:00Z",
        updatedAt: "2024-01-13T08:15:00Z",
      },
    ];

    // Apply filters
    const filteredOrders = mockOrders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.customer.phone?.includes(searchTerm);

      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesType = !typeFilter || order.orderType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    setOrders(filteredOrders);
    setLoading(false);
  }, [searchTerm, statusFilter, typeFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Danh sách đơn hàng ({orders.length})
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thông tin đơn hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại đơn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá trị
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => {
              const StatusIcon = typeConfig[order.orderType].icon;
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.orderType === "product" && order.itemCount && (
                          <span>{order.itemCount} sản phẩm</span>
                        )}
                        {order.orderType === "custom" &&
                          order.customDescription && (
                            <span className="truncate max-w-32 block">
                              {order.customDescription}
                            </span>
                          )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer.fullName || "Chưa có tên"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {typeConfig[order.orderType].label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.isFreeShipping ? (
                          <span className="text-green-600">Miễn phí ship</span>
                        ) : (
                          <span>
                            Ship: {formatCurrency(order.shippingCost)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusConfig[order.status].color
                      }`}
                    >
                      {statusConfig[order.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div>{formatDate(order.createdAt)}</div>
                        {order.updatedAt !== order.createdAt && (
                          <div className="text-xs text-gray-500">
                            Cập nhật: {formatDate(order.updatedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/orders/${order.id}?edit=true`}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      {order.status === "pending" && (
                        <button
                          className="p-2 text-green-400 hover:text-green-600 hover:bg-green-100 rounded-lg"
                          title="Xác nhận đơn hàng"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                      )}
                      {(order.status === "confirmed" ||
                        order.status === "processing") && (
                        <button
                          className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-100 rounded-lg"
                          title="Giao hàng"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="justify-center"
          />
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-500">
            {searchTerm || statusFilter || typeFilter
              ? "Không tìm thấy đơn hàng nào phù hợp"
              : "Chưa có đơn hàng nào"}
          </div>
        </div>
      )}
    </div>
  );
}
