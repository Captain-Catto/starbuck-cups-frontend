"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { OrderWizard } from "@/components/admin/orders/OrderWizard";

export default function NewOrderPage() {
  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Tạo đơn hàng mới</h1>
          <p className="text-gray-300 mt-1">
            Tạo đơn hàng cho khách hàng với wizard hướng dẫn từng bước
          </p>
        </div>
      </div>

      {/* Order Creation Wizard */}
      <OrderWizard />
    </div>
  );
}