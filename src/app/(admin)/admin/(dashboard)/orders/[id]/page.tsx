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
      <div className="space-y-6 bg-gray-900 min-h-screen p-6">
        <LoadingState />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6 bg-gray-900 min-h-screen p-6">
        <ErrorMessage error={error} onRetry={clearError} />
      </div>
    );
  }

  // Handle no order found
  if (!order) {
    return (
      <div className="space-y-6 bg-gray-900 min-h-screen p-6">
        <ErrorMessage
          error="Không tìm thấy đơn hàng"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Chi tiết đơn hàng #{order.orderNumber || id}
            </h1>
            <p className="text-gray-300 mt-1">
              Xem và quản lý thông tin đơn hàng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            disabled={loading || updating}
          >
            <Edit className="w-4 h-4" />
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
