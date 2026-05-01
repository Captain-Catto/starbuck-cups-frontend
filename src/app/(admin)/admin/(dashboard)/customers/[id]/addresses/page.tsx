"use client";

import { use } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { AddressManager } from "@/components/admin/customers/AddressManager";

interface CustomerAddressesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CustomerAddressesPage({
  params,
}: CustomerAddressesPageProps) {
  const { id } = use(params);

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/customers/${id}`}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Quản lý địa chỉ
            </h1>
            <p className="text-gray-300 mt-1">
              Quản lý địa chỉ giao hàng của khách hàng
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
          <Plus className="w-4 h-4" />
          Thêm địa chỉ
        </button>
      </div>

      {/* Address Manager */}
      <AddressManager customerId={id} />
    </div>
  );
}
