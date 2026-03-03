"use client";

import { use, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerDetail } from "@/components/admin/customers/CustomerDetail";
import { useAppSelector } from "@/store";
import { toast } from "sonner";

interface CustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteCustomer = async () => {
    if (!token) {
      toast.error("Không có quyền thực hiện thao tác này");
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/customers/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Xóa khách hàng thành công");
        router.push("/admin/customers");
      } else {
        throw new Error(data.message || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Có lỗi xảy ra khi xóa khách hàng");
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

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
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-red-400 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
            Xóa
          </button>
        </div>
      </div>

      {/* Customer Detail */}
      <CustomerDetail customerId={id} />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2 text-white">
              Xác nhận xóa khách hàng
            </h3>
            <p className="text-gray-300 mb-4">
              Bạn có chắc chắn muốn xóa khách hàng này? Hành động này sẽ xóa tất
              cả thông tin liên quan bao gồm địa chỉ, số điện thoại và lịch sử
              đơn hàng. Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteCustomer}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleteLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                Xóa khách hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
