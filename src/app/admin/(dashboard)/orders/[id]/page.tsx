"use client";

import { useState } from "react";
import { ArrowLeft, Edit, Truck, Package, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { OrderDetail } from "@/components/admin/orders/OrderDetail";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết đơn hàng #{params.id}
            </h1>
            <p className="text-gray-600 mt-1">
              Xem và quản lý thông tin đơn hàng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
            <Package className="w-4 h-4" />
            Cập nhật trạng thái
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
            <Truck className="w-4 h-4" />
            Giao hàng
          </button>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Edit className="w-4 h-4" />
            {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Hành động nhanh:</span>
          <button className="flex items-center gap-2 px-3 py-1 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100">
            <CheckCircle className="w-4 h-4" />
            Xác nhận đơn hàng
          </button>
          <button className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
            <Package className="w-4 h-4" />
            Bắt đầu xử lý
          </button>
          <button className="flex items-center gap-2 px-3 py-1 text-sm text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100">
            <Truck className="w-4 h-4" />
            Giao hàng
          </button>
          <button className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
            <XCircle className="w-4 h-4" />
            Hủy đơn hàng
          </button>
        </div>
      </div>

      {/* Order Detail */}
      <OrderDetail orderId={params.id} isEditing={isEditing} />
    </div>
  );
}