import { AlertTriangle } from "lucide-react";
import type { CustomerAdmin } from "@/hooks/admin/useCustomers";

interface ConfirmModal {
  show: boolean;
  customer: CustomerAdmin | null;
  action: "delete";
}

interface CustomerConfirmModalProps {
  confirmModal: ConfirmModal;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CustomerConfirmModal({
  confirmModal,
  onCancel,
  onConfirm,
}: CustomerConfirmModalProps) {
  if (!confirmModal.show || !confirmModal.customer) return null;

  const { customer } = confirmModal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Xác nhận xóa khách hàng
              </h3>
              <p className="text-sm text-gray-300">
                Thao tác này không thể hoàn tác
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-300 mb-3">
              Bạn có chắc chắn muốn xóa khách hàng{" "}
              <strong>
                &ldquo;{customer.fullName || customer.messengerId}&rdquo;
              </strong>
              ?
            </p>

            <div className="border rounded-lg p-3 bg-red-900 border-red-600">
              <p className="text-sm text-white">
                <strong>⚠️ Cảnh báo:</strong> Xóa khách hàng sẽ xóa toàn bộ
                thông tin, địa chỉ và lịch sử liên quan. Thao tác này không thể
                hoàn tác.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 text-white rounded-lg transition-colors bg-red-600 hover:bg-red-700"
            >
              Xóa khách hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
