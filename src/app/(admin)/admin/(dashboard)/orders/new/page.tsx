"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { OrderWizard } from "@/components/admin/orders/OrderWizard";

export default function NewOrderPage() {
  return (
    <div className="min-h-screen space-y-4 bg-gray-900 sm:space-y-6 sm:p-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="size-5 text-gray-300" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white sm:text-2xl">Tạo đơn hàng mới</h1>
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