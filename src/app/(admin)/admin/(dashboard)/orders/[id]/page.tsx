"use client";

import { useState, use } from "react";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { OrderDetail } from "@/components/admin/orders/OrderDetail";
import { OrderDetailActions } from "@/components/admin/orders/OrderDetailActions";
import { useOrderDetail } from "@/hooks/admin/useOrderDetail";
import { ErrorMessage } from "@/components/admin/ErrorMessage";
import { LoadingState } from "@/components/admin/LoadingState";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { id } = use(params);

  const { order, loading, updating, error, updateStatus, clearError } =
    useOrderDetail(id);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen space-y-4 bg-gray-900 sm:space-y-6 sm:p-6">
        <LoadingState />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen space-y-4 bg-gray-900 sm:space-y-6 sm:p-6">
        <ErrorMessage error={error} onRetry={clearError} />
      </div>
    );
  }

  // Handle no order found
  if (!order) {
    return (
      <div className="min-h-screen space-y-4 bg-gray-900 sm:space-y-6 sm:p-6">
        <ErrorMessage
          error="Không tìm thấy đơn hàng"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-4 bg-gray-900 sm:space-y-6 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Link
            href="/admin/orders"
            aria-label="Quay lại"
            className="flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-gray-700"
          >
            <ArrowLeft className="size-5 text-gray-300" />
          </Link>
          <div>
            <h1 className="truncate text-lg font-bold text-white sm:text-2xl">
              Chi tiết đơn hàng #{order.orderNumber || id}
            </h1>
            <p className="mt-1 hidden text-gray-300 sm:block">
              Xem và quản lý thông tin đơn hàng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="flex min-h-11 items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
            disabled={loading || updating}
          >
            <Edit className="size-4" />
            {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <OrderDetailActions
        orderStatus={order.status}
        updating={updating}
        onUpdateStatus={updateStatus}
      />

      {/* Order Detail */}
      <OrderDetail orderId={id} isEditing={isEditing} />
    </div>
  );
}
