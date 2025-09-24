"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CustomerForm } from "@/components/admin/customers/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/customers"
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Thêm khách hàng mới</h1>
          <p className="text-gray-300 mt-1">
            Tạo tài khoản khách hàng mới trong hệ thống
          </p>
        </div>
      </div>

      {/* Customer Form */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <CustomerForm />
      </div>
    </div>
  );
}