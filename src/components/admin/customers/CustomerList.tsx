"use client";

import Link from "next/link";
import { Eye, Edit, Trash2, Phone, MapPin } from "lucide-react";

import { useAdminCustomers } from "@/hooks/admin/useCustomers";
import { CustomerConfirmModal } from "./CustomerConfirmModal";

interface CustomerListProps {
  searchTerm: string;
  vipStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  refreshTrigger?: number;
}

export function CustomerList({
  searchTerm,
  vipStatus = "all",
  dateFrom,
  dateTo,
  refreshTrigger,
}: CustomerListProps) {
  const {
    customers,
    loading,
    actionLoading,
    confirmModal,
    handleDelete,
    performDelete,
    setConfirmModal,
  } = useAdminCustomers();
  console.log("CustomerList render - customers:", customers);

  // TODO: Implement search filtering later
  // For now, just load all customers

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="animate-pulse">
          {/* Table Header Skeleton */}
          <div className="bg-gray-700 px-6 py-3">
            <div className="grid grid-cols-7 gap-4">
              <div className="h-4 bg-gray-600 rounded w-32"></div>
              <div className="h-4 bg-gray-600 rounded w-24"></div>
              <div className="h-4 bg-gray-600 rounded w-20"></div>
              <div className="h-4 bg-gray-600 rounded w-20"></div>
              <div className="h-4 bg-gray-600 rounded w-24"></div>
              <div className="h-4 bg-gray-600 rounded w-20"></div>
            </div>
          </div>
          {/* Table Rows Skeleton */}
          <div className="divide-y divide-gray-700">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="px-6 py-4 bg-gray-800">
                <div className="grid grid-cols-7 gap-4 items-center">
                  {/* Customer Info */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-36"></div>
                    <div className="h-3 bg-gray-700 rounded w-20"></div>
                  </div>
                  {/* Contact */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-28"></div>
                    <div className="h-3 bg-gray-700 rounded w-24"></div>
                  </div>
                  {/* Address */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                  </div>
                  {/* Status */}
                  <div>
                    <div className="h-6 bg-gray-700 rounded-full w-20"></div>
                  </div>
                  {/* Created */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-3 bg-gray-700 rounded w-20"></div>
                  </div>
                  {/* Actions */}
                  <div className="text-right">
                    <div className="flex justify-end gap-2">
                      <div className="w-8 h-8 bg-gray-700 rounded"></div>
                      <div className="w-8 h-8 bg-gray-700 rounded"></div>
                      <div className="w-8 h-8 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                Thông tin khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Địa chỉ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Được tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Tổng tiền chi tiêu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Đơn hàng cuối
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="max-w-48">
                    <div className="flex items-center gap-2">
                      <div
                        className="text-sm font-medium text-white truncate"
                        title={customer.fullName || "Chưa có tên"}
                      >
                        {customer.fullName || "Chưa có tên"}
                      </div>
                      {customer.isVip && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-900/30 text-yellow-300 border border-yellow-700">
                          VIP
                        </span>
                      )}
                    </div>
                    {customer.notes && (
                      <div
                        className="text-sm text-gray-300 truncate"
                        title={customer.notes}
                      >
                        {customer.notes}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white max-w-32">
                    {customer.addresses && customer.addresses.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div
                            className="truncate"
                            title={customer.addresses[0].city}
                          >
                            {customer.addresses[0].city}
                          </div>
                          <div className="text-gray-300 text-xs">
                            {customer.addresses.length} địa chỉ
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-300">Chưa có địa chỉ</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {formatDate(customer.createdAt)}
                  </div>
                  <div className="text-sm text-gray-300">
                    bởi {customer.createdByAdmin.username}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">
                    {formatCurrency(customer.totalSpent || 0)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {customer.lastOrderDate
                      ? formatDate(customer.lastOrderDate)
                      : "Chưa có đơn"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/customers/${customer.id}?edit=true`}
                      className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(customer)}
                      disabled={actionLoading === `delete-${customer.id}`}
                      className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
                      title="Xóa"
                    >
                      {actionLoading === `delete-${customer.id}` ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {customers.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-300">
            {searchTerm
              ? "Không tìm thấy khách hàng nào"
              : "Chưa có khách hàng nào"}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <CustomerConfirmModal
        confirmModal={confirmModal}
        onCancel={() =>
          setConfirmModal({
            show: false,
            customer: null,
            action: "delete",
          })
        }
        onConfirm={() => {
          if (confirmModal.customer) {
            performDelete(confirmModal.customer);
            setConfirmModal({
              show: false,
              customer: null,
              action: "delete",
            });
          }
        }}
      />
    </div>
  );
}
