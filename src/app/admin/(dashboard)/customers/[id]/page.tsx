"use client";

import { useState } from "react";
import { ArrowLeft, Edit, Trash2, MapPin, MessageSquare } from "lucide-react";
import Link from "next/link";
import { CustomerDetail } from "@/components/admin/customers/CustomerDetail";

interface CustomerDetailPageProps {
  params: {
    id: string;
  };
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/customers"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết khách hàng</h1>
            <p className="text-gray-600 mt-1">
              Xem và chỉnh sửa thông tin khách hàng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/customers/${params.id}/addresses`}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <MapPin className="w-4 h-4" />
            Địa chỉ
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <MessageSquare className="w-4 h-4" />
            Liên hệ
          </button>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Edit className="w-4 h-4" />
            {isEditing ? "Hủy" : "Chỉnh sửa"}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
            Xóa
          </button>
        </div>
      </div>

      {/* Customer Detail */}
      <CustomerDetail customerId={params.id} isEditing={isEditing} />
    </div>
  );
}