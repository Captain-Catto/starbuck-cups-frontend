import { AlertTriangle } from "lucide-react";
import type { Product } from "@/types";

interface ConfirmModal {
  show: boolean;
  product: Product | null;
  action: "toggle" | "delete";
}

interface ProductConfirmModalProps {
  confirmModal: ConfirmModal;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ProductConfirmModal({
  confirmModal,
  onCancel,
  onConfirm,
}: ProductConfirmModalProps) {
  if (!confirmModal.show || !confirmModal.product) return null;

  const { product, action } = confirmModal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                action === "delete" ? "bg-red-100" : "bg-yellow-100"
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 ${
                  action === "delete" ? "text-red-600" : "text-yellow-600"
                }`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {action === "delete"
                  ? "Xác nhận xóa sản phẩm"
                  : "Xác nhận thay đổi trạng thái"}
              </h3>
              <p className="text-sm text-gray-300">
                Thao tác này sẽ ảnh hưởng đến sản phẩm
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-300 mb-3">
              {action === "delete" ? (
                <>
                  Bạn có chắc chắn muốn xóa sản phẩm{" "}
                  <strong>&ldquo;{product.name}&rdquo;</strong>?
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn {product.isActive ? "tắt" : "bật"} sản
                  phẩm <strong>&ldquo;{product.name}&rdquo;</strong>?
                </>
              )}
            </p>

            <div
              className={`border rounded-lg p-3 ${
                action === "delete"
                  ? "bg-red-900 border-red-600"
                  : "bg-yellow-900 border-yellow-600"
              }`}
            >
              <p className="text-sm text-white">
                {action === "delete" ? (
                  <>
                    <strong>⚠️ Cảnh báo:</strong> Xóa sản phẩm sẽ loại bỏ hoàn
                    toàn khỏi hệ thống. Thao tác này không thể hoàn tác.
                  </>
                ) : (
                  <>
                    <strong>ℹ️ Lưu ý:</strong> Thay đổi trạng thái sẽ ảnh hưởng
                    đến việc hiển thị sản phẩm cho khách hàng.
                  </>
                )}
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
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                action === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              {action === "delete" ? "Xóa sản phẩm" : "Xác nhận"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
