"use client";

import Link from "next/link";
import {
  Eye,
  Package,
  User,
  Calendar,
  MapPin,
  CircleDollarSign,
} from "lucide-react";
import { useOrders } from "@/hooks/admin/useOrders";
import { Pagination } from "@/components/ui/Pagination";

interface OrderListProps {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  dateFrom?: string;
  dateTo?: string;
  priceRange?: string;
  freeShipping?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "bg-gray-700 text-white" },
  confirmed: { label: "Đã xác nhận", color: "bg-gray-600 text-white" },
  processing: { label: "Đang xử lý", color: "bg-gray-700 text-white" },
  shipped: { label: "Đang giao", color: "bg-gray-600 text-white" },
  delivered: { label: "Đã giao", color: "bg-gray-700 text-white" },
  cancelled: { label: "Đã hủy", color: "bg-gray-800 text-white" },
};

export function OrderList(props: OrderListProps) {
  const { orders, pagination, loading, setPage } = useOrders(props);

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
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="animate-pulse">
          {/* Table Header Skeleton */}
          <div className="bg-gray-700 px-6 py-3">
            <div className="grid grid-cols-6 gap-4">
              <div className="h-4 bg-gray-600 rounded w-20"></div>
              <div className="h-4 bg-gray-600 rounded w-24"></div>
              <div className="h-4 bg-gray-600 rounded w-28"></div>
              <div className="h-4 bg-gray-600 rounded w-20"></div>
              <div className="h-4 bg-gray-600 rounded w-20"></div>
              <div className="h-4 bg-gray-600 rounded w-16"></div>
            </div>
          </div>
          {/* Table Rows Skeleton */}
          <div className="divide-y divide-gray-700">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="px-6 py-4 bg-gray-800">
                <div className="grid grid-cols-6 gap-4 items-center">
                  {/* Order Number & Status */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-5 bg-gray-700 rounded w-20"></div>
                  </div>
                  {/* Customer */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-700 rounded w-24"></div>
                  </div>
                  {/* Address */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-28"></div>
                    <div className="h-3 bg-gray-700 rounded w-36"></div>
                  </div>
                  {/* Total Amount */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                  </div>
                  {/* Date */}
                  <div>
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                  </div>
                  {/* Actions */}
                  <div className="text-right">
                    <div className="h-8 bg-gray-700 rounded w-16 ml-auto"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
        <div className="text-center">
          <Package className="w-12 h-12 text-white mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Không có đơn hàng nào
          </h3>
          <p className="text-gray-300">
            {props.searchTerm || props.statusFilter || props.typeFilter
              ? "Không tìm thấy đơn hàng phù hợp với bộ lọc"
              : "Chưa có đơn hàng nào được tạo"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Đơn hàng
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Khách hàng
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Địa chỉ giao hàng
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="w-4 h-4" />
                  Tổng tiền
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Ngày tạo
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {orders &&
              Array.isArray(orders) &&
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {order.orderNumber}
                      </div>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            statusConfig[order.status.toLowerCase()]?.color ||
                            "bg-gray-700 text-white"
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
                      <div className="text-sm font-medium text-white">
                        {order.customer.fullName || "Khách hàng"}
                      </div>
                      <div className="text-xs text-gray-300">
                        {order.customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-white">
                        {order.deliveryAddress?.city || "Chưa có địa chỉ"}
                      </div>
                      <div className="text-xs text-gray-300 max-w-xs">
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
                      <div className="text-sm font-medium text-white">
                        {formatCurrency(order.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-300">
                        {order.orderType === "PRODUCT"
                          ? `${order._count?.items || 0} sản phẩm`
                          : "Đơn tùy chỉnh"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm text-white hover:bg-gray-700 rounded-lg transition-colors"
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

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <Pagination data={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
