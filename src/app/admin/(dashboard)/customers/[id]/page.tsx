"use client";

import { useState, use } from "react";
import { ArrowLeft, Edit, Trash2, MapPin } from "lucide-react";
import Link from "next/link";
import { CustomerDetail } from "@/components/admin/customers/CustomerDetail";

interface CustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { id } = use(params);

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/customers"
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Chi tiết khách hàng
            </h1>
            <p className="text-gray-300 mt-1">
              Xem và chỉnh sửa thông tin khách hàng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing && (
            <Link
              href={`/admin/customers/${id}/addresses`}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700"
            >
              <MapPin className="w-4 h-4" />
              Địa chỉ
            </Link>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            <Edit className="w-4 h-4" />
            {isEditing ? "Hủy" : "Chỉnh sửa"}
          </button>
          {!isEditing && (
            <button className="flex items-center gap-2 px-4 py-2 text-gray-400 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700">
              <Trash2 className="w-4 h-4" />
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* Customer Detail */}
      <CustomerDetail customerId={id} isEditing={isEditing} />
    </div>
  );
}
