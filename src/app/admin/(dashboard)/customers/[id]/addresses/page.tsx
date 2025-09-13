"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { AddressManager } from "@/components/admin/customers/AddressManager";

interface CustomerAddressesPageProps {
  params: {
    id: string;
  };
}

export default function CustomerAddressesPage({ params }: CustomerAddressesPageProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/customers/${params.id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý địa chỉ</h1>
            <p className="text-gray-600 mt-1">
              Quản lý địa chỉ giao hàng của khách hàng
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Plus className="w-4 h-4" />
          Thêm địa chỉ
        </button>
      </div>

      {/* Address Manager */}
      <AddressManager customerId={params.id} />
    </div>
  );
}