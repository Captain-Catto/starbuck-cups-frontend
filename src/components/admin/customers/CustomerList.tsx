"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Eye, Edit, Trash2 } from "lucide-react";

import { useAdminCustomers } from "@/hooks/admin/useCustomers";
import { CustomerConfirmModal } from "./CustomerConfirmModal";
import { timeAgo } from "@/lib/utils/dateUtils";

interface CustomerListProps {
  searchTerm: string;
  vipStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function CustomerList({
  searchTerm,
  vipStatus = "all",
  dateFrom = "",
  dateTo = "",
  sortBy = "createdAt",
  sortOrder = "desc",
}: CustomerListProps) {
  const {
    customers,
    loading,
    actionLoading,
    confirmModal,
    handleDelete,
    performDelete,
    setConfirmModal,
  } = useAdminCustomers(searchTerm, vipStatus, dateFrom, dateTo);

  // Sort API results client-side since backend always returns createdAt DESC
  const sortedCustomers = useMemo(() => {
    if (!customers.length) return customers;
    return [...customers].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy) {
        case "fullName":
          aValue = a.fullName || "";
          bValue = b.fullName || "";
          break;
        case "totalSpent":
          aValue = a.totalSpent || 0;
          bValue = b.totalSpent || 0;
          break;
        case "orderCount":
          aValue = a._count?.orders || 0;
          bValue = b._count?.orders || 0;
          break;
        case "createdAt":
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      const diff = (aValue as number) > (bValue as number) ? 1 : (aValue as number) < (bValue as number) ? -1 : 0;
      return sortOrder === "asc" ? diff : -diff;
    });
  }, [customers, sortBy, sortOrder]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="animate-pulse min-w-[800px]">
            <div className="bg-gray-700 px-6 py-3 flex gap-4">
              <div className="h-4 bg-gray-600 rounded w-40"></div>
              <div className="h-4 bg-gray-600 rounded w-24"></div>
              <div className="h-4 bg-gray-600 rounded w-24"></div>
              <div className="h-4 bg-gray-600 rounded w-24"></div>
              <div className="h-4 bg-gray-600 rounded w-28"></div>
              <div className="h-4 bg-gray-600 rounded w-24"></div>
              <div className="h-4 bg-gray-600 rounded w-16 ml-auto"></div>
            </div>
            <div className="divide-y divide-gray-700">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex gap-4 items-center">
                  <div className="space-y-2 w-40 shrink-0">
                    <div className="h-4 bg-gray-700 rounded w-36"></div>
                    <div className="h-3 bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-700 rounded w-24 shrink-0"></div>
                  <div className="h-4 bg-gray-700 rounded w-24 shrink-0"></div>
                  <div className="space-y-2 w-24 shrink-0">
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="space-y-2 w-28 shrink-0">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="space-y-2 w-24 shrink-0">
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="flex justify-end gap-2 ml-auto">
                    <div className="w-8 h-8 bg-gray-700 rounded"></div>
                    <div className="w-8 h-8 bg-gray-700 rounded"></div>
                    <div className="w-8 h-8 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
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
                Đã tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Tổng tiền chi tiêu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Đơn hàng cuối
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {sortedCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-700 cursor-pointer">
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
                    {customer.customerPhones && customer.customerPhones.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-white">
                        {customer.customerPhones[0].phoneNumber}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white max-w-32">
                    {customer.addresses && customer.addresses.length > 0 ? (
                      <div className="min-w-0">
                        <div className="truncate" title={customer.addresses[0].city}>
                          {customer.addresses[0].city}
                        </div>
                        <div className="text-gray-300 text-xs">
                          {customer.addresses.length} địa chỉ
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-300">Chưa có địa chỉ</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">{timeAgo(customer.createdAt)}</div>
                  <div className="text-sm text-gray-400">{formatDate(customer.createdAt)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">
                    {formatCurrency(customer.totalSpent || 0)}
                  </div>
                  <div className="text-sm text-gray-300">
                    {customer._count?.orders || 0} đơn
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {customer.lastOrderDate ? (
                    <>
                      <div className="text-sm text-white">{timeAgo(customer.lastOrderDate)}</div>
                      <div className="text-sm text-gray-400">{formatDate(customer.lastOrderDate)}</div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-400">Chưa có đơn</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-white hover:bg-gray-700 p-1 rounded transition-colors cursor-pointer"
                      title="Xem chi tiết"
                      aria-label="Xem chi tiết khách hàng"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/customers/${customer.id}?edit=true`}
                      className="text-white hover:bg-gray-700 p-1 rounded transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                      aria-label="Chỉnh sửa khách hàng"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(customer)}
                      disabled={actionLoading === `delete-${customer.id}`}
                      className="text-white hover:bg-gray-700 p-1 rounded transition-colors cursor-pointer"
                      title="Xóa"
                      aria-label="Xóa khách hàng"
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

      {sortedCustomers.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-300">
            {searchTerm ? "Không tìm thấy khách hàng nào" : "Chưa có khách hàng nào"}
          </div>
        </div>
      )}

      <CustomerConfirmModal
        confirmModal={confirmModal}
        onCancel={() => setConfirmModal({ show: false, customer: null, action: "delete" })}
        onConfirm={() => {
          if (confirmModal.customer) {
            performDelete(confirmModal.customer);
            setConfirmModal({ show: false, customer: null, action: "delete" });
          }
        }}
      />
    </div>
  );
}
