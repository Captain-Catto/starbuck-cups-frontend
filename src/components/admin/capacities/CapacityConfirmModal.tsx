import { AlertTriangle, Package } from "lucide-react";
import type { Capacity } from "@/types";

interface CapacityWithCount extends Capacity {
  _count?: {
    products: number;
  };
}

interface ConfirmModal {
  show: boolean;
  capacity: CapacityWithCount | null;
  action: "delete" | "toggle";
}

interface CapacityConfirmModalProps {
  confirmModal: ConfirmModal;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CapacityConfirmModal({
  confirmModal,
  onCancel,
  onConfirm,
}: CapacityConfirmModalProps) {
  if (!confirmModal.show || !confirmModal.capacity) return null;

  const { capacity, action } = confirmModal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-600 rounded-full">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {action === "delete"
                  ? "Xác nhận xóa dung tích"
                  : "Xác nhận tắt dung tích"}
              </h3>
              <p className="text-sm text-gray-500">
                Dung tích đang được sử dụng bởi sản phẩm
              </p>
            </div>
          </div>

          {/* Capacity info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-700 rounded-lg">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-medium text-white">{capacity.name}</div>
              <div className="text-sm text-gray-400">{capacity.volumeMl}ml</div>
            </div>
          </div>

          {/* Warning message */}
          <div className="mb-6">
            <p className="text-gray-300 mb-3">
              Dung tích <strong>&ldquo;{capacity.name}&rdquo;</strong> đang được
              sử dụng trong{" "}
              <strong>{capacity._count?.products || 0} sản phẩm</strong>.
            </p>

            {(capacity._count?.products || 0) > 0 && (
              <div
                className={`border rounded-lg p-3 ${
                  action === "delete"
                    ? "bg-gray-700 border-red-600"
                    : "bg-yellow-900 border-yellow-600"
                }`}
              >
                {action === "delete" ? (
                  <>
                    <h4 className="font-medium text-gray-200 mb-2">
                      ⚠️ Không thể xóa dung tích đang được sử dụng!
                    </h4>
                    <p className="text-sm text-gray-300">
                      Bạn cần xóa hoặc thay đổi dung tích của tất cả sản phẩm
                      trước khi có thể xóa dung tích này.
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="font-medium text-yellow-200 mb-2">
                      Khi tắt dung tích này:
                    </h4>
                    <ul className="text-sm text-yellow-300 space-y-1">
                      <li>• Các sản phẩm hiện tại vẫn giữ dung tích này</li>
                      <li>
                        • Dung tích sẽ không hiển thị khi tạo sản phẩm mới
                      </li>
                      <li>• Bạn có thể kích hoạt lại bất cứ lúc nào</li>
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* Show confirmation message for toggle when capacity has no products */}
            {action === "toggle" && (capacity._count?.products || 0) === 0 && (
              <div className="border rounded-lg p-3 bg-yellow-900 border-yellow-600">
                <h4 className="font-medium text-yellow-200 mb-2">
                  ⚠️ Xác nhận tắt dung tích
                </h4>
                <p className="text-sm text-yellow-300">
                  Dung tích này sẽ bị tắt và không hiển thị khi tạo sản phẩm
                  mới. Bạn có chắc chắn muốn tắt?
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {action === "delete" ? "Hủy" : "Hủy"}
            </button>

            {/* Toggle action */}
            {action === "toggle" && (
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Xác nhận tắt
              </button>
            )}

            {/* Delete action - only show confirm button if capacity is not in use */}
            {action === "delete" && (capacity._count?.products || 0) === 0 && (
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
              >
                Xác nhận xóa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
